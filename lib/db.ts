import "server-only";

/**
 * Tiny database layer.
 * - Production (Hostinger): MySQL via DATABASE_URL=mysql://user:pass@127.0.0.1:3306/db
 * - Local preview: a SQLite file in ./local-data (no setup needed)
 * Only plain SQL that works on both is used.
 */

type Row = Record<string, any>;
type Driver = {
  all(sql: string, params?: any[]): Promise<Row[]>;
  run(sql: string, params?: any[]): Promise<{ changes: number }>;
};

const MYSQL_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY, email VARCHAR(191) UNIQUE, phone VARCHAR(20) UNIQUE, created_at BIGINT NOT NULL
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS login_codes (
    email VARCHAR(191) PRIMARY KEY, code_hash VARCHAR(64) NOT NULL, expires_at BIGINT NOT NULL,
    attempts INT NOT NULL DEFAULT 0, sent_count INT NOT NULL DEFAULT 0, window_start BIGINT NOT NULL
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    k VARCHAR(191) PRIMARY KEY, hits INT NOT NULL DEFAULT 0, window_start BIGINT NOT NULL
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash VARCHAR(64) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, expires_at BIGINT NOT NULL
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, product_slug VARCHAR(120) NOT NULL,
    amount INT NOT NULL, coupon_code VARCHAR(60), razorpay_order_id VARCHAR(60) UNIQUE,
    razorpay_payment_id VARCHAR(60), status VARCHAR(20) NOT NULL, created_at BIGINT NOT NULL, paid_at BIGINT
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS purchases (
    user_id VARCHAR(36) NOT NULL, product_slug VARCHAR(120) NOT NULL, order_id VARCHAR(36),
    progress INT NOT NULL DEFAULT 0, created_at BIGINT NOT NULL, PRIMARY KEY (user_id, product_slug)
  ) CHARACTER SET utf8mb4`,
  // One-tap sign-in sent after a guest checkout pays — no code to type. See lib/magicLink.ts.
  `CREATE TABLE IF NOT EXISTS magic_links (
    token_hash VARCHAR(64) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, expires_at BIGINT NOT NULL, used_at BIGINT
  ) CHARACTER SET utf8mb4`,
];

// Columns added after the first release. Each runs once; "duplicate column" errors are ignored.
const MIGRATIONS = [
  "ALTER TABLE purchases ADD COLUMN expires_at BIGINT NULL",
  // Mobile login: users may sign up with a phone only, so email becomes optional.
  "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL",
  "CREATE UNIQUE INDEX users_phone ON users (phone)",
  "ALTER TABLE users MODIFY email VARCHAR(191) NULL",
  "ALTER TABLE sessions ADD COLUMN created_at BIGINT NULL",
  // Checkout info (name/WhatsApp/address) collected alongside payment, and the owner's
  // super-admin activate/deactivate switch.
  "ALTER TABLE users ADD COLUMN name VARCHAR(191) NULL",
  "ALTER TABLE users ADD COLUMN whatsapp VARCHAR(20) NULL",
  "ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL",
  "ALTER TABLE users ADD COLUMN city VARCHAR(120) NULL",
  "ALTER TABLE users ADD COLUMN active TINYINT(1) NULL DEFAULT 1",
];

// SQLite accepts the same statements once the MySQL-only table option is removed.
const SQLITE_SCHEMA = MYSQL_SCHEMA.map((s) => s.replace(/\s*CHARACTER SET utf8mb4$/, ""));

async function mysqlDriver(url: string): Promise<Driver> {
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({ uri: url, connectionLimit: 5, charset: "utf8mb4" });
  for (const s of MYSQL_SCHEMA) await pool.query(s);
  for (const m of MIGRATIONS) await pool.query(m).catch(() => {});
  return {
    async all(sql, params = []) {
      const [rows] = await pool.query(sql, params);
      return rows as Row[];
    },
    async run(sql, params = []) {
      const [res]: any = await pool.query(sql, params);
      return { changes: res.affectedRows ?? 0 };
    },
  };
}

async function sqliteDriver(): Promise<Driver> {
  const fs = await import("fs");
  const path = await import("path");
  const sqliteModule = "node:sqlite"; // built into Node 22.5+, used only for local preview
  const { DatabaseSync } = (await import(/* webpackIgnore: true */ sqliteModule)) as any;
  const dir = path.join(process.cwd(), "local-data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "preview.sqlite"));
  for (const s of SQLITE_SCHEMA) db.exec(s);
  for (const m of MIGRATIONS) { try { db.exec(m.replace(" NULL", "")); } catch { /* already added */ } }
  // SQLite cannot drop NOT NULL with ALTER: rebuild an old preview users table once so email can be empty.
  const emailCol = (db.prepare("PRAGMA table_info(users)").all() as Row[]).find((c) => c.name === "email");
  if (emailCol?.notnull) {
    db.exec(`BEGIN;
      CREATE TABLE users_new (id VARCHAR(36) PRIMARY KEY, email VARCHAR(191) UNIQUE, phone VARCHAR(20) UNIQUE, created_at BIGINT NOT NULL);
      INSERT INTO users_new (id, email, phone, created_at) SELECT id, email, phone, created_at FROM users;
      DROP TABLE users; ALTER TABLE users_new RENAME TO users; COMMIT;`);
  }
  return {
    async all(sql, params = []) {
      return db.prepare(sql).all(...params) as Row[];
    },
    async run(sql, params = []) {
      const r = db.prepare(sql).run(...params);
      return { changes: Number(r.changes) };
    },
  };
}

let driver: Promise<Driver> | null = null;

function getDriver() {
  if (!driver) {
    const url = process.env.DATABASE_URL || "";
    if (url.startsWith("mysql://")) driver = mysqlDriver(url);
    else if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL (MySQL) is required in production");
    else driver = sqliteDriver();
    driver.catch(() => { driver = null; });
  }
  return driver;
}

export async function all<T = Row>(sql: string, params: any[] = []) {
  return (await (await getDriver()).all(sql, params)) as T[];
}

export async function one<T = Row>(sql: string, params: any[] = []) {
  return (await all<T>(sql, params))[0] ?? null;
}

export async function run(sql: string, params: any[] = []) {
  return (await getDriver()).run(sql, params);
}

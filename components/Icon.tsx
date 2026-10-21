const PATHS: Record<string, string> = {
  home: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z",
  book: "M4 19V5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM8 7h7",
  video: "M3 5h18v13H3zM10 9l5 2.5-5 2.5z",
  bundle: "M3 8h18v12H3zM3 8l3-4h12l3 4M12 8v12",
  gift: "M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H8a2.5 2.5 0 110-5c3 0 4 5 4 5zM12 7h4a2.5 2.5 0 100-5c-3 0-4 5-4 5z",
  library: "M4 5h5v14H4zM10 5h5v14h-5zM16 6l4 1-3 13-4-1",
  help: "M4 14v-2a8 8 0 0116 0v2M4 14h3v5H5a1 1 0 01-1-1zM20 14h-3v5h2a1 1 0 001-1z",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  chevron: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  down: "M6 9l6 6 6-6",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  mail: "M3 5h18v14H3zM3 7l9 6 9-6",
  chat: "M21 12a9 9 0 01-13.5 7.8L3 21l1.2-4.5A9 9 0 1121 12z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  logout: "M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l5-5-5-5M15 12H3",
  zoomin: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4M8 11h6M11 8v6",
  zoomout: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4M8 11h6",
  play: "M8 5v14l11-7z",
  check: "M5 12l5 5L20 7",
  tag: "M3 12V3h9l9 9-9 9zM7.5 7.5h.01",
  alert: "M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  refund: "M3 12a9 9 0 109-9M3 4v5h5",
  card: "M3 6h18v12H3zM3 10h18",
  menu: "M4 7h16M4 12h12M4 17h16",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 018 0v4",
};

export function Icon({ name, size = 22, className = "", strokeWidth = 1.8 }: { name: keyof typeof PATHS | string; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}

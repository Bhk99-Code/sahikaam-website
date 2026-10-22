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
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z",
  factory: "M3 21V10l6 4V10l6 4V6h6v15zM7 17h2M12 17h2M17 17h2",
  hammer: "M14 6l4 4M3 21l9-9M12.5 4.5l7 7-2.5 2.5-7-7z",
  coins: "M8 8a5 3 0 1010 0 5 3 0 10-10 0zM8 8v4c0 1.7 2.2 3 5 3s5-1.3 5-3V8M6 12a5 3 0 105 3",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  x: "M6 6l12 12M18 6L6 18",
  leaf: "M5 19c8 0 14-6 14-14C11 5 5 11 5 19zM5 19l7-7",
  bank: "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z",
};

export function Icon({ name, size = 22, className = "", strokeWidth = 1.8 }: { name: keyof typeof PATHS | string; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}

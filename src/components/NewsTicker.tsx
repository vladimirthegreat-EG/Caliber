import { useEffect, useRef } from "react";
import { colors } from "../data/colors";

interface NewsItem {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
}

const defaultNews: NewsItem[] = [
  { text: "Global smartphone demand surges 12% — premium segment leads growth", sentiment: "positive" },
  { text: "Raw material costs spike amid supply chain disruptions in Southeast Asia", sentiment: "negative" },
  { text: "Central bank holds interest rates steady at 4.25%", sentiment: "neutral" },
  { text: "Consumer confidence index rises to 108.3, highest in 6 quarters", sentiment: "positive" },
  { text: "New EU tariffs on electronics imports take effect next round", sentiment: "negative" },
  { text: "Industry analysts predict consolidation wave in mid-tier market", sentiment: "neutral" },
  { text: "ESG-rated companies outperform market by 3.2% this quarter", sentiment: "positive" },
  { text: "Labor shortage in engineering talent pushes salary benchmarks up 8%", sentiment: "negative" },
];

const sentimentColor = (s: NewsItem["sentiment"]) =>
  s === "positive" ? colors.green : s === "negative" ? colors.red : colors.accentGold;

export function NewsTicker({ items = defaultNews }: { items?: NewsItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      offsetRef.current -= 0.5;
      if (Math.abs(offsetRef.current) > el.scrollWidth / 2) {
        offsetRef.current = 0;
      }
      el.style.transform = `translateX(${offsetRef.current}px)`;
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div
      className="w-full h-7 flex items-center overflow-hidden select-none"
      style={{ background: "#060a12", borderBottom: `1px solid ${colors.border}` }}
    >
      {/* LIVE indicator */}
      <div className="flex items-center gap-1.5 px-3 shrink-0">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
          style={{ background: colors.red }}
        />
        <span
          className="font-mono text-[10px] font-bold tracking-widest"
          style={{ color: colors.red }}
        >
          LIVE
        </span>
      </div>

      {/* Scrolling news */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="flex items-center whitespace-nowrap gap-8">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-2 font-mono text-[11px]">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: sentimentColor(item.sentiment) }}
              />
              <span style={{ color: colors.textMuted }}>{item.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

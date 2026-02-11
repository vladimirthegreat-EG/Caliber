import { colors } from "../data/colors";

interface StatusBarProps {
  marketCap?: number;
  eps?: number;
  creditRating?: string;
  esgScore?: number;
  brandValue?: number;
  economyCycle?: string;
  sentiment?: string;
}

const fmt = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
};

export function StatusBar({
  marketCap = 245_000_000,
  eps = 2.14,
  creditRating = "BBB",
  esgScore = 340,
  brandValue = 62,
  economyCycle = "Expansion",
  sentiment = "Bullish",
}: StatusBarProps) {
  return (
    <div
      className="h-8 w-full flex items-center justify-between px-4 select-none"
      style={{ background: colors.bgPanel, borderTop: `1px solid ${colors.border}` }}
    >
      {/* Left metrics */}
      <div className="flex items-center gap-5 text-[11px]">
        <Metric label="Mkt Cap" value={fmt(marketCap)} color={colors.textPrimary} />
        <Metric label="EPS" value={`$${eps.toFixed(2)}`} color={colors.green} />
        <Metric label="Credit" value={creditRating} color={colors.accentGold} />
        <Metric label="ESG" value={`${esgScore}`} color={colors.orange} />
        <Metric label="Brand" value={`${brandValue}%`} color={colors.cyan} />
      </div>

      {/* Right info */}
      <div className="flex items-center gap-5 text-[11px]">
        <Metric label="Economy" value={economyCycle} color={colors.green} />
        <Metric label="Sentiment" value={sentiment} color={colors.accentGold} />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: colors.textDim }}>{label}</span>
      <span className="font-mono font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

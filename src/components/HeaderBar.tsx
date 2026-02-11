import { colors } from "../data/colors";

export type ViewId = "factory" | "map" | "finance" | "rd" | "marketing" | "results" | "facilitator";

interface HeaderBarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  round?: number;
  maxRounds?: number;
  teamName?: string;
  cash?: number;
}

const views: { id: ViewId; label: string }[] = [
  { id: "factory", label: "Factory" },
  { id: "map", label: "Global Ops" },
  { id: "finance", label: "Finance" },
  { id: "rd", label: "R&D" },
  { id: "marketing", label: "Marketing" },
  { id: "results", label: "Results" },
];

const formatCash = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
};

export function HeaderBar({
  activeView,
  onViewChange,
  round = 1,
  maxRounds = 8,
  teamName = "Acme Corp",
  cash = 200_000_000,
}: HeaderBarProps) {
  return (
    <div
      className="h-11 w-full flex items-center px-4 gap-4 select-none"
      style={{ background: colors.bgPanel, borderBottom: `1px solid ${colors.border}` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-0 shrink-0">
        <span className="text-[15px] font-bold" style={{ color: colors.accentGold }}>SIM</span>
        <span className="text-[15px] font-bold" style={{ color: colors.textPrimary }}>CORP</span>
      </div>

      {/* Divider */}
      <div className="w-px h-5" style={{ background: colors.border }} />

      {/* Round + Team */}
      <div className="flex items-center gap-3 shrink-0 text-[13px]">
        <span style={{ color: colors.textMuted }}>
          Round <span className="font-mono font-bold" style={{ color: colors.accentGold }}>{round}</span>/{maxRounds}
        </span>
        <span style={{ color: colors.textDim }}>|</span>
        <span style={{ color: colors.textMuted }}>
          Team: <span style={{ color: colors.textPrimary }}>{teamName}</span>
        </span>
      </div>

      {/* View toggles — centered */}
      <div className="flex-1 flex justify-center gap-1">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className="px-3 py-1 text-[12px] font-medium rounded-md transition-all duration-150"
            style={{
              background: activeView === v.id ? colors.bgSurface : "transparent",
              border: activeView === v.id ? `1px solid ${colors.border}` : "1px solid transparent",
              color: activeView === v.id ? colors.textPrimary : colors.textMuted,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Cash + Submit */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="font-mono text-[13px] font-bold" style={{ color: colors.green }}>
          {formatCash(cash)}
        </span>
        <button
          className="px-4 py-1.5 text-[11px] font-bold tracking-wide rounded-md transition-opacity hover:opacity-80"
          style={{ background: colors.green, color: "#0a0e17" }}
        >
          SUBMIT DECISIONS
        </button>
      </div>
    </div>
  );
}

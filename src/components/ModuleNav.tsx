import { colors } from "../data/colors";

export type ModuleId = "factory" | "hr" | "rd" | "marketing" | "finance";

interface ModuleNavProps {
  activeModule: ModuleId;
  onModuleChange: (mod: ModuleId) => void;
  visible?: boolean;
}

const modules: { id: ModuleId; label: string; color: string }[] = [
  { id: "factory", label: "Factory", color: colors.moduleFactory },
  { id: "hr", label: "HR", color: colors.moduleHR },
  { id: "rd", label: "R&D", color: colors.moduleRD },
  { id: "marketing", label: "Marketing", color: colors.moduleMarketing },
  { id: "finance", label: "Finance", color: colors.moduleFinance },
];

export function ModuleNav({ activeModule, onModuleChange, visible = true }: ModuleNavProps) {
  if (!visible) return null;

  return (
    <div
      className="h-10 w-full flex items-center px-4 gap-1 select-none"
      style={{
        background: "rgba(26,32,53,0.5)",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {modules.map((m) => {
        const isActive = activeModule === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModuleChange(m.id)}
            className="px-4 py-1.5 text-[12px] rounded-t transition-all duration-200 relative"
            style={{
              background: isActive ? `${m.color}15` : "transparent",
              color: isActive ? m.color : colors.textMuted,
              fontWeight: isActive ? 600 : 400,
              borderBottom: isActive ? `2px solid ${m.color}` : "2px solid transparent",
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

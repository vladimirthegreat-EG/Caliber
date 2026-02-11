import { useState } from "react";
import { NewsTicker } from "./components/NewsTicker";
import { HeaderBar, ViewId } from "./components/HeaderBar";
import { ModuleNav, ModuleId } from "./components/ModuleNav";
import { StatusBar } from "./components/StatusBar";
import { FactoryFloor } from "./views/FactoryFloor";
import { colors } from "./data/colors";

function App() {
  const [activeView, setActiveView] = useState<ViewId>("factory");
  const [activeModule, setActiveModule] = useState<ModuleId>("factory");

  // Module nav only shows on factory view
  const showModuleNav = activeView === "factory";
  // Panel hidden for results/facilitator (full-width viewport)
  const showPanel = activeView !== "results" && activeView !== "facilitator";

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      {/* News Ticker */}
      <NewsTicker />

      {/* Header Bar */}
      <HeaderBar
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Module Nav (factory view only) */}
      <ModuleNav
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        visible={showModuleNav}
      />

      {/* Main Area: Viewport + Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Viewport */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-4">
          <Viewport view={activeView} module={activeModule} />
        </div>

        {/* Right Panel */}
        {showPanel && (
          <div
            className="w-[260px] shrink-0 overflow-y-auto p-4"
            style={{
              background: colors.bgPanel,
              borderLeft: `1px solid ${colors.border}`,
            }}
          >
            <PanelPlaceholder view={activeView} module={activeModule} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

function Viewport({ view, module }: { view: ViewId; module: ModuleId }) {
  // Factory view renders the live factory floor
  if (view === "factory") {
    return (
      <div className="animate-fade-in">
        <FactoryFloor />
      </div>
    );
  }

  // Other views: placeholders for now
  const viewLabels: Record<ViewId, string> = {
    factory: "",
    map: "Global Operations Map",
    finance: "Financial Dashboard",
    rd: "R&D Lab & Tech Tree",
    marketing: "Marketing War Room",
    results: "Round Results",
    facilitator: "Facilitator War Room",
  };

  const icons: Record<ViewId, string> = {
    factory: "",
    map: "🌍",
    finance: "💰",
    rd: "🔬",
    marketing: "📊",
    results: "🏆",
    facilitator: "⚙️",
  };

  return (
    <div className="text-center animate-fade-in">
      <div
        className="w-[896px] h-[616px] rounded-lg flex flex-col items-center justify-center gap-4"
        style={{
          background: view === "map" ? "#080c14" : colors.bgSurface,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="text-[40px]">{icons[view]}</div>
        <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
          {viewLabels[view]}
        </h2>
        <p className="text-xs" style={{ color: colors.textDim }}>
          Coming soon
        </p>
      </div>
    </div>
  );
}

function PanelPlaceholder({ view, module }: { view: ViewId; module: ModuleId }) {
  const panelFor = view === "factory" ? module : view;
  return (
    <div>
      <h3
        className="text-[11px] font-bold tracking-wider uppercase mb-4"
        style={{ color: colors.textDim }}
      >
        {panelFor} Panel
      </h3>
      <div
        className="rounded p-3 text-[12px]"
        style={{ background: colors.bgSurface, color: colors.textMuted }}
      >
        Panel controls for <span style={{ color: colors.textPrimary }}>{panelFor}</span> will go here.
      </div>
    </div>
  );
}

export default App;

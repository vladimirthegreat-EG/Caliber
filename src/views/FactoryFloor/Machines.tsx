import { useState, useCallback } from "react";
import { colors } from "../../data/colors";

type MachineType = "assembly" | "cnc" | "injection" | "quality" | "packaging";
type MachineStatus = "running" | "maintenance" | "idle";

interface MachineDef {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  efficiency: number;
  output: number; // units/hr
  // Position in cell coords (within production zone)
  col: number;
  row: number;
  w: number;
  h: number;
}

const machines: MachineDef[] = [
  { id: "m1", name: "Assembly Line A", type: "assembly", status: "running", efficiency: 92, output: 420, col: 1, row: 2, w: 5, h: 2 },
  { id: "m2", name: "Assembly Line B", type: "assembly", status: "running", efficiency: 88, output: 380, col: 1, row: 5, w: 5, h: 2 },
  { id: "m3", name: "Assembly Line C", type: "assembly", status: "maintenance", efficiency: 0, output: 0, col: 1, row: 9, w: 5, h: 2 },
  { id: "m4", name: "CNC Router #1", type: "cnc", status: "running", efficiency: 95, output: 180, col: 7, row: 2, w: 3, h: 3 },
  { id: "m5", name: "CNC Router #2", type: "cnc", status: "running", efficiency: 91, output: 170, col: 7, row: 6, w: 3, h: 3 },
  { id: "m6", name: "Injection Mold", type: "injection", status: "running", efficiency: 87, output: 560, col: 11, row: 2, w: 3, h: 4 },
  { id: "m7", name: "Injection Mold B", type: "injection", status: "idle", efficiency: 0, output: 0, col: 11, row: 7, w: 3, h: 4 },
  { id: "m8", name: "Quality Check", type: "quality", status: "running", efficiency: 98, output: 900, col: 15, row: 2, w: 4, h: 3 },
  { id: "m9", name: "Quality Check B", type: "quality", status: "running", efficiency: 96, output: 850, col: 15, row: 6, w: 4, h: 3 },
  { id: "m10", name: "Packaging Unit", type: "packaging", status: "running", efficiency: 94, output: 750, col: 15, row: 10, w: 4, h: 3 },
];

interface MachinesProps {
  cellSize: number;
  tick: number;
}

export function Machines({ cellSize, tick }: MachinesProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGGElement>) => {
    const svg = e.currentTarget.closest("svg");
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setMousePos({ x: svgPt.x, y: svgPt.y });
  }, []);

  return (
    <g onMouseMove={handleMouseMove}>
      {machines.map((m, idx) => {
        const px = m.col * cellSize + 4;
        const py = m.row * cellSize + 4;
        const pw = m.w * cellSize - 8;
        const ph = m.h * cellSize - 8;
        const isHovered = hovered === m.id;

        // Pulse glow for running machines
        const glowOpacity = m.status === "running"
          ? (0.5 + 0.5 * Math.sin(tick * 0.3 + idx)) * 0.25
          : 0;

        // LED pulse for maintenance
        const ledOpacity = m.status === "maintenance"
          ? 0.4 + 0.6 * Math.abs(Math.sin(tick * 0.4 + idx))
          : 1;

        const ledColor = m.status === "running" ? colors.green
          : m.status === "maintenance" ? colors.orange
          : colors.textDim;

        return (
          <g
            key={m.id}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Machine body */}
            <rect
              x={px}
              y={py}
              width={pw}
              height={ph}
              fill="#1e2d3d"
              stroke={isHovered ? colors.accentGold : "#2a4055"}
              strokeWidth={isHovered ? 2 : 1.5}
              rx={4}
            />

            {/* Type-specific details */}
            <MachineDetail type={m.type} x={px} y={py} w={pw} h={ph} />

            {/* Running glow overlay */}
            {m.status === "running" && (
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                fill={colors.machineActive}
                opacity={glowOpacity}
                rx={4}
                pointerEvents="none"
              />
            )}

            {/* Status LED */}
            <circle
              cx={px + pw - 8}
              cy={py + 8}
              r={4}
              fill={ledColor}
              opacity={ledOpacity}
            />
            {/* LED glow */}
            <circle
              cx={px + pw - 8}
              cy={py + 8}
              r={7}
              fill={ledColor}
              opacity={ledOpacity * 0.2}
            />

            {/* Machine name */}
            <text
              x={px + pw / 2}
              y={py + ph / 2 + 3}
              fill="#c8d6e5"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="middle"
              pointerEvents="none"
            >
              {m.name}
            </text>
          </g>
        );
      })}

      {/* Tooltip */}
      {hovered && <MachineTooltip machine={machines.find((m) => m.id === hovered)!} x={mousePos.x} y={mousePos.y} />}
    </g>
  );
}

function MachineDetail({ type, x, y, w, h }: { type: MachineType; x: number; y: number; w: number; h: number }) {
  const detailColor = "#3a5570";

  switch (type) {
    case "assembly":
      // Conveyor belt dashes through center
      return (
        <line
          x1={x + 8}
          y1={y + h / 2}
          x2={x + w - 8}
          y2={y + h / 2}
          stroke={detailColor}
          strokeWidth={3}
          strokeDasharray="6 4"
          strokeLinecap="round"
          pointerEvents="none"
        />
      );

    case "cnc":
      // Circular spinning element
      return (
        <circle
          cx={x + w / 2}
          cy={y + h / 2}
          r={Math.min(w, h) * 0.25}
          fill="none"
          stroke={detailColor}
          strokeWidth={2}
          strokeDasharray="4 3"
          pointerEvents="none"
        />
      );

    case "injection":
      // Funnel shape on top
      return (
        <g pointerEvents="none">
          <polygon
            points={`${x + w / 2 - 12},${y + 12} ${x + w / 2 + 12},${y + 12} ${x + w / 2 + 5},${y + 25} ${x + w / 2 - 5},${y + 25}`}
            fill={detailColor}
          />
          <rect
            x={x + w / 2 - 4}
            y={y + 25}
            width={8}
            height={h * 0.4}
            fill={detailColor}
            rx={1}
          />
        </g>
      );

    case "quality":
      // Magnifying glass
      return (
        <g pointerEvents="none">
          <circle
            cx={x + w / 2 - 5}
            cy={y + h / 2 - 5}
            r={10}
            fill="none"
            stroke={detailColor}
            strokeWidth={2}
          />
          <line
            x1={x + w / 2 + 3}
            y1={y + h / 2 + 3}
            x2={x + w / 2 + 12}
            y2={y + h / 2 + 12}
            stroke={detailColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      );

    case "packaging":
      // Small box shapes
      return (
        <g pointerEvents="none" opacity={0.6}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={x + 12 + i * (w / 3.5)}
              y={y + h / 2 - 5}
              width={w / 5}
              height={w / 5}
              fill={detailColor}
              rx={1}
              stroke="#4a6580"
              strokeWidth={0.5}
            />
          ))}
        </g>
      );

    default:
      return null;
  }
}

function MachineTooltip({ machine, x, y }: { machine: MachineDef; x: number; y: number }) {
  const tw = 180;
  const th = 100;
  // Keep tooltip inside SVG bounds
  const tx = Math.min(x + 12, 896 - tw - 10);
  const ty = Math.max(y - th / 2, 10);

  const statusColor = machine.status === "running" ? colors.green
    : machine.status === "maintenance" ? colors.orange
    : colors.textDim;

  const effColor = machine.efficiency >= 90 ? colors.green
    : machine.efficiency >= 70 ? colors.accentGold
    : colors.red;

  return (
    <g pointerEvents="none">
      {/* Background */}
      <rect
        x={tx}
        y={ty}
        width={tw}
        height={th}
        fill={colors.bgPanel}
        stroke={colors.border}
        strokeWidth={1}
        rx={8}
        filter="url(#tooltip-shadow)"
      />

      {/* Name */}
      <text x={tx + 12} y={ty + 20} fill={colors.textPrimary} fontSize={13} fontWeight={700}>
        {machine.name}
      </text>

      {/* Status */}
      <circle cx={tx + 12} cy={ty + 36} r={4} fill={statusColor} />
      <text x={tx + 22} y={ty + 40} fill={statusColor} fontSize={11} fontFamily="'JetBrains Mono', monospace" textTransform="capitalize">
        {machine.status}
      </text>

      {/* Efficiency */}
      <text x={tx + 12} y={ty + 58} fill={colors.textMuted} fontSize={10}>Efficiency</text>
      <text x={tx + tw - 12} y={ty + 58} fill={effColor} fontSize={11} fontFamily="'JetBrains Mono', monospace" fontWeight={700} textAnchor="end">
        {machine.efficiency}%
      </text>

      {/* Output */}
      <text x={tx + 12} y={ty + 76} fill={colors.textMuted} fontSize={10}>Output</text>
      <text x={tx + tw - 12} y={ty + 76} fill={colors.cyan} fontSize={11} fontFamily="'JetBrains Mono', monospace" fontWeight={700} textAnchor="end">
        {machine.output.toLocaleString()} u/hr
      </text>

      {/* Type */}
      <text x={tx + 12} y={ty + 92} fill={colors.textDim} fontSize={9} fontFamily="'JetBrains Mono', monospace">
        TYPE: {machine.type.toUpperCase()}
      </text>
    </g>
  );
}

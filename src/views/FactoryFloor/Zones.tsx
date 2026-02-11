import { colors } from "../../data/colors";

interface ZoneDef {
  id: string;
  label: string;
  fill: string;
  x: number; y: number;
  w: number; h: number;
}

// Zone layout on the 32x22 grid (in cell units)
const zones: ZoneDef[] = [
  { id: "production", label: "PRODUCTION FLOOR", fill: colors.zoneProd, x: 0, y: 0, w: 20, h: 14 },
  { id: "engineering", label: "ENGINEERING", fill: colors.zoneEng, x: 20, y: 0, w: 12, h: 8 },
  { id: "rd-lab", label: "R&D LAB", fill: colors.zoneLab, x: 20, y: 8, w: 12, h: 6 },
  { id: "warehouse", label: "WAREHOUSE", fill: colors.zoneWarehouse, x: 0, y: 14, w: 10, h: 8 },
  { id: "loading-dock", label: "LOADING DOCK", fill: colors.zoneDock, x: 10, y: 14, w: 10, h: 8 },
  { id: "admin", label: "ADMIN / HR", fill: colors.zoneAdmin, x: 20, y: 14, w: 12, h: 4 },
  { id: "breakroom", label: "BREAK ROOM", fill: colors.zoneBreak, x: 20, y: 18, w: 12, h: 4 },
];

function lighten(hex: string, amt: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amt);
  const g = Math.min(255, ((num >> 8) & 0xff) + amt);
  const b = Math.min(255, (num & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darken(hex: string, amt: number): string {
  return lighten(hex, -amt);
}

interface ZonesProps {
  cellSize: number;
}

export function Zones({ cellSize }: ZonesProps) {
  return (
    <g>
      {zones.map((z) => {
        const px = z.x * cellSize;
        const py = z.y * cellSize;
        const pw = z.w * cellSize;
        const ph = z.h * cellSize;
        const strokeColor = lighten(z.fill, 25);

        return (
          <g key={z.id}>
            {/* Zone background */}
            <rect
              x={px + 2}
              y={py + 2}
              width={pw - 4}
              height={ph - 4}
              fill={z.fill}
              stroke={strokeColor}
              strokeWidth={3}
              rx={6}
            />

            {/* Label plaque */}
            <rect
              x={px + 10}
              y={py + 8}
              width={z.label.length * 6.5 + 12}
              height={16}
              fill={darken(z.fill, 20)}
              rx={3}
            />
            <text
              x={px + 16}
              y={py + 20}
              fill={lighten(z.fill, 80)}
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={500}
              letterSpacing={1}
            >
              {z.label}
            </text>

            {/* Zone-specific furniture */}
            <ZoneFurniture zone={z} cellSize={cellSize} />
          </g>
        );
      })}
    </g>
  );
}

function ZoneFurniture({ zone, cellSize }: { zone: ZoneDef; cellSize: number }) {
  const px = zone.x * cellSize;
  const py = zone.y * cellSize;
  const furnitureColor = lighten(zone.fill, 15);
  const detailColor = lighten(zone.fill, 30);

  switch (zone.id) {
    case "production":
      // Conveyor lines running horizontally through production
      return (
        <g opacity={0.4}>
          {[3, 7, 11].map((row) => (
            <line
              key={row}
              x1={px + 20}
              y1={py + row * cellSize + cellSize / 2}
              x2={px + zone.w * cellSize - 20}
              y2={py + row * cellSize + cellSize / 2}
              stroke={detailColor}
              strokeWidth={2}
              strokeDasharray="8 4"
            />
          ))}
        </g>
      );

    case "warehouse":
      // Shelf rows
      return (
        <g opacity={0.35}>
          {[2, 4, 6].map((row) => (
            <g key={row}>
              <rect
                x={px + 15}
                y={py + row * cellSize}
                width={zone.w * cellSize - 30}
                height={cellSize * 0.6}
                fill={furnitureColor}
                rx={2}
              />
              {/* Palette/box shapes on shelves */}
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x={px + 25 + i * (cellSize * 2)}
                  y={py + row * cellSize + 3}
                  width={cellSize * 1.2}
                  height={cellSize * 0.35}
                  fill={detailColor}
                  rx={1}
                />
              ))}
            </g>
          ))}
        </g>
      );

    case "loading-dock":
      // Dock bay outlines
      return (
        <g opacity={0.3}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={px + 15 + i * (cellSize * 3)}
              y={py + zone.h * cellSize - cellSize * 2.5}
              width={cellSize * 2.5}
              height={cellSize * 2}
              fill="none"
              stroke={detailColor}
              strokeWidth={2}
              strokeDasharray="6 3"
              rx={3}
            />
          ))}
          {/* Dock door indicators */}
          {[0, 1, 2].map((i) => (
            <rect
              key={`door-${i}`}
              x={px + 15 + i * (cellSize * 3) + cellSize * 0.75}
              y={py + zone.h * cellSize - 6}
              width={cellSize}
              height={4}
              fill={detailColor}
              rx={2}
            />
          ))}
        </g>
      );

    case "admin":
      // Desk shapes
      return (
        <g opacity={0.3}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect
                x={px + 20 + i * (cellSize * 2.5)}
                y={py + cellSize * 1.5}
                width={cellSize * 1.8}
                height={cellSize * 0.9}
                fill={furnitureColor}
                rx={2}
              />
              {/* Chair (small circle) */}
              <circle
                cx={px + 20 + i * (cellSize * 2.5) + cellSize * 0.9}
                cy={py + cellSize * 2.8}
                r={4}
                fill={detailColor}
              />
            </g>
          ))}
        </g>
      );

    case "breakroom":
      // Tables and coffee machine
      return (
        <g opacity={0.35}>
          {/* Two round tables */}
          {[0, 1].map((i) => (
            <g key={i}>
              <circle
                cx={px + cellSize * 3 + i * cellSize * 5}
                cy={py + cellSize * 2}
                r={cellSize * 0.7}
                fill={furnitureColor}
              />
              {/* Chairs around table */}
              {[0, 90, 180, 270].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <circle
                    key={deg}
                    cx={px + cellSize * 3 + i * cellSize * 5 + Math.cos(rad) * cellSize * 1.2}
                    cy={py + cellSize * 2 + Math.sin(rad) * cellSize * 1.2}
                    r={3}
                    fill={detailColor}
                  />
                );
              })}
            </g>
          ))}
          {/* Coffee machine (rectangle) */}
          <rect
            x={px + zone.w * cellSize - cellSize * 2}
            y={py + cellSize * 0.5}
            width={cellSize * 0.8}
            height={cellSize * 1.2}
            fill={detailColor}
            rx={2}
          />
          {/* Vending machine */}
          <rect
            x={px + zone.w * cellSize - cellSize * 3.5}
            y={py + cellSize * 0.5}
            width={cellSize}
            height={cellSize * 1.2}
            fill={furnitureColor}
            rx={2}
          />
          {/* Plant */}
          <circle
            cx={px + cellSize * 9}
            cy={py + cellSize * 0.8}
            r={5}
            fill="#4a6a3a"
          />
        </g>
      );

    case "engineering":
      // Workbenches
      return (
        <g opacity={0.3}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={px + 15 + i * (cellSize * 3.5)}
              y={py + cellSize * 3}
              width={cellSize * 2.5}
              height={cellSize * 0.8}
              fill={furnitureColor}
              rx={2}
            />
          ))}
          {/* Whiteboard */}
          <rect
            x={px + zone.w * cellSize - 20}
            y={py + cellSize * 1}
            width={8}
            height={cellSize * 4}
            fill={detailColor}
            rx={2}
          />
        </g>
      );

    case "rd-lab":
      // Lab benches with equipment
      return (
        <g opacity={0.3}>
          {[0, 1].map((i) => (
            <g key={i}>
              <rect
                x={px + 15 + i * (cellSize * 5)}
                y={py + cellSize * 2}
                width={cellSize * 3.5}
                height={cellSize * 0.8}
                fill={furnitureColor}
                rx={2}
              />
              {/* Flask/beaker shapes */}
              <circle
                cx={px + 30 + i * (cellSize * 5)}
                cy={py + cellSize * 1.8}
                r={4}
                fill={detailColor}
              />
              <circle
                cx={px + 55 + i * (cellSize * 5)}
                cy={py + cellSize * 1.8}
                r={3}
                fill={detailColor}
              />
            </g>
          ))}
        </g>
      );

    default:
      return null;
  }
}

// Export zone data for worker/machine placement
export { zones };
export type { ZoneDef };

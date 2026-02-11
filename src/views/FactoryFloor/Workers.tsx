import { useState, useCallback, useRef, useEffect } from "react";
import { colors } from "../../data/colors";

type WorkerRole = "worker" | "engineer" | "supervisor";
type WorkerStatus = "working" | "break" | "idle";

interface WorkerDef {
  id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
  efficiency: number;
  morale: number;
  tenure: number;
  salary: number;
  zone: string;
}

interface WorkerState extends WorkerDef {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

interface ZoneBounds {
  id: string;
  px: number; py: number;
  pw: number; ph: number;
}

const CELL = 28;
const zoneBounds: ZoneBounds[] = [
  { id: "production", px: 0 * CELL + 20, py: 0 * CELL + 30, pw: 20 * CELL - 40, ph: 14 * CELL - 40 },
  { id: "engineering", px: 20 * CELL + 20, py: 0 * CELL + 30, pw: 12 * CELL - 40, ph: 8 * CELL - 40 },
  { id: "rd-lab", px: 20 * CELL + 20, py: 8 * CELL + 30, pw: 12 * CELL - 40, ph: 6 * CELL - 40 },
  { id: "admin", px: 20 * CELL + 20, py: 14 * CELL + 30, pw: 12 * CELL - 40, ph: 4 * CELL - 40 },
  { id: "breakroom", px: 20 * CELL + 20, py: 18 * CELL + 20, pw: 12 * CELL - 40, ph: 4 * CELL - 30 },
  { id: "warehouse", px: 0 * CELL + 20, py: 14 * CELL + 30, pw: 10 * CELL - 40, ph: 8 * CELL - 40 },
  { id: "loading-dock", px: 10 * CELL + 20, py: 14 * CELL + 30, pw: 10 * CELL - 40, ph: 8 * CELL - 40 },
];

const firstNames = [
  "Alex", "Jordan", "Sam", "Riley", "Casey", "Morgan", "Taylor", "Reese", "Quinn", "Blake",
  "Avery", "Drew", "Jamie", "Skyler", "Kai", "Finn", "Lee", "Pat", "Chris", "Robin",
  "Dana", "Lou", "Val", "Kim", "Jan", "Dev", "Ash", "Ray", "Sol", "Noor",
  "Sage", "Reed", "Max", "Toni", "Erin", "Shay", "Rory", "Jude", "Wren", "Blair",
];

function randInZone(zone: ZoneBounds) {
  return {
    x: zone.px + Math.random() * zone.pw,
    y: zone.py + Math.random() * zone.ph,
  };
}

function createWorkers(): WorkerState[] {
  const workers: WorkerState[] = [];
  let nameIdx = 0;

  for (let i = 0; i < 28; i++) {
    const zone = zoneBounds[0];
    const isBreak = i >= 25;
    const pos = isBreak ? randInZone(zoneBounds[4]) : randInZone(zone);
    workers.push({
      id: `w${i}`, name: firstNames[nameIdx++ % firstNames.length],
      role: "worker", status: isBreak ? "break" : "working",
      efficiency: 60 + Math.floor(Math.random() * 35),
      morale: 50 + Math.floor(Math.random() * 40),
      tenure: 1 + Math.floor(Math.random() * 6), salary: 45000,
      zone: isBreak ? "breakroom" : "production",
      x: pos.x, y: pos.y, targetX: pos.x, targetY: pos.y,
    });
  }

  for (let i = 0; i < 8; i++) {
    const zoneIdx = i < 5 ? 1 : 2;
    const zone = zoneBounds[zoneIdx];
    const pos = randInZone(zone);
    workers.push({
      id: `e${i}`, name: firstNames[nameIdx++ % firstNames.length],
      role: "engineer", status: "working",
      efficiency: 70 + Math.floor(Math.random() * 25),
      morale: 55 + Math.floor(Math.random() * 35),
      tenure: 1 + Math.floor(Math.random() * 8), salary: 85000,
      zone: zoneIdx === 1 ? "engineering" : "rd-lab",
      x: pos.x, y: pos.y, targetX: pos.x, targetY: pos.y,
    });
  }

  const supZones = [0, 0, 1, 5, 6];
  for (let i = 0; i < 5; i++) {
    const zone = zoneBounds[supZones[i]];
    const pos = randInZone(zone);
    workers.push({
      id: `s${i}`, name: firstNames[nameIdx++ % firstNames.length],
      role: "supervisor", status: "working",
      efficiency: 80 + Math.floor(Math.random() * 15),
      morale: 60 + Math.floor(Math.random() * 30),
      tenure: 2 + Math.floor(Math.random() * 10), salary: 75000,
      zone: zoneBounds[supZones[i]].id,
      x: pos.x, y: pos.y, targetX: pos.x, targetY: pos.y,
    });
  }

  return workers;
}

// Speed: pixels per second
const WORKER_SPEED = 15;

interface WorkersProps {
  cellSize: number;
  tick: number;
  animTime: number;
}

export function Workers({ cellSize, tick, animTime }: WorkersProps) {
  const workersRef = useRef<WorkerState[]>(createWorkers());
  const lastTimeRef = useRef(0);
  const [, forceRender] = useState(0);
  const renderTickRef = useRef(0);

  const [hovered, setHovered] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Smooth movement via rAF delta time — mutate ref, render at ~30fps
  useEffect(() => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = animTime;
      return;
    }

    const dt = Math.min((animTime - lastTimeRef.current) / 1000, 0.1); // seconds, capped
    lastTimeRef.current = animTime;

    const workers = workersRef.current;
    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];

      // Randomly pick new targets (~2% per frame at 60fps ≈ new target every ~0.8s)
      if (Math.random() < 0.02) {
        const zone = zoneBounds.find((z) => z.id === w.zone);
        if (zone) {
          const newPos = randInZone(zone);
          w.targetX = newPos.x;
          w.targetY = newPos.y;
        }
      }

      // Move toward target
      const dx = w.targetX - w.x;
      const dy = w.targetY - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.5) {
        const move = WORKER_SPEED * dt;
        const step = Math.min(move, dist);
        w.x += (dx / dist) * step;
        w.y += (dy / dist) * step;
      }
    }

    // Render at ~30fps to reduce React overhead (every other rAF)
    renderTickRef.current++;
    if (renderTickRef.current % 2 === 0) {
      forceRender((v) => v + 1);
    }
  }, [animTime]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGGElement>) => {
    const svg = e.currentTarget.closest("svg");
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setMousePos({ x: svgPt.x, y: svgPt.y });
  }, []);

  const workers = workersRef.current;
  const timeS = animTime / 1000;

  return (
    <g onMouseMove={handleMouseMove}>
      {workers.map((w) => {
        const isHovered = hovered === w.id;
        const roleColor = w.role === "worker" ? colors.worker
          : w.role === "engineer" ? colors.engineer
          : colors.supervisor;

        // Smooth bob using continuous time
        const bobPhase = w.id.charCodeAt(1) * 0.7 + (w.id.charCodeAt(0) || 0) * 0.3;
        const bobY = Math.sin(timeS * 2.5 + bobPhase) * 1.5;
        const opacity = w.status === "break" ? 0.4 : 1;
        const scale = isHovered ? 1.3 : 1;

        return (
          <g
            key={w.id}
            transform={`translate(${w.x}, ${w.y + bobY}) scale(${scale})`}
            opacity={opacity}
            onMouseEnter={() => setHovered(w.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            {isHovered && (
              <circle cx={0} cy={0} r={12} fill={roleColor} opacity={0.15} />
            )}
            <circle cx={0} cy={-4} r={3.5} fill={roleColor} />
            {w.status === "break" ? (
              <rect x={-5} y={0} width={10} height={4} rx={2} fill={roleColor} />
            ) : (
              <rect x={-2.5} y={0} width={5} height={7} rx={2} fill={roleColor} />
            )}
            {w.role === "supervisor" && (
              <g>
                <rect x={4} y={-2} width={3} height={5} rx={0.5} fill="#8b7355" />
                <rect x={4.5} y={-1} width={2} height={3} fill="#d4c4a8" />
              </g>
            )}
            {w.role === "engineer" && (
              <g>
                <line x1={4} y1={1} x2={7} y2={4} stroke="#7dd3a8" strokeWidth={1.5} strokeLinecap="round" />
                <circle cx={7.5} cy={4.5} r={1.5} fill="none" stroke="#7dd3a8" strokeWidth={1} />
              </g>
            )}
          </g>
        );
      })}

      {hovered && (
        <WorkerTooltip
          worker={workers.find((w) => w.id === hovered)!}
          x={mousePos.x}
          y={mousePos.y}
        />
      )}
    </g>
  );
}

function WorkerTooltip({ worker, x, y }: { worker: WorkerState; x: number; y: number }) {
  const tw = 185;
  const th = 140;
  const tx = Math.min(x + 15, 896 - tw - 10);
  const ty = Math.max(y - th / 2, 10);

  const roleColor = worker.role === "worker" ? colors.worker
    : worker.role === "engineer" ? colors.engineer
    : colors.supervisor;

  const moraleColor = worker.morale >= 70 ? colors.green
    : worker.morale >= 40 ? colors.accentGold
    : colors.red;

  const effColor = worker.efficiency >= 80 ? colors.green
    : worker.efficiency >= 60 ? colors.accentGold
    : colors.red;

  return (
    <g pointerEvents="none">
      <rect x={tx} y={ty} width={tw} height={th} fill={colors.bgPanel} stroke={roleColor} strokeWidth={1} rx={8} />
      <text x={tx + 12} y={ty + 20} fill={colors.textPrimary} fontSize={13} fontWeight={700}>
        {worker.name}
      </text>
      <rect x={tx + 12 + worker.name.length * 8} y={ty + 9} width={worker.role.length * 7 + 10} height={16} rx={8} fill={roleColor} opacity={0.2} />
      <text x={tx + 18 + worker.name.length * 8} y={ty + 21} fill={roleColor} fontSize={9} fontWeight={600} textTransform="uppercase">
        {worker.role}
      </text>
      <StatRow label="Status" value={worker.status} color={worker.status === "working" ? colors.green : colors.textDim} y={ty + 40} tx={tx} tw={tw} />
      <StatRow label="Efficiency" value={`${worker.efficiency}%`} color={effColor} y={ty + 56} tx={tx} tw={tw} />
      <StatRow label="Morale" value={`${worker.morale}%`} color={moraleColor} y={ty + 72} tx={tx} tw={tw} />
      <StatRow label="Tenure" value={`${worker.tenure} rounds`} color={colors.textPrimary} y={ty + 88} tx={tx} tw={tw} />
      <StatRow label="Salary" value={`$${(worker.salary / 1000).toFixed(0)}K`} color={colors.accentGold} y={ty + 104} tx={tx} tw={tw} />
      <StatRow label="Zone" value={worker.zone} color={colors.textMuted} y={ty + 120} tx={tx} tw={tw} />
    </g>
  );
}

function StatRow({ label, value, color, y, tx, tw }: { label: string; value: string; color: string; y: number; tx: number; tw: number }) {
  return (
    <>
      <text x={tx + 12} y={y} fill={colors.textMuted} fontSize={10}>{label}</text>
      <text x={tx + tw - 12} y={y} fill={color} fontSize={10} fontFamily="'JetBrains Mono', monospace" fontWeight={500} textAnchor="end">
        {value}
      </text>
    </>
  );
}

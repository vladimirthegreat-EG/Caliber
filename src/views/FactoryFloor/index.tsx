import { useState, useEffect, useRef, useCallback } from "react";
import { colors } from "../../data/colors";
import { Zones } from "./Zones";
import { Machines } from "./Machines";
import { Workers } from "./Workers";

const COLS = 32;
const ROWS = 22;
const CELL = 28;
const WIDTH = COLS * CELL;  // 896
const HEIGHT = ROWS * CELL; // 616

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;

export function FactoryFloor() {
  // Tick system for machine glow (low frequency is fine for machines)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(interval);
  }, []);

  // High-frequency timestamp for smooth worker animation (via rAF)
  const [animTime, setAnimTime] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let running = true;
    const loop = (ts: number) => {
      if (!running) return;
      setAnimTime(ts);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  // Zoom + pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle-click or Alt+click to pan
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: colors.textMuted }}>
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.2))}
          className="px-2 py-0.5 rounded transition-colors hover:text-white"
          style={{ background: colors.bgPanel, border: `1px solid ${colors.border}` }}
        >
          −
        </button>
        <span className="font-mono w-12 text-center" style={{ color: colors.textPrimary }}>
          {(zoom * 100).toFixed(0)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.2))}
          className="px-2 py-0.5 rounded transition-colors hover:text-white"
          style={{ background: colors.bgPanel, border: `1px solid ${colors.border}` }}
        >
          +
        </button>
        <button
          onClick={resetView}
          className="px-2 py-0.5 rounded transition-colors hover:text-white ml-1"
          style={{ background: colors.bgPanel, border: `1px solid ${colors.border}` }}
        >
          Reset
        </button>
        <span className="ml-2" style={{ color: colors.textDim }}>
          Scroll to zoom · Alt+drag to pan
        </span>
      </div>

      {/* Factory viewport with zoom/pan */}
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden"
        style={{
          width: WIDTH,
          height: HEIGHT,
          cursor: isPanning ? "grabbing" : "default",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block"
          style={{
            background: colors.floorBg,
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Subtle grid lines */}
          <defs>
            <pattern id="grid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
              <path
                d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
                fill="none"
                stroke="#3a4d60"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" />

          {/* Zones (rooms) */}
          <Zones cellSize={CELL} />

          {/* Machines (use low-freq tick for glow) */}
          <Machines cellSize={CELL} tick={tick} />

          {/* Workers (use high-freq animTime for smooth movement) */}
          <Workers cellSize={CELL} tick={tick} animTime={animTime} />
        </svg>
      </div>
    </div>
  );
}

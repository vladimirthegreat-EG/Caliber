import { useState, useEffect } from "react";
import { colors } from "../../data/colors";
import { Zones } from "./Zones";
import { Machines } from "./Machines";
import { Workers } from "./Workers";

const COLS = 32;
const ROWS = 22;
const CELL = 28;
const WIDTH = COLS * CELL;  // 896
const HEIGHT = ROWS * CELL; // 616

export function FactoryFloor() {
  // Tick system: increments every 200ms for animations
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ width: WIDTH, height: HEIGHT }}>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block"
        style={{ background: colors.floorBg }}
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

        {/* Machines */}
        <Machines cellSize={CELL} tick={tick} />

        {/* Workers */}
        <Workers cellSize={CELL} tick={tick} />
      </svg>
    </div>
  );
}

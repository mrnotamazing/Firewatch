/** Abstract skyline + sky silhouette used as a subtle background watermark — original vector art, not stock imagery. */

function Tower({ x, y, w, h, cols, rows }: { x: number; y: number; w: number; h: number; cols: number; rows: number }) {
  const pad = w * 0.16;
  const gapX = (w - pad * 2) / cols;
  const winW = gapX * 0.55;
  const topPad = h * 0.12;
  const gapY = (h - topPad * 1.6) / rows;
  const winH = gapY * 0.5;
  const windows = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      windows.push(
        <rect
          key={`${r}-${c}`}
          x={x + pad + c * gapX}
          y={y + topPad + r * gapY}
          width={winW}
          height={winH}
          fillOpacity={1}
        />,
      );
    }
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fillOpacity={0.55} />
      {windows}
    </g>
  );
}

function House({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const roofOverhang = w * 0.15;
  return (
    <g fillOpacity={0.55}>
      <rect x={x} y={y} width={w} height={h} />
      <polygon points={`${x - roofOverhang},${y} ${x + w / 2},${y - h * 0.55} ${x + w + roofOverhang},${y}`} />
    </g>
  );
}

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fillOpacity={0.4}>
      <ellipse cx={0} cy={10} rx={22} ry={14} />
      <ellipse cx={20} cy={3} rx={19} ry={16} />
      <ellipse cx={-17} cy={7} rx={16} ry={13} />
      <ellipse cx={36} cy={13} rx={14} ry={10} />
    </g>
  );
}

export default function SkylineWatermark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 480"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {/* sky */}
      <Cloud x={55} y={55} scale={1.1} />
      <Cloud x={278} y={28} scale={0.85} />
      <Cloud x={468} y={88} scale={1.3} />
      <Cloud x={700} y={42} scale={0.9} />
      <Cloud x={898} y={98} scale={1.1} />
      <Cloud x={1078} y={50} scale={0.8} />

      {/* houses — low residential row */}
      <House x={0} y={442} w={46} h={38} />
      <House x={54} y={448} w={38} h={32} />
      <House x={368} y={444} w={42} h={36} />
      <House x={678} y={446} w={40} h={34} />
      <House x={896} y={442} w={44} h={38} />
      <House x={1128} y={446} w={44} h={34} />

      {/* mid-rise blocks */}
      <rect x={125} y={370} width={45} height={110} fillOpacity={0.55} />
      <rect x={530} y={352} width={50} height={128} fillOpacity={0.55} />
      <rect x={1065} y={358} width={50} height={122} fillOpacity={0.55} />

      {/* window towers */}
      <Tower x={100} y={330} w={55} h={150} cols={3} rows={9} />
      <Tower x={460} y={280} w={58} h={200} cols={3} rows={13} />
      <Tower x={830} y={290} w={55} h={190} cols={3} rows={12} />
      <Tower x={990} y={320} w={60} h={160} cols={3} rows={10} />

      {/* stepped apartment block (setback silhouette, common Bengaluru mid-rise) */}
      <g fillOpacity={0.55}>
        <rect x={225} y={390} width={80} height={90} />
        <rect x={238} y={300} width={54} height={92} />
      </g>
      <Tower x={238} y={300} w={54} h={92} cols={2} rows={6} />
      <Tower x={225} y={390} w={80} h={90} cols={4} rows={5} />

      <g fillOpacity={0.55}>
        <rect x={735} y={395} width={78} height={85} />
        <rect x={747} y={315} width={54} height={82} />
      </g>
      <Tower x={747} y={315} w={54} h={82} cols={2} rows={5} />
      <Tower x={735} y={395} w={78} h={85} cols={4} rows={5} />

      {/* water tower */}
      <rect x={310} y={360} width={46} height={120} fillOpacity={0.55} />
      <rect x={330} y={322} width={6} height={40} fillOpacity={0.55} />
      <ellipse cx={333} cy={314} rx={16} ry={12} fillOpacity={0.55} />

      {/* small civic dome */}
      <rect x={595} y={400} width={70} height={80} fillOpacity={0.55} />
      <path d="M598,400 a32,32 0 0 1 64,0 Z" fillOpacity={0.55} />
      <rect x={627} y={370} width={6} height={22} fillOpacity={0.55} />
    </svg>
  );
}

const BASE = import.meta.env.BASE_URL;

function VoxelTree({ x, y, s = 1, blossom = false }: { x: number; y: number; s?: number; blossom?: boolean }) {
  const leaf = blossom ? '#c56f78' : '#4f8f45';
  const light = blossom ? '#eda6a6' : '#68a854';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-7} y={-70} width={14} height={70} fill="#80532f" />
      <rect x={-38} y={-118} width={76} height={56} fill={leaf} />
      <rect x={-26} y={-142} width={52} height={30} fill={light} />
      <rect x={-38} y={-118} width={24} height={20} fill={light} opacity={0.6} />
    </g>
  );
}

function Lantern({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-9} y={-4} width={18} height={4} fill="#80532f" />
      <rect x={-7} y={-26} width={14} height={22} fill="#ffe2a8" />
      <rect x={-10} y={-31} width={20} height={6} fill="#c9a25c" />
    </g>
  );
}

/**
 * Static illustration of the voxel garden. Used behind the 3D canvas while it
 * loads, and as the complete backdrop when WebGL is unavailable.
 */
export function StaticGarden() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true" data-testid="static-garden">
      <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="sg-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8ec2e8" />
            <stop offset="0.68" stopColor="#f4e7d1" />
          </linearGradient>
          <pattern id="sg-grass" width="64" height="64" patternUnits="userSpaceOnUse">
            <image href={`${BASE}assets/textures/grass.svg`} width="64" height="64" style={{ imageRendering: 'pixelated' }} />
          </pattern>
          <pattern id="sg-stone" width="40" height="40" patternUnits="userSpaceOnUse">
            <image href={`${BASE}assets/textures/stone.svg`} width="40" height="40" style={{ imageRendering: 'pixelated' }} />
          </pattern>
        </defs>

        <rect width="1440" height="900" fill="url(#sg-sky)" />
        <circle cx="1080" cy="230" r="150" fill="#fff6e2" opacity="0.35" />
        <circle cx="1080" cy="230" r="58" fill="#fff8ea" opacity="0.9" />

        <g fill="#ffffff" opacity="0.92">
          <rect x="160" y="120" width="180" height="34" />
          <rect x="200" y="96" width="110" height="30" />
          <rect x="820" y="80" width="150" height="28" />
          <rect x="860" y="60" width="80" height="24" />
          <rect x="1200" y="150" width="160" height="30" />
        </g>

        <path d="M0 520 H180 V490 H360 V505 H520 V470 H700 V490 H900 V460 H1100 V480 H1280 V455 H1440 V900 H0Z" fill="#a7c98a" />
        <path d="M0 580 H140 V555 H300 V570 H480 V545 H960 V560 H1150 V540 H1300 V560 H1440 V900 H0Z" fill="#7fae63" />

        <rect x="0" y="610" width="1440" height="290" fill="url(#sg-grass)" />
        <rect x="0" y="610" width="1440" height="290" fill="#4d8a43" opacity="0.18" />
        <polygon points="690,610 750,610 900,900 540,900" fill="url(#sg-stone)" opacity="0.9" />

        <VoxelTree x={110} y={640} s={1.5} />
        <VoxelTree x={300} y={625} s={1.1} blossom />
        <VoxelTree x={470} y={615} s={0.85} />
        <VoxelTree x={1000} y={615} s={0.85} blossom />
        <VoxelTree x={1170} y={628} s={1.15} />
        <VoxelTree x={1340} y={650} s={1.6} blossom />

        <g>
          <rect x="652" y="420" width="20" height="195" fill="#f1e3c6" />
          <rect x="768" y="420" width="20" height="195" fill="#f1e3c6" />
          <rect x="644" y="404" width="152" height="20" fill="#c9a25c" />
          <rect x="680" y="388" width="24" height="18" fill="#c56f78" />
          <rect x="708" y="384" width="24" height="22" fill="#eda6a6" />
          <rect x="736" y="388" width="24" height="18" fill="#c56f78" />
          <rect x="644" y="430" width="36" height="22" fill="#eda6a6" />
          <rect x="760" y="450" width="36" height="22" fill="#c56f78" />
        </g>

        <Lantern x={640} y={690} s={1.4} />
        <Lantern x={800} y={690} s={1.4} />
        <Lantern x={560} y={820} s={2} />
        <Lantern x={880} y={820} s={2} />
      </svg>
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-ivory/30" />
    </div>
  );
}

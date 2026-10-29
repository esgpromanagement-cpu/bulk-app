import { cn } from "@/lib/utils";

type Props = {
  /** 0 = mince, 1 = plus musclé (reste volontairement réaliste) */
  muscle: number;
  className?: string;
};

// Silhouette illustrative (pas une vraie photo) pour l'exemple avant / projection.
export function PhysiqueIllustration({ muscle, className }: Props) {
  const m = Math.max(0, Math.min(1, muscle));
  const shoulder = 58 + m * 12; // demi-largeur des épaules
  const waist = 34 + m * 2;
  const neck = 11 + m * 3;
  const arm = 11 + m * 5;
  const cx = 100;

  const torso = [
    `M ${cx - neck} 62`,
    `C ${cx - neck - 6} 70, ${cx - shoulder + 10} 72, ${cx - shoulder} 84`,
    `C ${cx - shoulder - 4} 100, ${cx - shoulder + 4} 130, ${cx - waist - 6} 160`,
    `L ${cx - waist} 230`,
    `L ${cx + waist} 230`,
    `L ${cx + waist + 6} 160`,
    `C ${cx + shoulder - 4} 130, ${cx + shoulder + 4} 100, ${cx + shoulder} 84`,
    `C ${cx + shoulder - 10} 72, ${cx + neck + 6} 70, ${cx + neck} 62`,
    "Z",
  ].join(" ");

  const armPath = (side: -1 | 1) => {
    const x = cx + side * (shoulder + 2);
    return `M ${x} 86 C ${x + side * (arm + 4)} 100, ${x + side * (arm + 2)} 150, ${x + side * (arm - 2)} 200 L ${x + side * 2} 200 C ${x + side * 2} 160, ${x - side * 4} 120, ${x - side * 6} 100 Z`;
  };

  return (
    <svg
      viewBox="0 0 200 230"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`skin-${m}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.75 0.05 60)" />
          <stop offset="100%" stopColor="oklch(0.55 0.05 50)" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={34} r={22} fill={`url(#skin-${m})`} />
      <rect x={cx - neck} y={50} width={neck * 2} height={16} fill={`url(#skin-${m})`} />
      <path d={armPath(-1)} fill={`url(#skin-${m})`} />
      <path d={armPath(1)} fill={`url(#skin-${m})`} />
      <path d={torso} fill={`url(#skin-${m})`} />
      {m > 0.3 && (
        <g stroke="oklch(0.45 0.04 50)" strokeWidth="1.5" fill="none" opacity={0.5 * m}>
          <path d={`M ${cx} 92 L ${cx} 210`} />
          <path d={`M ${cx - 36} 118 Q ${cx - 16} 128 ${cx} 116`} />
          <path d={`M ${cx + 36} 118 Q ${cx + 16} 128 ${cx} 116`} />
        </g>
      )}
    </svg>
  );
}

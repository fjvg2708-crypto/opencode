import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  /** "color" = azul+branco | "white" = tudo branco | "dark" = azul escuro */
  variant?: "color" | "white" | "dark";
}

export function Logo({ size = 40, className, variant = "color" }: LogoProps) {
  const bg = variant === "white" ? "white" : variant === "dark" ? "#1e3a8a" : "#0033CC";
  const fg = variant === "white" ? "#0033CC" : "white";
  const ring = variant === "white" ? "#0033CC" : "white";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="100" cy="100" r="100" fill={bg} />
      <circle cx="100" cy="100" r="84" fill="none" stroke={ring} strokeWidth="6" />
      <path
        fillRule="evenodd"
        fill={fg}
        d="
          M 62 44
          L 62 156
          L 108 156
          Q 148 156 148 116
          L 148 84
          Q 148 44 108 44
          L 62 44 Z

          M 79 63
          L 112 63
          Q 131 63 131 82
          L 131 118
          Q 131 137 112 137
          L 79 137
          L 79 116
          L 66 116
          L 79 103
          L 79 63 Z
        "
      />
    </svg>
  );
}

/** Logótipo completo: ícone + texto */
export function LogoFull({
  size = 40,
  className,
  textColor = "white",
}: {
  size?: number;
  className?: string;
  textColor?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Logo size={size} />
      <div>
        <p
          className="font-bold leading-tight tracking-tight"
          style={{ color: textColor, fontSize: size * 0.38 }}
        >
          BankSync
        </p>
        <p
          className="font-medium tracking-widest uppercase opacity-80"
          style={{ color: textColor, fontSize: size * 0.22 }}
        >
          Portugal
        </p>
      </div>
    </div>
  );
}

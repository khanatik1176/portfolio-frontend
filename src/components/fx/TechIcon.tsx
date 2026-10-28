import {
  siAxios,
  siCss,
  siDjango,
  siDocker,
  siDotnet,
  siFramer,
  siGithub,
  siHtml5,
  siJavascript,
  siJest,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPostman,
  siPrisma,
  siPython,
  siReact,
  siRedux,
  siShadcnui,
  siTailwindcss,
  siTanstack,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

// Keyed by lowercase name with non-alphanumerics stripped ("Next.js" -> "nextjs").
const ICONS: Record<string, SimpleIcon> = {
  axios: siAxios,
  css: siCss,
  django: siDjango,
  docker: siDocker,
  aspnet: siDotnet,
  dotnet: siDotnet,
  framermotion: siFramer,
  github: siGithub,
  html: siHtml5,
  javascript: siJavascript,
  jest: siJest,
  mysql: siMysql,
  nestjs: siNestjs,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  postgresql: siPostgresql,
  postman: siPostman,
  prisma: siPrisma,
  python: siPython,
  react: siReact,
  reactjs: siReact,
  redux: siRedux,
  shadcn: siShadcnui,
  tailwindcss: siTailwindcss,
  tanstackquery: siTanstack,
  typescript: siTypescript,
};

const keyOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Near-black brand colors would vanish on dark backgrounds; those use the text color instead. */
const isDark = (hex: string) => {
  const n = Number.parseInt(hex, 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 60;
};

/** Brand icon for a technology name, or its initials when no icon is known. */
export function TechIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const icon = ICONS[keyOf(name)];
  if (!icon) {
    return (
      <span className={`grid place-items-center font-mono text-[10px] font-bold ${className}`}>
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={name} className={className} fill={isDark(icon.hex) ? "currentColor" : `#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}

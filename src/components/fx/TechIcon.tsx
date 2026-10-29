import { Code2, Database, FlaskConical, Hash, KeyRound, MessageSquare, Orbit, Share2, Webhook, type LucideIcon } from "lucide-react";
import {
  siAxios,
  siClaude,
  siCss,
  siCursor,
  siDjango,
  siDocker,
  siDotnet,
  siFramer,
  siGithub,
  siGithubcopilot,
  siHoppscotch,
  siHtml5,
  siJavascript,
  siJest,
  siJira,
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
  siRefine,
  siShadcnui,
  siSwagger,
  siTailwindcss,
  siTanstack,
  siTrello,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

// Keyed by lowercase name with non-alphanumerics stripped ("Next.js" -> "nextjs", "C#" -> "csharp").
const ICONS: Record<string, SimpleIcon> = {
  axios: siAxios,
  claude: siClaude,
  css: siCss,
  cursor: siCursor,
  django: siDjango,
  docker: siDocker,
  aspnet: siDotnet,
  dotnet: siDotnet,
  framermotion: siFramer,
  github: siGithub,
  githubcopilot: siGithubcopilot,
  copilot: siGithubcopilot,
  hoppscotch: siHoppscotch,
  html: siHtml5,
  javascript: siJavascript,
  jest: siJest,
  jira: siJira,
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
  refine: siRefine,
  shadcn: siShadcnui,
  swagger: siSwagger,
  tailwindcss: siTailwindcss,
  tanstackquery: siTanstack,
  trello: siTrello,
  typescript: siTypescript,
};

// Concepts and tools without a brand icon get a matching outline icon instead.
const FALLBACKS: Record<string, LucideIcon> = {
  antigravity: Orbit,
  authjs: KeyRound,
  contextapi: Share2,
  csharp: Hash,
  mssql: Database,
  oracle: Database,
  playwright: FlaskConical,
  restapis: Webhook,
  slack: MessageSquare,
  vscode: Code2,
};

const keyOf = (name: string) => name.toLowerCase().replace(/#/g, "sharp").replace(/[^a-z0-9]/g, "");

/** Near-black brand colors would vanish on dark backgrounds; those use the text color instead. */
const isDark = (hex: string) => {
  const n = Number.parseInt(hex, 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 60;
};

/** Brand icon for a technology name, an outline icon for known concepts, or its initials. */
export function TechIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const key = keyOf(name);
  const icon = ICONS[key];
  if (icon) {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label={name} className={className} fill={isDark(icon.hex) ? "currentColor" : `#${icon.hex}`}>
        <path d={icon.path} />
      </svg>
    );
  }
  const Fallback = FALLBACKS[key];
  if (Fallback) return <Fallback className={`text-chart-2 ${className}`} aria-label={name} strokeWidth={1.75} />;
  return (
    <span className={`grid place-items-center font-mono text-[10px] font-bold ${className}`}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** Whether `name` has a brand or concept icon (so callers can skip the initials fallback). */
export const hasTechIcon = (name: string) => {
  const key = keyOf(name);
  return key in ICONS || key in FALLBACKS;
};

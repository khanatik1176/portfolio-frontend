import {
  Brain,
  Building2,
  ChartLine,
  Clock,
  Cpu,
  Flag,
  GraduationCap,
  Infinity as InfinityIcon,
  KanbanSquare,
  Layers,
  Radio,
  Shuffle,
  Sparkles,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

// First matching keyword wins, so more specific phrases come first.
const RULES: [RegExp, LucideIcon][] = [
  [/compan|employ|work for/, Building2],
  [/c?gpa|grade|degree/, GraduationCap],
  [/dean|award|honou?r|winner/, Trophy],
  [/tech|tool|stack trace/, Cpu],
  [/adaptive|flexib/, Shuffle],
  [/team|collab/, Users],
  [/analytic|think|problem/, Brain],
  [/quick|fast|learner/, Zap],
  [/time/, Clock],
  [/lead/, Flag],
  [/project|manage/, KanbanSquare],
  [/devops|ci\/cd|cloud/, InfinityIcon],
  [/full.?stack|stack/, Layers],
  [/data|analytics|science/, ChartLine],
  [/iot|device|hardware/, Radio],
];

/** Picks an icon from the label's wording (e.g. "Team Player" → Users); falls back to a sparkle. */
export function KeywordIcon({ label, className = "h-4 w-4" }: { label: string; className?: string }) {
  const text = label.toLowerCase();
  const Icon = RULES.find(([re]) => re.test(text))?.[1] ?? Sparkles;
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}

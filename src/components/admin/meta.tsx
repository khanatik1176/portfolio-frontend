import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  LayoutTemplate,
  Mail,
  Package,
  Quote,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { SectionType } from "@/lib/types";

export const SECTION_META: Record<
  SectionType,
  { label: string; icon: LucideIcon }
> = {
  HERO: { label: "Hero", icon: Sparkles },
  ABOUT: { label: "About", icon: UserRound },
  SKILLS: { label: "Skills", icon: Wrench },
  EXPERIENCE: { label: "Experience", icon: Briefcase },
  EDUCATION: { label: "Education", icon: GraduationCap },
  PROJECTS: { label: "Projects", icon: FolderKanban },
  SERVICES: { label: "Services", icon: Package },
  TESTIMONIALS: { label: "Testimonials", icon: Quote },
  CONTACT: { label: "Contact", icon: Mail },
  CUSTOM: { label: "Custom", icon: LayoutTemplate },
};

/** postMessage types between the section editor and its /admin/preview iframe. */
export const PREVIEW_MESSAGE = "portfolio-preview";
export const PREVIEW_READY = "portfolio-preview-ready";

/** Fired after messages change so the sidebar's unread badge refreshes. */
export const MESSAGES_CHANGED = "admin:messages-changed";
export const notifyMessagesChanged = () =>
  window.dispatchEvent(new Event(MESSAGES_CHANGED));

/** "3m ago", "5h ago", "2d ago", then a short date. */
export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

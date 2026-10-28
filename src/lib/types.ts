export type SectionType =
  | "HERO"
  | "ABOUT"
  | "SKILLS"
  | "EXPERIENCE"
  | "EDUCATION"
  | "PROJECTS"
  | "SERVICES"
  | "TESTIMONIALS"
  | "CONTACT"
  | "CUSTOM";

export const SECTION_TYPES: SectionType[] = [
  "HERO",
  "ABOUT",
  "SKILLS",
  "EXPERIENCE",
  "EDUCATION",
  "PROJECTS",
  "SERVICES",
  "TESTIMONIALS",
  "CONTACT",
  "CUSTOM",
];

export type Json = Record<string, unknown>;

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  ownerName: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
  email: string | null;
  location: string | null;
  socials: SocialLink[];
  seo: Json;
  theme: Json;
  updatedAt: string;
}

export interface SectionItem {
  id: string;
  sectionId: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  link: string | null;
  tags: string[];
  startDate: string | null;
  endDate: string | null;
  data: Json;
  order: number;
  isVisible: boolean;
}

export interface Section {
  id: string;
  slug: string;
  type: SectionType;
  title: string;
  subtitle: string | null;
  content: Json;
  order: number;
  isVisible: boolean;
  items: SectionItem[];
  _count?: { items: number };
}

export interface Portfolio {
  settings: SiteSettings;
  sections: Section[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

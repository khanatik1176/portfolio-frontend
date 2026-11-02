import type { Json, Section } from "@/lib/types";

/**
 * Form descriptions for the free-form JSON the site reads, so the admin edits
 * plain fields instead of JSON. Keep these in step with the content/data
 * interfaces in components/sections/*.
 */
export type FieldDef =
  | {
      key: string;
      label: string;
      kind: "text" | "url" | "textarea";
      placeholder?: string;
      hint?: string;
    }
  | {
      key: string;
      label: string;
      kind: "number";
      placeholder?: string;
      hint?: string;
    }
  | { key: string; label: string; kind: "boolean"; hint?: string }
  | {
      key: string;
      label: string;
      kind: "select";
      options: { value: string; label: string }[];
      hint?: string;
    }
  /** Short words or phrases, entered as chips. */
  | {
      key: string;
      label: string;
      kind: "tags";
      placeholder?: string;
      hint?: string;
    }
  /** Sentences, one per line. */
  | {
      key: string;
      label: string;
      kind: "lines";
      placeholder?: string;
      hint?: string;
    }
  /** A list of small records, e.g. stats. */
  | {
      key: string;
      label: string;
      kind: "repeater";
      itemLabel: string;
      fields: FieldDef[];
      hint?: string;
    };

/** Which layout a section uses; custom sections can switch to the publications layout. */
export type Layout = Section["type"] | "PUBLICATIONS";

export const layoutOf = (section: Pick<Section, "type" | "content">): Layout =>
  section.type === "CUSTOM" && section.content.layout === "publications"
    ? "PUBLICATIONS"
    : section.type;

/** What the section shows, in plain words, above its form. */
export const LAYOUT_ABOUT: Record<Layout, string> = {
  HERO: "The opening screen: your name, rotating roles, buttons and the Joker card. Your name and photo come from Site settings.",
  ABOUT:
    "Your story, with number tiles below it. Traits and interests also appear in the hero.",
  SKILLS: "One card per skill category. Add each category as an item.",
  EXPERIENCE: "A timeline of jobs, newest first. Add each job as an item.",
  EDUCATION: "Your degrees with grades. Add each degree as an item.",
  PROJECTS:
    "A scrolling gallery of project cards. Add each project as an item.",
  SERVICES: "Cards for what you offer. Add each service as an item.",
  TESTIMONIALS: "Centered quote cards. Add each testimonial as an item.",
  CONTACT:
    "Your contact card. It uses the email, location and social links from Site settings, so there's nothing to fill in here.",
  CUSTOM: "Centered highlight cards, such as awards. Add each card as an item.",
  PUBLICATIONS: "A research archive. Add each paper as an item.",
};

const BODY: FieldDef = {
  key: "body",
  label: "Text",
  kind: "textarea",
  placeholder: "A short paragraph shown under the title.",
};

export const CONTENT_FIELDS: Record<Layout, FieldDef[]> = {
  HERO: [
    {
      key: "rolePrefix",
      label: "Intro words",
      kind: "text",
      placeholder: "I build",
      hint: "Shown before the rotating phrases.",
    },
    {
      key: "roles",
      label: "Rotating phrases",
      kind: "tags",
      placeholder: "e.g. web apps",
      hint: "They cycle one after another after the intro words.",
    },
    {
      key: "badge",
      label: "Role on the card",
      kind: "text",
      placeholder: "Software Engineer",
      hint: "Printed on the Joker card and in the footer. Defaults to your headline.",
    },
    {
      key: "availability",
      label: "Availability",
      kind: "text",
      placeholder: "Open to opportunities",
    },
    {
      key: "openTo",
      label: "Open to",
      kind: "tags",
      placeholder: "e.g. Full-time roles",
      hint: "Shown on the status ticket.",
    },
    {
      key: "timeZone",
      label: "Time zone",
      kind: "text",
      placeholder: "Asia/Dhaka",
      hint: "Drives the live clock. Use a city-style zone like Asia/Dhaka or Europe/London.",
    },
    {
      key: "stack",
      label: "Tech stack",
      kind: "tags",
      placeholder: "e.g. Next.js",
      hint: "Tech icons shown in the hero.",
    },
    {
      key: "cardChips",
      label: "Chips around the card",
      kind: "tags",
      placeholder: "e.g. React",
      hint: "Leave empty to use part of your tech stack.",
    },
    {
      key: "ctaLabel",
      label: "Main button text",
      kind: "text",
      placeholder: "See my work",
    },
    {
      key: "ctaHref",
      label: "Main button link",
      kind: "text",
      placeholder: "#projects",
      hint: "A section anchor like #projects, or a full URL.",
    },
    {
      key: "secondaryCtaLabel",
      label: "Second button text",
      kind: "text",
      placeholder: "Get in touch",
    },
    {
      key: "secondaryCtaHref",
      label: "Second button link",
      kind: "text",
      placeholder: "#contact",
    },
  ],
  ABOUT: [
    {
      ...BODY,
      label: "Your story",
      placeholder:
        "A few sentences about you. Words light up as visitors scroll.",
    },
    {
      key: "stats",
      label: "Number tiles",
      kind: "repeater",
      itemLabel: "tile",
      hint: "Big numbers that count up, like years of experience.",
      fields: [
        { key: "value", label: "Number", kind: "number", placeholder: "3" },
        {
          key: "suffix",
          label: "After the number",
          kind: "text",
          placeholder: "+",
        },
        {
          key: "label",
          label: "Label",
          kind: "text",
          placeholder: "Years of experience",
        },
        {
          key: "decimals",
          label: "Decimal places",
          kind: "number",
          placeholder: "0",
        },
      ],
    },
    {
      key: "traits",
      label: "Traits",
      kind: "tags",
      placeholder: "e.g. Curious",
      hint: "Words on the tape across the hero.",
    },
    {
      key: "interests",
      label: "Currently exploring",
      kind: "tags",
      placeholder: "e.g. Rust",
      hint: "Shown in the hero.",
    },
  ],
  SKILLS: [],
  EXPERIENCE: [],
  EDUCATION: [],
  PROJECTS: [],
  SERVICES: [],
  TESTIMONIALS: [BODY],
  CONTACT: [],
  CUSTOM: [BODY],
  PUBLICATIONS: [],
};

/** The layout switch for custom sections lives with the content fields. */
export const CUSTOM_LAYOUT_FIELD: FieldDef = {
  key: "layout",
  label: "Card style",
  kind: "select",
  options: [
    { value: "", label: "Highlight cards" },
    { value: "publications", label: "Research archive" },
  ],
};

/** Labels for an item's built-in fields; fields left out are hidden for that layout. */
export interface ItemShape {
  noun: string;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string;
  link?: string;
  dates?: { start: string; end?: string };
  data: FieldDef[];
}

const HIGHLIGHTS: FieldDef = {
  key: "highlights",
  label: "Highlights",
  kind: "lines",
  placeholder: "One achievement per line",
};

export const ITEM_SHAPES: Record<Layout, ItemShape | null> = {
  HERO: null,
  ABOUT: null,
  CONTACT: null,
  SKILLS: {
    noun: "category",
    title: "Category",
    subtitle: "Tagline",
    tags: "Skills",
    data: [],
  },
  EXPERIENCE: {
    noun: "job",
    title: "Role",
    subtitle: "Company",
    description: "Summary",
    tags: "Tech used",
    dates: { start: "Started", end: "Ended" },
    data: [
      {
        key: "location",
        label: "Location",
        kind: "text",
        placeholder: "Dhaka, Bangladesh",
      },
      {
        key: "logoUrl",
        label: "Company logo URL",
        kind: "url",
        placeholder: "/images/logos/company.png",
      },
      HIGHLIGHTS,
    ],
  },
  EDUCATION: {
    noun: "degree",
    title: "Degree",
    subtitle: "Institution",
    description: "Notes",
    dates: { start: "Started", end: "Finished" },
    data: [
      {
        key: "gradeLabel",
        label: "Grade type",
        kind: "text",
        placeholder: "CGPA",
      },
      { key: "grade", label: "Grade", kind: "text", placeholder: "3.75" },
      {
        key: "gradeMax",
        label: "Out of",
        kind: "number",
        placeholder: "4",
        hint: "Defaults to 4 for CGPA and 5 for GPA.",
      },
    ],
  },
  PROJECTS: {
    noun: "project",
    title: "Project name",
    subtitle: "Context",
    description: "Description",
    tags: "Tech stack",
    link: "Live URL",
    data: [
      { key: "featured", label: "Featured (wide card)", kind: "boolean" },
      {
        key: "repoUrl",
        label: "Source code URL",
        kind: "url",
        placeholder: "https://github.com/…",
      },
      HIGHLIGHTS,
    ],
  },
  SERVICES: {
    noun: "service",
    title: "Service",
    subtitle: "Context",
    description: "Description",
    tags: "Includes",
    link: "Link",
    data: [
      { key: "featured", label: "Featured (wide card)", kind: "boolean" },
      HIGHLIGHTS,
    ],
  },
  TESTIMONIALS: {
    noun: "testimonial",
    title: "Name",
    subtitle: "Role or company",
    description: "Quote",
    link: "Link",
    data: [
      {
        key: "badge",
        label: "Badge",
        kind: "text",
        placeholder: "e.g. ★5",
        hint: "Short text in the big circle.",
      },
    ],
  },
  CUSTOM: {
    noun: "card",
    title: "Title",
    subtitle: "Subtitle",
    description: "Description",
    link: "Link",
    data: [
      {
        key: "badge",
        label: "Badge",
        kind: "text",
        placeholder: "e.g. 4x",
        hint: "Short text in the big circle.",
      },
    ],
  },
  PUBLICATIONS: {
    noun: "paper",
    title: "Paper title",
    subtitle: "Venue",
    description: "Abstract",
    tags: "Topics",
    link: "Paper URL",
    dates: { start: "Published" },
    data: [],
  },
};

/** Drops empty values so saved JSON stays tidy. */
export function setField(obj: Json, key: string, value: unknown): Json {
  const next = { ...obj };
  const empty =
    value === "" ||
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length === 0);
  if (empty) delete next[key];
  else next[key] = value;
  return next;
}

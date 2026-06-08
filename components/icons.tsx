// Hafif, bağımlılıksız SVG ikon seti (stroke tabanlı)

type P = { className?: string };
const base = (className = "") => `${className}`;

export const IconCalendar = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="16" rx="3" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
);

export const IconTarget = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const IconChart = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 16v-3M12.5 16V8M17 16v-6" />
  </svg>
);

export const IconBook = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);

export const IconFlame = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 2c.4 2.6-.9 4-2.3 5.3C8.6 8.8 7 10.3 7 13.2 7 16.9 9.9 20 13 20s5.6-2.8 5.6-6.2c0-2.3-1.1-3.8-2.2-5.1-.3 1-.9 1.7-1.7 2.1.5-2.3-.4-5.6-2.2-8.8z" />
  </svg>
);

export const IconChevron = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconPlus = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
  </svg>
);

export const IconTimer = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 13.5V9M9.5 2.5h5M19 6l1.5-1.5" />
  </svg>
);

export const IconPlay = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

export const IconPause = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6.5" y="5" width="3.5" height="14" rx="1.2" />
    <rect x="14" y="5" width="3.5" height="14" rx="1.2" />
  </svg>
);

export const IconReset = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12a7 7 0 1 1-2.1-5M19 5v3.5h-3.5" />
  </svg>
);

export const IconClose = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconBrush = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 4.5l4 4L10 18l-4.5.5L6 14z" />
    <path d="M5.5 18.5c-.7.7-1.3 2-1.5 3 1-.2 2.3-.8 3-1.5" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

export const IconUndo = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7L4 12l5 5" />
    <path d="M4 12h11a5 5 0 0 1 0 10h-1" />
  </svg>
);

export const IconEraser = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16.5l6-6 6 6-2.5 2.5H8.5z" />
    <path d="M10 10.5l4.5-4.5 5.5 5.5L15.5 16" />
    <path d="M5 20.5h15" />
  </svg>
);

export const IconFilm = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
  </svg>
);

export const IconSearch = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconHeart = ({ className, filled }: P & { filled?: boolean }) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.3-9.3-8.4C1.3 9 2.2 5.8 5.2 5c1.9-.5 3.7.4 4.8 1.9C11.1 5.4 12.9 4.5 14.8 5c3 .8 3.9 4 2.5 6.6C15 15.7 12 20 12 20z" />
  </svg>
);

export const IconSpark = ({ className }: P) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5l1.6 5.1a4 4 0 0 0 2.8 2.8L21.5 12l-5.1 1.6a4 4 0 0 0-2.8 2.8L12 21.5l-1.6-5.1a4 4 0 0 0-2.8-2.8L2.5 12l5.1-1.6a4 4 0 0 0 2.8-2.8z" />
  </svg>
);

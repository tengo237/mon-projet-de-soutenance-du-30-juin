/* Icônes line-art minimalistes — pas d'emoji, cohérentes avec l'identité. */

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export function Icon({ name, className = "ico", ...rest }) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg className={className} viewBox="0 0 24 24" {...base} {...rest} aria-hidden="true">
      {paths}
    </svg>
  );
}

const ICONS = {
  // Profils
  etudiant: <>
    <path d="M3 8l9-4 9 4-9 4-9-4z" />
    <path d="M7 10v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5" />
    <path d="M21 8v5" />
  </>,
  affaires: <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </>,
  famille: <>
    <circle cx="8" cy="8" r="2.4" />
    <circle cx="16" cy="9" r="2" />
    <path d="M3.5 19c0-2.5 2-4.2 4.5-4.2S12.5 16.5 12.5 19" />
    <path d="M13.5 19c.3-2 1.6-3.2 3.3-3.2 1.9 0 3.2 1.4 3.2 3.2" />
  </>,
  decouverte: <>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
  </>,
  // Équipements
  has_generator: <><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></>,
  has_hot_water: <><path d="M12 3c2.5 3 4 5 4 7a4 4 0 1 1-8 0c0-2 1.5-4 4-7z" /></>,
  has_ac: <><rect x="3" y="5" width="18" height="7" rx="2" /><path d="M7 16v1M12 16v2M17 16v1" /></>,
  has_wifi: <><path d="M5 12.5a10 10 0 0 1 14 0" /><path d="M8 15.5a6 6 0 0 1 8 0" /><circle cx="12" cy="19" r=".8" fill="currentColor" stroke="none" /></>,
  has_parking: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 16V8h3.5a2.5 2.5 0 0 1 0 5H9" /></>,
  has_restaurant: <><path d="M6 3v8M9 3v8M7.5 11v10M7.5 3v3" /><path d="M16 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></>,
  // Réassurance
  shield: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  hand: <><path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V6a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-6 7s-6-2.2-6-5l-1.5-3a1.4 1.4 0 0 1 2.4-1.4L7 12" /></>,
  pin: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  lamp: <><path d="M9 21h6M10 21l.5-3h3l.5 3" /><path d="M7 9a5 5 0 1 1 10 0c0 2-1.2 3.3-2.3 4.2-.7.6-.7 1.2-.7 1.8h-4c0-.6 0-1.2-.7-1.8C8.2 12.3 7 11 7 9z" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
};

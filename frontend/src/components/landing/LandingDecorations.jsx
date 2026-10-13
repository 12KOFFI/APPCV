/**
 * Éléments vectoriels décoratifs inspirés du design system de LoopCV
 * Reproduits fidèlement en SVG natif réactif et léger.
 */

// 1. Cercle rayé bleu (Diagonal Striped Circle) - visible en haut à gauche
export function BlueStripedCircle({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diagStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#3B82F6" strokeWidth="3.5" />
        </pattern>
        <clipPath id="circleClip">
          <circle cx="30" cy="30" r="28" />
        </clipPath>
      </defs>
      <circle cx="30" cy="30" r="28" fill="url(#diagStripes)" clipPath="url(#circleClip)" />
    </svg>
  );
}

// 2. Triangle de points turquoise (Turquoise Dot Matrix Triangle) - visible à gauche
export function GreenDotMatrixTriangle({ className = 'w-14 h-14' }) {
  return (
    <svg className={className} viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rangée 1 (Sommet) */}
      <circle cx="50" cy="12" r="3.5" fill="#0D9488" />
      {/* Rangée 2 */}
      <circle cx="40" cy="24" r="3.5" fill="#0D9488" />
      <circle cx="50" cy="24" r="3.5" fill="#0D9488" />
      {/* Rangée 3 */}
      <circle cx="30" cy="36" r="3.5" fill="#0D9488" />
      <circle cx="40" cy="36" r="3.5" fill="#0D9488" />
      <circle cx="50" cy="36" r="3.5" fill="#0D9488" />
      {/* Rangée 4 */}
      <circle cx="20" cy="48" r="3.5" fill="#0D9488" />
      <circle cx="30" cy="48" r="3.5" fill="#0D9488" />
      <circle cx="40" cy="48" r="3.5" fill="#0D9488" />
      <circle cx="50" cy="48" r="3.5" fill="#0D9488" />
      {/* Rangée 5 (Base) */}
      <circle cx="10" cy="60" r="3.5" fill="#0D9488" />
      <circle cx="20" cy="60" r="3.5" fill="#0D9488" />
      <circle cx="30" cy="60" r="3.5" fill="#0D9488" />
      <circle cx="40" cy="60" r="3.5" fill="#0D9488" />
      <circle cx="50" cy="60" r="3.5" fill="#0D9488" />
    </svg>
  );
}

// 3. Vagues roses ondulées (Pink Wavy Lines) - visible en bas à gauche
export function PinkSquigglyWaves({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 5 10 Q 15 2 25 10 T 45 10 T 55 10"
        stroke="#FB7185"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 5 20 Q 15 12 25 20 T 45 20 T 55 20"
        stroke="#FB7185"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 5 30 Q 15 22 25 30 T 45 30 T 55 30"
        stroke="#FB7185"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 5 40 Q 15 32 25 40 T 45 40 T 55 40"
        stroke="#FB7185"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 4. Crochet / Ligne courbée turquoise (Teal Curved Snake) - visible à droite
export function TealCurvedSnake({ className = 'w-10 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 30 10 C 15 15, 10 30, 25 40 C 32 45, 30 52, 22 55"
        stroke="#0D9488"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 5. Ondulations bleues empilées (Blue Multi Waves) - visible à droite au centre
export function BlueMultiWaves({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 5 12 Q 15 4 25 12 T 45 12" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 5 22 Q 15 14 25 22 T 45 22" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 5 32 Q 15 24 25 32 T 45 32" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 5 42 Q 15 34 25 42 T 45 42" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 6. Ruban Magenta M (Magenta Fluid M Shape) - visible en bas à droite
export function MagentaRibbonM({ className = 'w-16 h-14' }) {
  return (
    <svg className={className} viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 12 50 C 10 30, 16 10, 24 10 C 30 10, 32 35, 38 35 C 44 35, 48 12, 54 12 C 60 12, 62 38, 64 48"
        stroke="#EC4899"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function AuthIllustration({ className = 'w-full max-w-md' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 560 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm select-none"
      >
        {/* Nuages / Buissons décoratifs en arrière-plan */}
        <path
          d="M 80 400 C 60 350, 110 280, 170 300 C 210 260, 260 310, 270 400 Z"
          fill="#F1F5F9"
          opacity="0.9"
        />
        <path
          d="M 360 400 C 370 330, 430 290, 480 320 C 520 280, 560 340, 550 400 Z"
          fill="#F1F5F9"
          opacity="0.9"
        />

        {/* Ligne de sol */}
        <line
          x1="60"
          y1="400"
          x2="510"
          y2="400"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Grande Porte en Arche Grise */}
        <path
          d="M 210 400 L 210 200 A 95 95 0 0 1 400 200 L 400 400 Z"
          fill="#D1D5DB"
        />

        {/* Panneau intérieur / vitres en retrait */}
        <rect
          x="235"
          y="170"
          width="140"
          height="195"
          rx="4"
          fill="#FFFFFF"
        />

        {/* Cadre et séparateurs de fenêtre (6 carreaux) */}
        <line
          x1="305"
          y1="170"
          x2="305"
          y2="365"
          stroke="#D1D5DB"
          strokeWidth="4"
        />
        <line
          x1="235"
          y1="235"
          x2="375"
          y2="235"
          stroke="#D1D5DB"
          strokeWidth="4"
        />
        <line
          x1="235"
          y1="300"
          x2="375"
          y2="300"
          stroke="#D1D5DB"
          strokeWidth="4"
        />

        {/* Poignée de porte violette LoopCV */}
        <circle cx="395" cy="305" r="9" fill="#7C3AED" />

        {/* Bras gauche du personnage atteignant la poignée */}
        <path
          d="M 425 240 Q 405 270 396 303"
          stroke="#FCD34D"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tête & Cheveux */}
        <circle cx="438" cy="205" r="14" fill="#FCD34D" />
        <path
          d="M 428 200 C 430 188, 448 188, 452 200 C 454 212, 436 215, 428 200 Z"
          fill="#0F172A"
        />

        {/* T-Shirt Violet / Indigo LoopCV */}
        <path
          d="M 422 222 L 452 222 L 450 286 L 424 286 Z"
          fill="#6366F1"
          rx="3"
        />

        {/* Bras droit le long du corps */}
        <path
          d="M 452 228 Q 456 258 454 288"
          stroke="#FCD34D"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pantalon Sombre */}
        <rect x="424" y="286" width="11" height="106" rx="3" fill="#0F172A" />
        <rect x="441" y="286" width="11" height="106" rx="3" fill="#0F172A" />

        {/* Chaussures */}
        <ellipse cx="429" cy="397" rx="9" ry="5" fill="#020617" />
        <ellipse cx="447" cy="397" rx="9" ry="5" fill="#020617" />
      </svg>
    </div>
  );
}

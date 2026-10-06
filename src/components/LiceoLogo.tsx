import React from 'react';

interface LiceoLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'shield-only' | 'horizontal';
  showText?: boolean;
}

/**
 * Logotipo y Escudo Oficial Institucional:
 * "ELECTROTECNIA - LICEO INDUSTRIAL - SFF"
 * Fiel al blasón institucional con la antena parabólica, cordillera nevada,
 * torre de celosía, insignia SFF y cintas conmemorativas.
 */
export const LiceoLogo: React.FC<LiceoLogoProps> = ({
  className = 'w-10 h-10',
  size,
  variant = 'shield-only',
  showText = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'shrink-0'}`}>
      <svg
        viewBox="0 0 400 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} drop-shadow-sm`}
        style={style}
      >
        <defs>
          {/* Sombra suave para la antena y relieves */}
          <filter id="shieldShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
          </filter>

          {/* Gradiente sutil para el cielo azul institucional */}
          <linearGradient id="skyGradient" x1="200" y1="90" x2="200" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#005BAA" />
            <stop offset="100%" stopColor="#1B365D" />
          </linearGradient>

          {/* Gradiente para la antena parabólica */}
          <linearGradient id="dishGrad" x1="160" y1="130" x2="270" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E6ECF5" />
            <stop offset="100%" stopColor="#CBD5E0" />
          </linearGradient>

          {/* Clip path para contener los elementos dentro del escudo */}
          <clipPath id="shieldInteriorClip">
            <path d="M 52 28 L 348 28 L 348 306 L 200 380 L 52 306 Z" />
          </clipPath>
        </defs>

        {/* 1. BORDE EXTERIOR ROJO INSTITUCIONAL DEL ESCUDO */}
        <path
          d="M 40 18 L 360 18 L 360 314 L 200 398 L 40 314 Z"
          fill="#D62828"
        />

        {/* 2. BORDE INTERIOR BLANCO */}
        <path
          d="M 46 24 L 354 24 L 354 310 L 200 390 L 46 310 Z"
          fill="#FFFFFF"
        />

        {/* 3. CONTORNO ROJO INTERNO */}
        <path
          d="M 52 28 L 348 28 L 348 306 L 200 380 L 52 306 Z"
          fill="#D62828"
        />

        {/* ÁREA INTERIOR CON CLIP */}
        <g clipPath="url(#shieldInteriorClip)">
          {/* Fondo Blanco de Base */}
          <rect x="50" y="25" width="300" height="360" fill="#FFFFFF" />

          {/* 4. BANNER SUPERIOR: ELECTROTECNIA */}
          <g>
            {/* Fondo blanco del letrero superior */}
            <path
              d="M 52 28 L 348 28 L 348 116 L 208 98 L 52 116 Z"
              fill="#FFFFFF"
            />
            {/* Líneas rojas y azules de acento superior */}
            <path
              d="M 68 36 L 332 36 L 332 60 L 210 52 L 68 60 Z"
              fill="none"
              stroke="#D62828"
              strokeWidth="4"
            />

            {/* Texto ELECTROTECNIA */}
            <text
              x="200"
              y="90"
              textAnchor="middle"
              fill="#181A20"
              fontFamily="Arial Black, Impact, sans-serif"
              fontWeight="900"
              fontSize="29"
              letterSpacing="3"
            >
              ELECTROTECNIA
            </text>

            {/* Doble línea de quiebre angular bajo el texto */}
            <path
              d="M 52 108 L 206 94 L 348 108"
              fill="none"
              stroke="#D62828"
              strokeWidth="5"
            />
            <path
              d="M 52 116 L 206 102 L 348 116"
              fill="none"
              stroke="#D62828"
              strokeWidth="3"
            />
          </g>

          {/* 5. SECTOR CENTRAL: CIELO AZUL */}
          <path
            d="M 52 116 L 348 116 L 348 310 L 200 380 L 52 310 Z"
            fill="url(#skyGradient)"
          />

          {/* INSIGNIA OVALADA SFF (Sociedad de Fomento Fabril) */}
          <g transform="translate(74, 126)">
            <ellipse cx="25" cy="18" rx="24" ry="16" fill="#005BAA" stroke="#FFFFFF" strokeWidth="3" />
            <text
              x="25"
              y="24"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial Black, sans-serif"
              fontWeight="900"
              fontSize="16"
              letterSpacing="1"
            >
              SFF
            </text>
          </g>

          {/* 6. CORDILLERA / MONTAÑAS NEVADAS DE CHILE */}
          <path
            d="M 52 230 Q 120 160 170 200 T 260 180 T 348 210 L 348 280 L 52 280 Z"
            fill="#FFFFFF"
          />

          {/* COLINAS / TERRENO ROJO INFERIOR */}
          <path
            d="M 52 248 Q 110 200 160 230 T 260 220 T 348 238 L 348 350 L 52 350 Z"
            fill="#D62828"
          />

          {/* 7. TORRE DE CELOSÍA METÁLICA (Truss Tower) */}
          <g stroke="#181A20" strokeWidth="4" strokeLinecap="round" fill="none">
            {/* Marco de la torre */}
            <path d="M 195 240 L 195 305" />
            <path d="M 255 240 L 255 305" />
            <path d="M 195 240 L 255 240" strokeWidth="5" />
            <path d="M 195 305 L 255 305" strokeWidth="5" />
            {/* Refuerzos cruzados (San Andrés) */}
            <line x1="195" y1="240" x2="255" y2="305" strokeWidth="3.5" />
            <line x1="255" y1="240" x2="195" y2="305" strokeWidth="3.5" />
            {/* Soporte vertical central */}
            <line x1="225" y1="220" x2="225" y2="240" strokeWidth="6" />
            <line x1="210" y1="230" x2="225" y2="220" strokeWidth="4" />
            <line x1="240" y1="230" x2="225" y2="220" strokeWidth="4" />
          </g>

          {/* 8. ANTENA PARABÓLICA SATELITAL */}
          <g filter="url(#shieldShadow)">
            {/* Plato de la parábola (Elipse inclinada) */}
            <ellipse
              cx="205"
              cy="190"
              rx="62"
              ry="40"
              transform="rotate(-28 205 190)"
              fill="url(#dishGrad)"
              stroke="#181A20"
              strokeWidth="4"
            />
            {/* Borde interior reflector */}
            <ellipse
              cx="205"
              cy="190"
              rx="55"
              ry="34"
              transform="rotate(-28 205 190)"
              fill="none"
              stroke="#CBD5E0"
              strokeWidth="2"
            />
            {/* Brazo del foco alimentador (Feed Horn) */}
            <path
              d="M 195 200 Q 210 180 205 170 Q 200 162 192 170"
              fill="none"
              stroke="#181A20"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Bocina iluminadora en el centro focal */}
            <circle cx="205" cy="170" r="4.5" fill="#181A20" />
          </g>

          {/* 9. CINTA / PERGAMINO BLANCO INFERIOR: "LICEO INDUSTRIAL" */}
          <g id="ribbonGroup">
            {/* Sombra de la cinta */}
            <path
              d="M 75 272 Q 200 350 325 272 L 325 316 Q 200 395 75 316 Z"
              fill="#991B1B"
            />
            {/* Cuerpo de la cinta blanca */}
            <path
              d="M 72 268 Q 200 344 328 268 L 328 312 Q 200 388 72 312 Z"
              fill="#FFFFFF"
              stroke="#181A20"
              strokeWidth="4"
            />

            {/* Pliegues en rollos extremos de la cinta */}
            {/* Extremo Izquierdo */}
            <path
              d="M 72 268 C 62 268 62 312 72 312 C 80 312 80 268 72 268"
              fill="#F5F6F8"
              stroke="#181A20"
              strokeWidth="3"
            />
            {/* Extremo Derecho */}
            <path
              d="M 328 268 C 338 268 338 312 328 312 C 320 312 320 268 328 268"
              fill="#F5F6F8"
              stroke="#181A20"
              strokeWidth="3"
            />

            {/* Texto curvilíneo sobre la cinta */}
            <path
              id="ribbonCurve"
              d="M 76 298 Q 200 372 324 298"
              fill="none"
            />
            <text fill="#181A20" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="23" letterSpacing="3">
              <textPath href="#ribbonCurve" startOffset="50%" textAnchor="middle">
                LICEO INDUSTRIAL
              </textPath>
            </text>
          </g>
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-bold text-[#1B365D] tracking-tight text-base sm:text-lg leading-tight uppercase">
            Liceo Industrial
          </span>
          <span className="text-[11px] font-semibold text-[#E85D04] tracking-wider uppercase">
            Especialidad Electrotecnia &bull; liceorbl.cl
          </span>
        </div>
      )}
    </div>
  );
};

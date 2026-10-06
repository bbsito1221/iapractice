import React from 'react';

/**
 * Utilidad para optimizar la experiencia móvil cuando se abre el teclado virtual.
 * - Evita que el teclado tape el campo donde el usuario está escribiendo.
 * - Desplaza suavemente el elemento al centro visible de la pantalla.
 */

export const handleInputFocusScroll = (
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const target = e.currentTarget;
  if (!target) return;

  // Ajuste en múltiples tiempos para sincronizar con la animación del teclado en iOS y Android
  setTimeout(() => {
    try {
      target.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    } catch {}
  }, 120);

  setTimeout(() => {
    try {
      target.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    } catch {}
  }, 320);
};

// Listener global para redimensionamiento del visualViewport (estándar moderno móvil)
if (typeof window !== 'undefined' && window.visualViewport) {
  let timer: any;
  window.visualViewport.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  });
}

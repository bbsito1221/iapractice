import React, { createContext, useContext, useEffect } from 'react';

export type ModoTema = 'light';
export type TemaActivo = 'light';

interface ThemeContextType {
  theme: ModoTema;
  actualTheme: TemaActivo;
  setTheme: (mode: ModoTema) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  actualTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Asegurar modo claro permanente y eliminar clases oscuras
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    try {
      localStorage.removeItem('bitacora_digital_theme');
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        actualTheme: 'light',
        setTheme: () => {},
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);


import React from 'react';
import { BookOpen, Code2, Plus, Download } from 'lucide-react';

interface HeaderProps {
  vistaActiva: 'bitacora' | 'codigo';
  setVistaActiva: (vista: 'bitacora' | 'codigo') => void;
  onNuevaEntrada: () => void;
  onExportarJSON: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vistaActiva,
  setVistaActiva,
  onNuevaEntrada,
  onExportarJSON,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">Bitácora</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Digital
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Registro de actividades y notas técnicas</p>
          </div>
        </div>

        {/* Selector de Vistas: Bitácora Interactiva vs Código Fuente Flask */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium">
          <button
            id="tab-bitacora"
            onClick={() => setVistaActiva('bitacora')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              vistaActiva === 'bitacora'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Bitácora</span>
          </button>
          <button
            id="tab-codigo-flask"
            onClick={() => setVistaActiva('codigo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              vistaActiva === 'codigo'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Código Flask</span>
          </button>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {vistaActiva === 'bitacora' && (
            <>
              <button
                id="btn-exportar-json"
                onClick={onExportarJSON}
                title="Descargar copia de respaldo en JSON"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
              <button
                id="btn-nueva-entrada"
                onClick={onNuevaEntrada}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Entrada</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

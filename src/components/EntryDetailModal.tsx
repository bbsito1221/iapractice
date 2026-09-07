import React from 'react';
import { EntradaBitacora } from '../types';
import { X, Calendar, Tag, Edit3, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface EntryDetailModalProps {
  entrada: EntradaBitacora | null;
  onClose: () => void;
  onEditar: (entrada: EntradaBitacora) => void;
  onEliminar: (id: number) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entrada,
  onClose,
  onEditar,
  onEliminar,
}) => {
  if (!entrada) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {entrada.categoria}
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: #{entrada.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onEditar(entrada);
              }}
              title="Editar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas eliminar esta entrada?')) {
                  onEliminar(entrada.id);
                  onClose();
                }
              }}
              title="Eliminar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-6 space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {entrada.titulo}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 py-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Fecha: <strong>{entrada.fecha}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Estado: <strong>{entrada.estado}</strong></span>
            </div>
          </div>

          {/* Tags */}
          {entrada.tags && entrada.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {entrada.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
                >
                  <Tag className="w-3 h-3 opacity-50" />
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Cuerpo */}
          <div className="pt-2 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            {entrada.contenido}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Registrado localmente</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

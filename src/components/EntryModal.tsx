import React, { useState, useEffect } from 'react';
import { EntradaBitacora, EstadoEntrada } from '../types';
import { X, Calendar, Tag, AlertCircle } from 'lucide-react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entrada: Omit<EntradaBitacora, 'id' | 'creadoEn'> & { id?: number }) => void;
  entradaParaEditar?: EntradaBitacora | null;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entradaParaEditar,
}) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Desarrollo');
  const [fecha, setFecha] = useState('');
  const [contenido, setContenido] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [estado, setEstado] = useState<EstadoEntrada>('Completado');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entradaParaEditar) {
      setTitulo(entradaParaEditar.titulo);
      setCategoria(entradaParaEditar.categoria);
      setFecha(entradaParaEditar.fecha);
      setContenido(entradaParaEditar.contenido);
      setTagsInput(entradaParaEditar.tags.join(', '));
      setEstado(entradaParaEditar.estado);
    } else {
      setTitulo('');
      setCategoria('Desarrollo');
      setFecha(new Date().toISOString().split('T')[0]);
      setContenido('');
      setTagsInput('');
      setEstado('Completado');
    }
    setError('');
  }, [entradaParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título de la entrada es requerido.');
      return;
    }
    if (!contenido.trim()) {
      setError('El contenido u observaciones no pueden estar vacíos.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onSave({
      id: entradaParaEditar?.id,
      titulo: titulo.trim(),
      categoria: categoria.trim() || 'General',
      fecha: fecha || new Date().toISOString().split('T')[0],
      contenido: contenido.trim(),
      tags,
      estado,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {entradaParaEditar ? 'Editar Entrada de Bitácora' : 'Nueva Entrada de Bitácora'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Completa los campos para documentar tus actividades y aprendizajes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título de la entrada <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Implementación de base de datos SQLite y rutas Flask"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Fila: Categoría, Fecha y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <input
                type="text"
                list="lista-categorias"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Desarrollo"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <datalist id="lista-categorias">
                <option value="Desarrollo" />
                <option value="Investigación" />
                <option value="Base de Datos" />
                <option value="Incidencias" />
                <option value="Reuniones" />
                <option value="Aprendizaje" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoEntrada)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Completado">Completado</option>
                <option value="En progreso">En progreso</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Etiquetas (separadas por comas)
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="flask, backend, sqlite, frontend"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ejemplo: <code className="text-slate-600">python, api, bugs</code>
            </p>
          </div>

          {/* Contenido / Observaciones */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contenido / Registro Detallado <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {contenido.length} caracteres
              </span>
            </div>
            <textarea
              required
              rows={7}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe detalladamente los pasos ejecutados, decisiones de diseño, dificultades técnicas y resultados..."
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {entradaParaEditar ? 'Guardar Cambios' : 'Registrar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

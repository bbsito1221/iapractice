import React, { useMemo } from 'react';
import { EntradaBitacora, EstadoEntrada } from '../types';
import { Search, Calendar, Tag, Trash2, Edit3, Eye, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface EntryListProps {
  entradas: EntradaBitacora[];
  busqueda: string;
  setBusqueda: (q: string) => void;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (cat: string) => void;
  onVerEntrada: (entrada: EntradaBitacora) => void;
  onEditarEntrada: (entrada: EntradaBitacora) => void;
  onEliminarEntrada: (id: number) => void;
  onNuevaEntrada: () => void;
}

export const EntryList: React.FC<EntryListProps> = ({
  entradas,
  busqueda,
  setBusqueda,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  onVerEntrada,
  onEditarEntrada,
  onEliminarEntrada,
  onNuevaEntrada,
}) => {
  // Lista de categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(entradas.map((e) => e.categoria));
    return Array.from(cats).filter(Boolean);
  }, [entradas]);

  // Filtrado de entradas
  const entradasFiltradas = useMemo(() => {
    return entradas.filter((entrada) => {
      const coincideBusqueda =
        busqueda.trim() === '' ||
        entrada.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        entrada.contenido.toLowerCase().includes(busqueda.toLowerCase()) ||
        entrada.tags.some((t) => t.toLowerCase().includes(busqueda.toLowerCase()));

      const coincideCategoria =
        categoriaSeleccionada === '' || entrada.categoria === categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }, [entradas, busqueda, categoriaSeleccionada]);

  // Resumen estadístico
  const stats = useMemo(() => {
    return {
      total: entradas.length,
      completadas: entradas.filter((e) => e.estado === 'Completado').length,
      enProgreso: entradas.filter((e) => e.estado === 'En progreso').length,
    };
  }, [entradas]);

  const getEstadoBadge = (estado: EstadoEntrada) => {
    switch (estado) {
      case 'Completado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Completado
          </span>
        );
      case 'En progreso':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            En progreso
          </span>
        );
      case 'Bloqueado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            Bloqueado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Estadísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bitácora de Actividades
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro diario de avances, notas técnicas, incidencias y aprendizajes.
          </p>
        </div>

        {/* Métricas rápidas */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs text-center min-w-[80px]">
            <span className="block text-xl font-bold text-blue-600 leading-tight">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Total</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs text-center min-w-[80px]">
            <span className="block text-xl font-bold text-emerald-600 leading-tight">
              {stats.completadas}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Completadas</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs text-center min-w-[80px]">
            <span className="block text-xl font-bold text-amber-600 leading-tight">
              {stats.enProgreso}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">En curso</span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro de Categoría */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-buscar-entradas"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, contenido o etiqueta (#tag)..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-filtro-categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium"
          >
            <option value="">Todas las Categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(busqueda || categoriaSeleccionada) && (
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaSeleccionada('');
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Restablecer
            </button>
          )}
        </div>
      </div>

      {/* Grid de Entradas */}
      {entradasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entradasFiltradas.map((entrada) => (
            <article
              key={entrada.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Meta superior */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {entrada.categoria}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{entrada.fecha}</span>
                  </div>
                </div>

                {/* Título */}
                <h3
                  onClick={() => onVerEntrada(entrada)}
                  className="font-bold text-slate-900 text-lg leading-snug hover:text-blue-600 transition-colors cursor-pointer mb-2 line-clamp-2"
                >
                  {entrada.titulo}
                </h3>

                {/* Resumen del contenido */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {entrada.contenido}
                </p>

                {/* Etiquetas */}
                {entrada.tags && entrada.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {entrada.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        onClick={() => setBusqueda(tag)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5 opacity-60" />
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pie de la tarjeta */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>{getEstadoBadge(entrada.estado)}</div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onVerEntrada(entrada)}
                    title="Ver detalle"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditarEntrada(entrada)}
                    title="Editar entrada"
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEliminarEntrada(entrada.id)}
                    title="Eliminar entrada"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No se encontraron entradas</h3>
          <p className="text-sm text-slate-500 mb-5">
            {busqueda || categoriaSeleccionada
              ? 'No hay registros que coincidan con los filtros aplicados.'
              : 'Aún no has registrado ninguna entrada en tu bitácora.'}
          </p>
          <button
            onClick={onNuevaEntrada}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear primera entrada</span>
          </button>
        </div>
      )}
    </div>
  );
};

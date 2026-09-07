/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EntradaBitacora } from './types';
import { Header } from './components/Header';
import { EntryList } from './components/EntryList';
import { EntryModal } from './components/EntryModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { FlaskCodeViewer } from './components/FlaskCodeViewer';

const ENTRADAS_INICIALES: EntradaBitacora[] = [
  {
    id: 1,
    titulo: 'Definición de Arquitectura: Flask + SQLite + HTML/CSS/JS',
    categoria: 'Desarrollo',
    fecha: new Date().toISOString().split('T')[0],
    contenido:
      'Se estructuró el proyecto completo de Bitácora Digital empleando Flask para el enrutamiento y backend, SQLite3 como base de datos ligera y portable, y HTML5/CSS3/JavaScript para la experiencia interactiva.',
    tags: ['flask', 'python', 'sqlite', 'arquitectura'],
    estado: 'Completado',
    creadoEn: new Date().toISOString(),
  },
  {
    id: 2,
    titulo: 'Creación de Plantillas Jinja2 y Sistema de Estilos CSS',
    categoria: 'Frontend',
    fecha: new Date().toISOString().split('T')[0],
    contenido:
      'Se diseñó una interfaz moderna basada en la plantilla base.html con mensajes flash, buscador en vivo, badges por categoría y filtros dinámicos adaptables a dispositivos móviles.',
    tags: ['jinja2', 'css', 'html5', 'responsive'],
    estado: 'Completado',
    creadoEn: new Date().toISOString(),
  },
  {
    id: 3,
    titulo: 'Pruebas de Registro y Exportación de Datos',
    categoria: 'Control de Calidad',
    fecha: new Date().toISOString().split('T')[0],
    contenido:
      'Verificación del flujo completo de creación, edición y eliminación de registros (CRUD) y generación de archivo JSON de respaldo.',
    tags: ['qa', 'testing', 'crud', 'json'],
    estado: 'En progreso',
    creadoEn: new Date().toISOString(),
  },
];

export default function App() {
  const [entradas, setEntradas] = useState<EntradaBitacora[]>(() => {
    try {
      const saved = localStorage.getItem('bitacora_digital_entradas');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return ENTRADAS_INICIALES;
  });

  const [vistaActiva, setVistaActiva] = useState<'bitacora' | 'codigo'>('bitacora');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [entradaParaEditar, setEntradaParaEditar] = useState<EntradaBitacora | null>(null);
  const [entradaDetalle, setEntradaDetalle] = useState<EntradaBitacora | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('bitacora_digital_entradas', JSON.stringify(entradas));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }, [entradas]);

  const handleGuardarEntrada = (
    datos: Omit<EntradaBitacora, 'id' | 'creadoEn'> & { id?: number }
  ) => {
    if (datos.id) {
      // Editar existente
      setEntradas((prev) =>
        prev.map((item) =>
          item.id === datos.id
            ? {
                ...item,
                titulo: datos.titulo,
                categoria: datos.categoria,
                fecha: datos.fecha,
                contenido: datos.contenido,
                tags: datos.tags,
                estado: datos.estado,
              }
            : item
        )
      );
    } else {
      // Crear nueva
      const nueva: EntradaBitacora = {
        id: Date.now(),
        titulo: datos.titulo,
        categoria: datos.categoria,
        fecha: datos.fecha,
        contenido: datos.contenido,
        tags: datos.tags,
        estado: datos.estado,
        creadoEn: new Date().toISOString(),
      };
      setEntradas((prev) => [nueva, ...prev]);
    }
  };

  const handleEliminarEntrada = (id: number) => {
    setEntradas((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExportarJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entradas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bitacora_exportada.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Barra de navegación superior */}
      <Header
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        onNuevaEntrada={() => {
          setEntradaParaEditar(null);
          setModalAbierto(true);
        }}
        onExportarJSON={handleExportarJSON}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {vistaActiva === 'bitacora' ? (
          <EntryList
            entradas={entradas}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            categoriaSeleccionada={categoriaSeleccionada}
            setCategoriaSeleccionada={setCategoriaSeleccionada}
            onVerEntrada={(entrada) => setEntradaDetalle(entrada)}
            onEditarEntrada={(entrada) => {
              setEntradaParaEditar(entrada);
              setModalAbierto(true);
            }}
            onEliminarEntrada={handleEliminarEntrada}
            onNuevaEntrada={() => {
              setEntradaParaEditar(null);
              setModalAbierto(true);
            }}
          />
        ) : (
          <FlaskCodeViewer />
        )}
      </main>

      {/* Pie de página */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>
            Bitácora Digital &bull; Proyecto con arquitectura <strong>Flask (Python) + SQLite3 + HTML5 + CSS3 + JS</strong>
          </p>
          <p className="mt-1 text-slate-400">
            Los archivos listos para ejecutar se encuentran en el directorio <code className="text-slate-600 font-mono">/flask_app/</code>
          </p>
        </div>
      </footer>

      {/* Modal de Crear / Editar */}
      <EntryModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setEntradaParaEditar(null);
        }}
        onSave={handleGuardarEntrada}
        entradaParaEditar={entradaParaEditar}
      />

      {/* Modal de Vista Detalle */}
      <EntryDetailModal
        entrada={entradaDetalle}
        onClose={() => setEntradaDetalle(null)}
        onEditar={(entrada) => {
          setEntradaParaEditar(entrada);
          setModalAbierto(true);
        }}
        onEliminar={handleEliminarEntrada}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { FLASK_FILES } from '../data/flaskProjectFiles';
import { FlaskFile } from '../types';
import { Copy, Check, Download, FileCode, Terminal, Folder, ExternalLink, HelpCircle } from 'lucide-react';

export const FlaskCodeViewer: React.FC = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<FlaskFile>(FLASK_FILES[0]);
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(archivoSeleccionado.contenido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDescargarArchivo = (archivo: FlaskFile) => {
    const blob = new Blob([archivo.contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivo.nombre.split('/').pop() || 'archivo.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDescargarTodoComoScript = () => {
    // Generar un script zip / bash o json con todos los archivos para fácil guardado
    const data = {
      proyecto: 'Bitácora Digital en Flask',
      version: '1.0.0',
      archivos: FLASK_FILES.map((f) => ({
        ruta: f.ruta,
        contenido: f.contenido,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bitacora_flask_proyecto_completo.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Código Fuente del Proyecto Flask
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Python + Flask + SQLite
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Estructura completa con servidor Flask, plantillas Jinja2, estilos CSS y scripts JS nativos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDescargarTodoComoScript}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Archivos</span>
          </button>
        </div>
      </div>

      {/* Guía Rápida de Ejecución */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Comandos para ejecutar Flask localmente:</h4>
            <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs">
              <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                pip install -r requirements.txt
              </span>
              <span className="text-slate-500">&rarr;</span>
              <span className="bg-slate-800 px-2.5 py-1 rounded text-emerald-400 font-bold">
                python app.py
              </span>
              <span className="text-slate-500">&rarr;</span>
              <span className="text-blue-400">http://127.0.0.1:5000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visor de Archivos (IDE Layout) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
        {/* Explorador de archivos a la izquierda */}
        <div className="w-full lg:w-72 bg-slate-50/80 border-r border-slate-200 p-4 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>Archivos del Proyecto</span>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1">
            {FLASK_FILES.map((archivo) => {
              const isSelected = archivoSeleccionado.nombre === archivo.nombre;
              return (
                <button
                  key={archivo.nombre}
                  onClick={() => setArchivoSeleccionado(archivo)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{archivo.nombre}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {archivo.lenguaje}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 px-2 text-[11px] text-slate-500">
            <p>
              Todos los archivos ya están creados en la carpeta <code className="text-slate-800 font-bold">/flask_app/</code>.
            </p>
          </div>
        </div>

        {/* Panel de Código a la derecha */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Barra superior de archivo */}
          <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {archivoSeleccionado.nombre}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  — {archivoSeleccionado.descripcion}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDescargarArchivo(archivoSeleccionado)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          {/* Código fuente con scroll */}
          <div className="flex-1 p-4 sm:p-6 overflow-auto bg-[#0d1117] text-slate-100 font-mono text-xs leading-relaxed max-h-[520px]">
            <pre className="whitespace-pre">
              <code>{archivoSeleccionado.contenido}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

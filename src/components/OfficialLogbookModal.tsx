import React, { useState } from 'react';
import { EntradaBitacora, UsuarioApp, EmpresaPractica } from '../types';
import { generarReportePDFBitacora } from '../utils/pdfGenerator';
import {
  X,
  Printer,
  FileDown,
  CheckCircle2,
  Building2,
  User,
  Clock,
  FileText,
  ShieldCheck,
  Award,
  Check,
  Loader2,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

interface OfficialLogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumno: UsuarioApp | null;
  entradas: EntradaBitacora[];
  empresa?: EmpresaPractica | null;
  profesor?: UsuarioApp | null;
  tutor?: UsuarioApp | null;
}

export const OfficialLogbookModal: React.FC<OfficialLogbookModalProps> = ({
  isOpen,
  onClose,
  alumno,
  entradas,
  empresa,
  profesor,
  tutor,
}) => {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [descargaExitosa, setDescargaExitosa] = useState<string | null>(null);

  if (!isOpen || !alumno) return null;

  // Filtrar entradas solo de este alumno
  const entradasAlumno = entradas.filter(
    (e) => e.autorId === alumno.id || e.autorEmail === alumno.email || e.rutAlumno === alumno.rut
  );

  const horasAprobadas = entradasAlumno
    .filter((e) => e.estadoVerificacion === 'Verificado')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

  const horasEnRevision = entradasAlumno
    .filter((e) => !e.estadoVerificacion || e.estadoVerificacion === 'Pendiente')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

  const horasObservadas = entradasAlumno
    .filter((e) => e.estadoVerificacion === 'Observado')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

  const horasTotalesRegistradas = horasAprobadas + horasEnRevision + horasObservadas;
  const horasRequeridas = alumno.horasRequeridas || 360;
  const porcentaje = Math.min(100, Math.round((horasAprobadas / horasRequeridas) * 100));
  const horasFaltantes = Math.max(0, horasRequeridas - horasAprobadas);
  const esCompletado = horasAprobadas >= horasRequeridas;

  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const folioDoc = `CL-FOLIO-${(alumno.rut || '204819325').replace(/[^0-9Kk]/g, '').slice(-5).toUpperCase()}-2026`;

  // FUNCIÓN PARA DESCARGAR REPORTE EN FORMATO PDF
  const handleDescargarPDF = () => {
    try {
      setGenerandoPDF(true);
      setDescargaExitosa(null);

      // Pequeño retardo no bloqueante para feedback en UI
      setTimeout(() => {
        const nombreArchivo = generarReportePDFBitacora({
          alumno,
          entradas: entradasAlumno,
          empresa,
          profesor,
          tutor,
        });

        setGenerandoPDF(false);
        setDescargaExitosa(nombreArchivo);

        setTimeout(() => {
          setDescargaExitosa(null);
        }, 6000);
      }, 400);
    } catch (error) {
      console.error('Error al generar PDF de bitácora:', error);
      setGenerandoPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-[#2D3748] rounded-2xl w-full max-w-4xl shadow-2xl border border-[#CBD5E0] overflow-hidden flex flex-col my-auto max-h-[94dvh] sm:max-h-[95vh] print:max-h-none print:border-none print:bg-white print:text-black print:rounded-none">
        {/* Barra superior de control (oculta al imprimir) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#CBD5E0] bg-[#1B365D] gap-2.5 print:hidden shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#E85D04]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-base font-bold text-white leading-tight">
                Libro Oficial de Bitácora &bull; Liceo Industrial
              </h2>
              <p className="text-[10px] sm:text-xs text-white/80 font-mono leading-tight mt-0.5">
                Folio: <strong className="text-[#FFD8BF]">{folioDoc}</strong> &bull; {entradasAlumno.length} jornadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* BOTÓN DESCARGAR REPORTE EN FORMATO PDF */}
            <button
              onClick={handleDescargarPDF}
              disabled={generandoPDF}
              className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 min-h-[38px] ${
                generandoPDF ? 'cursor-wait' : ''
              }`}
              title="Descargar libro oficial foliado con firmas en formato PDF"
            >
              {generandoPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 stroke-[2.5]" />
                  <span>Descargar Reporte PDF</span>
                </>
              )}
            </button>

            {/* BOTÓN IMPRIMIR */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
              title="Imprimir formato oficial o guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFD8BF]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-auto sm:ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación de Descarga Exitosa */}
        {descargaExitosa && (
          <div className="bg-[#E6F4EA] border-b border-[#CEEAD6] px-5 py-2.5 text-xs text-[#137333] flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#137333]" />
              <span>
                ¡Reporte PDF descargado con éxito! Archivo: <strong>{descargaExitosa}</strong>
              </span>
            </div>
            <button
              onClick={() => setDescargaExitosa(null)}
              className="text-[#137333] hover:underline text-xs font-mono ml-3 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* DOCUMENTO OFICIAL FOLIADO */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 text-xs sm:text-sm print:p-6 print:space-y-4 print:text-black bg-white print:bg-white">
          {/* Encabezado Oficial */}
          <div className="border-b-2 border-[#1B365D] pb-4 print:border-black text-center space-y-1">
            <p className="text-xs font-mono tracking-widest text-[#718096] uppercase print:text-gray-600 font-bold">
              Liceo Industrial &bull; Especialidad Electrotecnia &bull; liceorbl.cl
            </p>
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-[#1B365D] print:text-black">
              Libro Oficial de Bitácora de Práctica Profesional
            </h1>
            <p className="text-xs text-[#E85D04] font-mono font-bold print:text-gray-800">
              {alumno.institucion || 'Liceo Industrial - Especialidad Electrotecnia'}
            </p>
            <p className="text-xs font-mono text-[#718096] print:text-gray-500">
              Documento Foliado Digital: {folioDoc} &bull; Emisión: {fechaHoy}
            </p>
          </div>

          {/* Ficha 1: Antecedentes del Estudiante */}
          <div className="border border-[#CBD5E0] print:border-gray-400 rounded-xl p-4 bg-[#F5F6F8] print:bg-gray-50 space-y-2">
            <h3 className="text-xs font-bold uppercase font-mono text-[#1B365D] print:text-black border-b border-[#CBD5E0] print:border-gray-300 pb-1 flex items-center justify-between">
              <span>1. Antecedentes del Estudiante Practicante</span>
              <span className="text-xs text-[#718096] print:text-gray-600 font-normal">
                Perfil Curricular
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Nombre Completo:</span>
                <span className="font-bold text-[#2D3748] print:text-black">{alumno.nombre}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">RUT / RUN:</span>
                <span className="font-mono font-bold text-[#E85D04] print:text-black">{alumno.rut || 'Pendiente'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Matrícula / Folio:</span>
                <span className="font-mono text-[#2D3748] print:text-black">{alumno.matricula || '2026-REG'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Carrera / Especialidad:</span>
                <span className="font-semibold text-[#2D3748] print:text-black">{alumno.carrera || alumno.especialidad || 'Electricidad y Automatización'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Teléfono de Contacto:</span>
                <span className="font-mono text-[#2D3748] print:text-black">{alumno.telefono || '+56 9 8765 4321'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Correo Electrónico:</span>
                <span className="font-mono text-[#2D3748] print:text-black truncate">{alumno.email}</span>
              </div>
            </div>
          </div>

          {/* Ficha 2: Antecedentes del Centro de Práctica */}
          <div className="border border-[#CBD5E0] print:border-gray-400 rounded-xl p-4 bg-[#F5F6F8] print:bg-gray-50 space-y-2">
            <h3 className="text-xs font-bold uppercase font-mono text-[#1B365D] print:text-black border-b border-[#CBD5E0] print:border-gray-300 pb-1 flex items-center justify-between">
              <span>2. Antecedentes del Centro de Práctica y Supervisión</span>
              <span className="text-xs text-[#718096] print:text-gray-600 font-normal">
                Convenio Laboral
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Razón Social Empresa:</span>
                <span className="font-bold text-[#2D3748] print:text-black">{empresa?.nombre || alumno.empresaNombre || 'TechLogix Chile SpA'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">RUT Empresa:</span>
                <span className="font-mono font-bold text-[#E85D04] print:text-black">{empresa?.rut || '76.840.120-4'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Comuna y Región:</span>
                <span className="text-[#2D3748] print:text-black">{empresa?.comuna || 'Santiago'}, {empresa?.region || 'Región Metropolitana'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Tutor Empresa (Maestro Guía):</span>
                <span className="font-semibold text-[#2D3748] print:text-black">{tutor?.nombre || empresa?.supervisorNombre || alumno.tutorNombre || 'Ing. Supervisor Laboral'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Profesor Guía Académico:</span>
                <span className="font-semibold text-[#2D3748] print:text-black">{profesor?.nombre || alumno.profesorNombre || 'Profesor Supervisor'}</span>
              </div>
              <div>
                <span className="text-[#718096] print:text-gray-600 block text-xs">Período de Práctica:</span>
                <span className="font-mono text-[#2D3748] print:text-black">{alumno.fechaInicio || '12-01-2026'} al {alumno.fechaFinEstimada || '30-04-2026'}</span>
              </div>
            </div>
          </div>

          {/* Ficha 3: Cómputo Oficial de Horas */}
          <div className="border border-[#CBD5E0] print:border-gray-400 rounded-xl p-4 bg-white print:bg-gray-50 space-y-3">
            <div className="flex items-center justify-between border-b border-[#CBD5E0] print:border-gray-300 pb-2">
              <h3 className="text-xs font-bold uppercase font-mono text-[#1B365D] print:text-black flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E85D04]" />
                3. Desglose y Cómputo Curricular de Horas Cronológicas
              </h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                esCompletado
                  ? 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                  : 'bg-[#FFF0E6] text-[#E85D04] border border-[#FFD8BF]'
              }`}>
                {esCompletado ? 'REQUISITO CUMPLIDO (100%)' : `FALTAN ${horasFaltantes} HORAS`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#F5F6F8] print:bg-white p-3 rounded-lg border border-[#CBD5E0] print:border-gray-300">
                <span className="text-[#718096] print:text-gray-600 block font-mono text-xs uppercase font-bold">
                  Exigencia Curricular
                </span>
                <span className="font-mono font-bold text-lg text-[#2D3748] print:text-black">
                  {horasRequeridas} hrs
                </span>
                <span className="text-xs text-[#718096] print:text-gray-500 block">Norma 360h estándar</span>
              </div>

              <div className="bg-[#F5F6F8] print:bg-white p-3 rounded-lg border border-[#CEEAD6] print:border-gray-300">
                <span className="text-[#137333] print:text-gray-600 block font-mono text-xs uppercase font-bold">
                  Horas Acreditadas
                </span>
                <span className="font-mono font-bold text-lg text-[#137333] print:text-black">
                  {horasAprobadas} hrs
                </span>
                <span className="text-xs text-[#718096] print:text-gray-500 block">Visadas por docente</span>
              </div>

              <div className="bg-[#F5F6F8] print:bg-white p-3 rounded-lg border border-[#FFD8BF] print:border-gray-300">
                <span className="text-[#E85D04] print:text-gray-600 block font-mono text-xs uppercase font-bold">
                  Horas Por Validar
                </span>
                <span className="font-mono font-bold text-lg text-[#E85D04] print:text-black">
                  {horasEnRevision} hrs
                </span>
                <span className="text-xs text-[#718096] print:text-gray-500 block">En proceso de visado</span>
              </div>

              <div className="bg-[#F5F6F8] print:bg-white p-3 rounded-lg border border-[#CBD5E0] print:border-gray-300">
                <span className="text-[#718096] print:text-gray-600 block font-mono text-xs uppercase font-bold">
                  Total Registradas
                </span>
                <span className="font-mono font-bold text-lg text-[#2D3748] print:text-black">
                  {horasTotalesRegistradas} hrs
                </span>
                <span className="text-xs text-[#718096] print:text-gray-500 block">
                  {porcentaje}% acreditado
                </span>
              </div>
            </div>

            {/* Barra de progreso de horas */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#718096] print:text-gray-600">Progreso Curricular de Práctica:</span>
                <span className="font-bold text-[#137333] print:text-black">{porcentaje}% Acreditado</span>
              </div>
              <div className="w-full bg-[#F5F6F8] print:bg-gray-200 h-2.5 rounded-full overflow-hidden border border-[#CBD5E0] print:border-gray-300">
                <div
                  className="bg-[#137333] h-full rounded-full transition-all duration-500"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ficha 4: Tabla Foliada de Registro de Jornadas */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase font-mono text-[#1B365D] print:text-black flex items-center justify-between">
              <span>4. Registro Foliado de Jornadas Diarias de Práctica</span>
              <span className="text-xs text-[#718096] print:text-gray-600 font-normal">
                Total Registros: {entradasAlumno.length} jornadas
              </span>
            </h3>

            <div className="border border-[#CBD5E0] print:border-gray-400 rounded-xl overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-[#F5F6F8] print:bg-gray-200 border-b border-[#CBD5E0] print:border-gray-400 text-[#1B365D] print:text-black font-bold font-mono">
                  <tr>
                    <th className="p-2.5">Folio / Fecha</th>
                    <th className="p-2.5">Horario & Colación</th>
                    <th className="p-2.5 text-center">Horas</th>
                    <th className="p-2.5">Descripción de Tareas & Competencias</th>
                    <th className="p-2.5 text-center">V°B° Tutor Empresa</th>
                    <th className="p-2.5 text-center">Visado Docente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] print:divide-gray-300 text-[#2D3748] print:text-black">
                  {entradasAlumno.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[#718096] italic">
                        No hay jornadas registradas para este alumno aún.
                      </td>
                    </tr>
                  ) : (
                    entradasAlumno.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#F5F6F8] print:hover:bg-transparent">
                        <td className="p-2.5 font-mono">
                          <span className="font-bold text-[#E85D04] print:text-black">#{entry.id}</span>
                          <span className="block text-xs text-[#718096] print:text-gray-600">{entry.fecha}</span>
                        </td>
                        <td className="p-2.5 font-mono text-xs">
                          <span>{entry.horaEntrada || '08:30'} a {entry.horaSalida || '17:30'}</span>
                          <span className="block text-xs text-[#718096] print:text-gray-600">
                            Colación: {entry.colacionMinutos || 60}m
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#137333] print:text-black text-center">
                          {entry.horasRegistradas || 6} hrs
                        </td>
                        <td className="p-2.5 space-y-1 max-w-xs">
                          <span className="font-semibold block text-[#2D3748] print:text-black leading-tight">
                            {entry.titulo}
                          </span>
                          <span className="text-xs text-[#718096] print:text-gray-700 block line-clamp-2">
                            {entry.contenido}
                          </span>
                          {entry.competenciasAplicadas && (
                            <span className="text-xs text-[#137333] print:text-gray-800 italic block">
                              Competencias: {entry.competenciasAplicadas}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono text-xs">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-xs inline-block ${
                              entry.voboTutorEmpresa === 'Verificado'
                                ? 'bg-[#E6F4EA] text-[#137333] print:text-black'
                                : 'bg-[#FFF0E6] text-[#E85D04] print:text-gray-600'
                            }`}
                          >
                            {entry.voboTutorEmpresa === 'Verificado' ? '✓ Visado' : 'Pendiente'}
                          </span>
                          {entry.tutorEmpresaNombre && (
                            <span className="block text-[10px] text-[#718096] print:text-gray-500 truncate max-w-[100px] mx-auto">
                              {entry.tutorEmpresaNombre}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono text-xs">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-xs inline-block ${
                              entry.estadoVerificacion === 'Verificado'
                                ? 'bg-[#E6F4EA] text-[#137333] print:text-black'
                                : 'bg-[#FFF0E6] text-[#E85D04] print:text-gray-600'
                            }`}
                          >
                            {entry.estadoVerificacion === 'Verificado' ? '✓ Acreditado' : 'Pendiente'}
                          </span>
                          {entry.verificadoPor && (
                            <span className="block text-[10px] text-[#718096] print:text-gray-500 truncate max-w-[100px] mx-auto">
                              {entry.verificadoPor}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ficha 5: Cuadro de Firmas y Timbres Formales */}
          <div className="pt-6 pb-4 border-t border-[#CBD5E0] print:border-gray-400 space-y-4">
            <div className="text-center space-y-0.5">
              <h3 className="text-xs font-bold uppercase font-mono text-[#1B365D] print:text-black">
                5. Certificación de Conformidad y Firmas Electrónicas Avanzadas
              </h3>
              <p className="text-xs font-mono text-[#718096] print:text-gray-600">
                Emitido conforme a la Ley N° 19.799 sobre Documentos Electrónicos y Firma Electrónica en Chile
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Firma 1: Alumno Practicante */}
              <div className="bg-[#F5F6F8] print:bg-gray-50 border border-[#CBD5E0] print:border-gray-400 rounded-xl p-3.5 flex flex-col justify-between text-center space-y-2 relative overflow-hidden">
                <div className="inline-flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#137333] bg-[#E6F4EA] border border-[#CEEAD6] py-1 px-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Firma Digital Registrada</span>
                </div>

                <div className="py-2 border-y border-dashed border-[#CBD5E0] print:border-gray-400 space-y-0.5">
                  <span className="font-bold block text-[#2D3748] print:text-black">{alumno.nombre}</span>
                  <span className="text-xs font-mono text-[#E85D04] print:text-gray-700 block">
                    RUT: {alumno.rut || '20.481.932-5'}
                  </span>
                  <span className="text-xs text-[#718096] print:text-gray-600 block">
                    Estudiante Practicante
                  </span>
                </div>

                <div className="text-[10px] font-mono text-[#718096] print:text-gray-500 space-y-0.5">
                  <span>Fecha: {fechaHoy}</span>
                  <span className="block truncate text-[9px] text-[#A0AEC0]">
                    Token: {folioDoc}
                  </span>
                </div>
              </div>

              {/* Firma 2: Tutor de Empresa */}
              <div className="bg-[#F5F6F8] print:bg-gray-50 border border-[#CBD5E0] print:border-gray-400 rounded-xl p-3.5 flex flex-col justify-between text-center space-y-2 relative overflow-hidden">
                <div className="inline-flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#137333] bg-[#E6F4EA] border border-[#CEEAD6] py-1 px-2 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>V°B° Laboral Certificado</span>
                </div>

                <div className="py-2 border-y border-dashed border-[#CBD5E0] print:border-gray-400 space-y-0.5">
                  <span className="font-bold block text-[#2D3748] print:text-black">
                    {tutor?.nombre || empresa?.supervisorNombre || alumno.tutorNombre || 'Ing. Supervisor Laboral'}
                  </span>
                  <span className="text-xs font-mono text-[#2D3748] print:text-gray-700 block">
                    {empresa?.nombre || alumno.empresaNombre || 'TechLogix Chile SpA'}
                  </span>
                  <span className="text-xs font-mono text-[#E85D04] print:text-gray-600 block">
                    RUT: {empresa?.rut || '76.840.120-4'}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-[#718096] print:text-gray-500 space-y-0.5">
                  <span>Timbre Digital Empresa</span>
                  <span className="block truncate text-[9px] text-[#A0AEC0]">
                    Certificado Laboral
                  </span>
                </div>
              </div>

              {/* Firma 3: Profesor Guía Académico */}
              <div className="bg-[#F5F6F8] print:bg-gray-50 border border-[#CBD5E0] print:border-gray-400 rounded-xl p-3.5 flex flex-col justify-between text-center space-y-2 relative overflow-hidden">
                <div className="inline-flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#1B365D] bg-[#1B365D]/10 border border-[#1B365D]/20 py-1 px-2 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-[#E85D04]" />
                  <span>Visado Académico Registrado</span>
                </div>

                <div className="py-2 border-y border-dashed border-[#CBD5E0] print:border-gray-400 space-y-0.5">
                  <span className="font-bold block text-[#2D3748] print:text-black">
                    {profesor?.nombre || alumno.profesorNombre || 'Profesor Supervisor'}
                  </span>
                  <span className="text-xs text-[#718096] print:text-gray-600 block">
                    Profesor Guía de Práctica
                  </span>
                  <span className="text-xs font-mono text-[#718096] print:text-gray-600 block truncate">
                    {alumno.institucion || 'Liceo Industrial'}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-[#718096] print:text-gray-500 space-y-0.5">
                  <span>Resolución Curricular</span>
                  <span className="block truncate text-[9px] text-[#A0AEC0]">
                    Validez Académica MINEDUC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

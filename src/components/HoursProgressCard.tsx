import React, { useState } from 'react';
import { UsuarioApp, EmpresaPractica, EntradaBitacora } from '../types';
import { generarReportePDFBitacora } from '../utils/pdfGenerator';
import {
  Clock,
  CheckCircle2,
  Building2,
  Users,
  Award,
  Plus,
  FileText,
  FileDown,
  Loader2,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

interface HoursProgressCardProps {
  usuario: UsuarioApp;
  entradas: EntradaBitacora[];
  empresa?: EmpresaPractica;
  profesor?: UsuarioApp;
  tutor?: UsuarioApp;
  onNuevaEntrada?: () => void;
  onAbrirLibroOficial?: () => void;
}

export const HoursProgressCard: React.FC<HoursProgressCardProps> = ({
  usuario,
  entradas,
  empresa,
  profesor,
  tutor,
  onNuevaEntrada,
  onAbrirLibroOficial,
}) => {
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [mensajeDescarga, setMensajeDescarga] = useState<string | null>(null);
  const [menuAccionesMovilAbierto, setMenuAccionesMovilAbierto] = useState(false);

  // Solo calcular para este alumno
  const misEntradas = entradas.filter(
    (e) => e.autorId === usuario.id || e.autorEmail === usuario.email || e.rutAlumno === usuario.rut
  );

  const handleDescargarPDFDirecto = () => {
    try {
      setDescargandoPDF(true);
      setMensajeDescarga(null);

      setTimeout(() => {
        const nombreArchivo = generarReportePDFBitacora({
          alumno: usuario,
          entradas: misEntradas,
          empresa,
          profesor,
          tutor,
        });

        setDescargandoPDF(false);
        setMensajeDescarga(`Reporte oficial descargado: ${nombreArchivo}`);

        setTimeout(() => {
          setMensajeDescarga(null);
        }, 5000);
      }, 300);
    } catch (error) {
      console.error('Error al generar reporte PDF:', error);
      setDescargandoPDF(false);
    }
  };

  const horasVerificadasDocente = misEntradas
    .filter((e) => e.estadoVerificacion === 'Verificado')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

  const horasConVoboEmpresa = misEntradas
    .filter((e) => e.voboTutorEmpresa === 'Verificado')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

  const horasPendientes = misEntradas
    .filter((e) => e.estadoVerificacion === 'Pendiente')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

  const metaHoras = usuario.horasRequeridas || 360;
  const porcentaje = Math.min(100, Math.round((horasVerificadasDocente / metaHoras) * 100));
  const horasRestantes = Math.max(0, metaHoras - horasVerificadasDocente);

  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
      {/* Cabecera del Progreso de Práctica */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1B365D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Award className="w-6 h-6 text-[#E85D04]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                Bitácora de Práctica Profesional &bull; Liceo Industrial
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E85D04] text-white font-mono text-xs font-bold shadow-xs">
                {porcentaje}% COMPLETADO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5568] flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>Practicante: <strong className="text-[#1A202C]">{usuario.nombre}</strong></span>
              {usuario.rut && (
                <span className="font-mono text-xs bg-[#F5F6F8] border border-[#CBD5E0] px-2 py-0.5 rounded text-[#1B365D] font-bold">
                  RUT: {usuario.rut}
                </span>
              )}
              {usuario.carrera && (
                <span className="text-[#4A5568]">&bull; {usuario.carrera}</span>
              )}
            </p>
          </div>
        </div>

        {/* 1. Acciones para Pantallas Pequeñas / Teléfonos (sm:hidden) */}
        <div className="flex sm:hidden items-center gap-2 w-full pt-1">
          {onNuevaEntrada && (
            <button
              onClick={onNuevaEntrada}
              className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Jornada</span>
            </button>
          )}

          {/* Botón Menú Hamburguesa de Opciones de Alumno */}
          <button
            type="button"
            onClick={() => setMenuAccionesMovilAbierto(!menuAccionesMovilAbierto)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-[#1B365D] bg-[#F5F6F8] hover:bg-[#E2E8F0] active:bg-[#CBD5E0] border border-[#CBD5E0] rounded-xl transition-all cursor-pointer min-h-[44px] shrink-0"
            aria-label={menuAccionesMovilAbierto ? 'Cerrar opciones' : 'Abrir opciones de la bitácora'}
            aria-expanded={menuAccionesMovilAbierto}
          >
            {menuAccionesMovilAbierto ? (
              <X className="w-4 h-4 text-[#1B365D]" />
            ) : (
              <Menu className="w-4 h-4 text-[#E85D04]" />
            )}
            <span>Opciones</span>
          </button>
        </div>

        {/* Modal Drawer Hamburguesa de Acciones de Alumno en Móvil */}
        {menuAccionesMovilAbierto && (
          <div className="fixed inset-0 z-50 sm:hidden flex justify-end animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              onClick={() => setMenuAccionesMovilAbierto(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />

            {/* Panel Lateral */}
            <div className="relative w-[86%] max-w-xs h-full bg-[#1B365D] text-white shadow-2xl flex flex-col z-10 border-l border-[#274875] animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-[#274875] flex items-center justify-between bg-[#142A4A]">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#E85D04]" />
                    Acciones de Mi Bitácora
                  </h3>
                  <p className="text-[10px] text-[#CBD5E0]">
                    Liceo Industrial &bull; {usuario.nombre}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuAccionesMovilAbierto(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                  aria-label="Cerrar opciones"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
                {onNuevaEntrada && (
                  <button
                    onClick={() => {
                      setMenuAccionesMovilAbierto(false);
                      onNuevaEntrada();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <div className="text-left">
                      <span>Registrar Nueva Jornada</span>
                      <span className="block text-[10px] text-white/80 font-normal">
                        Añadir horas de trabajo a la bitácora
                      </span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuAccionesMovilAbierto(false);
                    handleDescargarPDFDirecto();
                  }}
                  disabled={descargandoPDF}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#E85D04]" />
                  <div className="text-left">
                    <span>Descargar Reporte PDF</span>
                    <span className="block text-[10px] text-[#CBD5E0] font-normal">
                      Documento foliado oficial con firmas
                    </span>
                  </div>
                </button>

                {onAbrirLibroOficial && (
                  <button
                    onClick={() => {
                      setMenuAccionesMovilAbierto(false);
                      onAbrirLibroOficial();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#E85D04]" />
                    <div className="text-left">
                      <span>Ver Libro Oficial Foliado</span>
                      <span className="block text-[10px] text-[#CBD5E0] font-normal">
                        Formato oficial con timbres y actas
                      </span>
                    </div>
                  </button>
                )}

                {/* Resumen de estado de práctica */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1.5 mt-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#CBD5E0]">Horas validadas:</span>
                    <span className="font-mono font-bold text-[#0ECB81]">{horasVerificadasDocente} hrs</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#CBD5E0]">Meta ministerial:</span>
                    <span className="font-mono font-bold text-white">{metaHoras} hrs</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#CBD5E0]">Avance general:</span>
                    <span className="font-mono font-bold text-[#E85D04]">{porcentaje}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Botones de acción directos para Pantallas Medianas y Grandes (hidden sm:flex) */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          {/* BOTÓN DESCARGAR REPORTE PDF OFICIAL */}
          <button
            onClick={handleDescargarPDFDirecto}
            disabled={descargandoPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#142A4A] rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-50 min-h-[44px]"
            title="Descargar reporte oficial foliado en formato PDF con desglose y firmas"
          >
            {descargandoPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 stroke-[2.5] text-[#E85D04]" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>

          {onAbrirLibroOficial && (
            <button
              onClick={onAbrirLibroOficial}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#1B365D] bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] rounded-xl transition-all cursor-pointer min-h-[44px]"
              title="Ver formato oficial foliado con firmas digitales y timbres"
            >
              <FileText className="w-4 h-4 text-[#E85D04]" />
              <span>Ver Libro Oficial</span>
            </button>
          )}

          {onNuevaEntrada && (
            <button
              onClick={onNuevaEntrada}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl transition-all shadow-md shadow-[#E85D04]/25 active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Jornada</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de confirmación de descarga de PDF */}
      {mensajeDescarga && (
        <div className="bg-[#1B365D]/10 border border-[#1B365D]/25 p-3 rounded-xl text-xs text-[#1B365D] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#E85D04]" />
            <span className="font-semibold">{mensajeDescarga}</span>
          </div>
          <button
            onClick={() => setMensajeDescarga(null)}
            className="text-[#E85D04] hover:underline font-bold text-xs ml-2 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Barra de Progreso y Métricas de Doble Visado */}
      <div className="bg-[#F5F6F8] p-4 sm:p-5 rounded-xl border border-[#CBD5E0] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
          <span className="text-[#4A5568] font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#E85D04]" />
            Cómputo Total de Horas Cronológicas Exigidas:
          </span>
          <div className="text-sm font-bold text-[#1A202C]">
            <span className="text-[#1B365D] text-base font-black">{horasVerificadasDocente} hrs</span>
            <span className="text-[#4A5568]"> de {metaHoras} hrs requeridas</span>
          </div>
        </div>

        {/* Barra Visual Gradiente */}
        <div className="w-full bg-white rounded-full h-3.5 overflow-hidden border border-[#CBD5E0] p-0.5">
          <div
            className="bg-gradient-to-r from-[#1B365D] to-[#E85D04] h-full rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${Math.max(4, porcentaje)}%` }}
          />
        </div>

        {/* 4 Métricas Clave de la Bitácora */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 text-center font-mono">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#1B365D]/30 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] text-[#1B365D] uppercase block font-bold leading-tight">Visadas Docente</span>
            <span className="text-base sm:text-lg font-black text-[#1B365D] mt-1">{horasVerificadasDocente} hrs</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E85D04]/40 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] text-[#E85D04] uppercase block font-bold leading-tight">V°B° Empresa</span>
            <span className="text-base sm:text-lg font-black text-[#E85D04] mt-1">{horasConVoboEmpresa} hrs</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#CBD5E0] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] text-[#4A5568] uppercase block font-bold leading-tight">En Revisión</span>
            <span className="text-base sm:text-lg font-black text-[#1A202C] mt-1">{horasPendientes} hrs</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#CBD5E0] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] text-[#4A5568] uppercase block font-bold leading-tight">Faltantes</span>
            <span className="text-base sm:text-lg font-black text-[#4A5568] mt-1">{horasRestantes} hrs</span>
          </div>
        </div>
      </div>

      {/* Tarjetas Informativas: Empresa Asignada & Profesor Tutor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
        {/* Ficha Empresa en Chile */}
        <div className="bg-[#F5F6F8] p-4 rounded-xl border border-[#CBD5E0] flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[#4A5568] mb-1">
              <span className="font-bold text-[11px] text-[#E85D04] uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Centro de Práctica (Empresa)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B365D]/15 text-[#1B365D] font-bold">
                Convenio Vigente
              </span>
            </div>
            <h4 className="font-bold text-[#1B365D] text-sm sm:text-base">
              {usuario.empresaNombre || empresa?.nombre || 'TechLogix Chile SpA'}
            </h4>
            <div className="flex items-center gap-2 text-[#4A5568] text-xs mt-0.5">
              <span>RUT: {empresa?.rut || '76.840.120-4'}</span>
              {empresa?.comuna && <span>&bull; {empresa.comuna}</span>}
            </div>
          </div>

          <div className="pt-2 border-t border-[#CBD5E0] space-y-1 text-[#4A5568] text-xs">
            <div>
              <span>Tutor Laboral (Maestro Guía): </span>
              <strong className="text-[#1A202C]">
                {tutor?.nombre || empresa?.supervisorNombre || usuario.tutorNombre || 'Ing. Fernando Castro'}
              </strong>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#718096]">
              <span>{tutor?.email || empresa?.supervisorEmail || 'fcastro@techlogix.cl'}</span>
              <span>{tutor?.telefono || empresa?.supervisorTelefono || '+56 9 8490 2100'}</span>
            </div>
          </div>
        </div>

        {/* Ficha Profesor Supervisor Académico */}
        <div className="bg-[#F5F6F8] p-4 rounded-xl border border-[#CBD5E0] flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[#4A5568] mb-1">
              <span className="font-bold text-[11px] text-[#1B365D] uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E85D04]" />
                Profesor Guía Académico
              </span>
              <span className="text-[10px] font-mono text-[#1B365D] bg-[#1B365D]/10 px-2 py-0.5 rounded font-bold">
                {profesor?.matricula || 'DOC-GUI-01'}
              </span>
            </div>
            <h4 className="font-bold text-[#1B365D] text-sm sm:text-base">
              {usuario.profesorNombre || profesor?.nombre || 'Prof. Roberto Morales'}
            </h4>
            <p className="text-[#4A5568] text-xs mt-0.5">
              {profesor?.especialidad || 'Supervisor Académico de Prácticas Profesionales'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#CBD5E0] space-y-1 text-[#4A5568] text-xs">
            <div>
              <span>Contacto Docente: </span>
              <span className="font-mono text-[#1A202C] font-semibold">{profesor?.email || 'verificador@liceorbl.cl'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#1B365D]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E85D04]" />
              <span>Acreditado para dictaminar y visar bitácora oficial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

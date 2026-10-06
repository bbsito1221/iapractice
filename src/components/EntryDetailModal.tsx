import React, { useState } from 'react';
import { EntradaBitacora, UsuarioApp } from '../types';
import {
  X,
  Calendar,
  Clock,
  Building2,
  Tag,
  Edit3,
  Trash2,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Coffee,
  BookOpen,
  Wrench,
  Printer,
  Building,
  Briefcase,
  Award,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface EntryDetailModalProps {
  entrada: EntradaBitacora | null;
  isOpen: boolean;
  onClose: () => void;
  onEditar: (entrada: EntradaBitacora) => void;
  onEliminar: (id: number) => void;
  onActualizarVerificacion: (
    id: number,
    estadoVerificacion: string,
    comentarioDocente: string,
    voboTutorEmpresa?: string,
    comentarioTutorEmpresa?: string
  ) => void;
  usuarioActual: UsuarioApp | null;
  onEnviarNotificacionEmail?: (
    entrada: EntradaBitacora,
    tipo: 'recordatorio_validacion' | 'nueva_entrada'
  ) => Promise<void>;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entrada,
  isOpen,
  onClose,
  onEditar,
  onEliminar,
  onActualizarVerificacion,
  usuarioActual,
  onEnviarNotificacionEmail,
}) => {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [emailEnviadoExito, setEmailEnviadoExito] = useState(false);

  // Estados para evaluación del Profesor Guía
  const [nuevoEstadoVerificacion, setNuevoEstadoVerificacion] = useState(
    entrada?.estadoVerificacion || 'Pendiente'
  );
  const [comentarioDocenteInput, setComentarioDocenteInput] = useState(
    entrada?.comentarioDocente || ''
  );

  // Estados para visado del Tutor de la Empresa
  const [nuevoVoboEmpresa, setNuevoVoboEmpresa] = useState(
    entrada?.voboTutorEmpresa || 'Pendiente'
  );
  const [comentarioTutorInput, setComentarioTutorInput] = useState(
    entrada?.comentarioTutorEmpresa || ''
  );

  const [mensajeExito, setMensajeExito] = useState('');

  // Sincronizar inputs cuando cambie la entrada
  React.useEffect(() => {
    if (entrada) {
      setNuevoEstadoVerificacion(entrada.estadoVerificacion || 'Pendiente');
      setComentarioDocenteInput(entrada.comentarioDocente || '');
      setNuevoVoboEmpresa(entrada.voboTutorEmpresa || 'Pendiente');
      setComentarioTutorInput(entrada.comentarioTutorEmpresa || '');
      setConfirmandoEliminar(false);
      setMensajeExito('');
    }
  }, [entrada]);

  if (!isOpen || !entrada) return null;

  const esDocente = usuarioActual?.rol === 'verificador';
  const esTutorEmpresa = usuarioActual?.rol === 'tutor_empresa';
  const esRoot = usuarioActual?.rol === 'root';
  const esAutor = usuarioActual?.id === entrada.autorId;

  const handleGuardarVerificaciones = () => {
    onActualizarVerificacion(
      entrada.id,
      nuevoEstadoVerificacion,
      comentarioDocenteInput,
      nuevoVoboEmpresa,
      comentarioTutorInput
    );
    setMensajeExito('Los dictámenes y firmas de visado se han guardado con éxito.');
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const getStatusBadge = (estado?: string) => {
    switch (estado) {
      case 'Verificado':
        return 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6] font-bold';
      case 'Observado':
        return 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF] font-bold';
      default:
        return 'bg-[#FFF0E6] text-[#E85D04] border-[#FFD8BF] font-bold';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-[#2D3748] rounded-t-3xl sm:rounded-2xl w-full max-w-3xl shadow-2xl border-t sm:border border-[#CBD5E0] overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh] animate-in slide-in-from-bottom duration-200 print:max-h-none print:border-none print:bg-white print:text-black">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#CBD5E0] bg-[#1B365D] print:hidden shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-[#E85D04] px-2.5 py-0.5 rounded font-mono shadow-xs">
              FOLIO #{entrada.id}
            </span>
            <span
              className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                entrada.voboTutorEmpresa
              )}`}
            >
              V°B° Empresa: {entrada.voboTutorEmpresa || 'Pendiente'}
            </span>
            <span
              className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                entrada.estadoVerificacion
              )}`}
            >
              Visado Docente: {entrada.estadoVerificacion || 'Pendiente'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-4">
            {onEnviarNotificacionEmail && (
              <button
                onClick={async () => {
                  try {
                    setEnviandoEmail(true);
                    await onEnviarNotificacionEmail(entrada, 'recordatorio_validacion');
                    setEmailEnviadoExito(true);
                    setTimeout(() => setEmailEnviadoExito(false), 4000);
                  } finally {
                    setEnviandoEmail(false);
                  }
                }}
                disabled={enviandoEmail}
                title="Despachar aviso por correo institucional a Docente y Tutor"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {enviandoEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Avisar por Email</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              title="Imprimir hoja de bitácora"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {(esRoot || esDocente || esAutor) && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEditar(entrada);
                  }}
                  title="Editar registro"
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmandoEliminar(true)}
                  title="Eliminar registro"
                  className="p-2 rounded-xl text-white/80 hover:text-[#FFA494] hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Confirmación de Envío de Notificación */}
        {emailEnviadoExito && (
          <div className="p-3 bg-[#E6F4EA] border-b border-[#CEEAD6] flex items-center gap-2 text-xs text-[#137333] font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#137333]" />
            <span>Aviso de validación despachado exitosamente por correo electrónico a los evaluadores institucionales.</span>
          </div>
        )}

        {/* Alerta de confirmación de eliminación */}
        {confirmandoEliminar && (
          <div className="p-3.5 bg-[#FCE8E6] border-b border-[#FAD2CF] flex items-center justify-between text-xs text-[#C5221F]">
            <span className="font-bold">¿Confirmas eliminar permanentemente este folio de la bitácora?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEliminar(entrada.id);
                  onClose();
                }}
                className="px-3 py-1 bg-[#C5221F] text-white font-bold rounded-lg hover:bg-[#A51D1A] transition-colors cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmandoEliminar(false)}
                className="px-3 py-1 bg-white border border-[#CBD5E0] text-[#4A5568] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Cuerpo de la Hoja de Práctica */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 print:p-0 print:space-y-4">
          {/* Título y Datos del Alumno */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#718096] mb-1">
              <span className="font-mono text-[#E85D04] font-bold">FECHA: {entrada.fecha}</span>
              <span>&bull;</span>
              <span>ÁREA: {entrada.departamento || 'Operaciones'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1B365D] leading-snug">
              {entrada.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-[#718096]">
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-[#1B365D]" />
                <span className="text-[#1B365D] font-bold">{entrada.responsable || 'Estudiante'}</span>
              </div>
              {entrada.rutAlumno && (
                <span className="font-mono text-xs bg-[#F5F6F8] border border-[#CBD5E0] px-2 py-0.5 rounded text-[#2D3748] font-bold">
                  RUT: {entrada.rutAlumno}
                </span>
              )}
              {entrada.autorMatricula && (
                <span className="font-mono text-xs text-[#718096]">
                  Mat: {entrada.autorMatricula}
                </span>
              )}
            </div>
          </div>

          {/* Tarjetas Informativas: Cómputo de Horas y Datos de la Empresa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Horas Efectivas */}
            <div className="bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[#1B365D] mb-1 font-mono uppercase font-bold">
                <Clock className="w-3.5 h-3.5 text-[#E85D04]" />
                <span>Horas Netas</span>
              </div>
              <span className="font-black text-lg text-[#1B365D] font-mono block">
                {entrada.horasRegistradas || 8} hrs
              </span>
              <span className="text-xs text-[#718096] font-mono block">
                {entrada.horaEntrada || '08:30'} - {entrada.horaSalida || '17:30'}
              </span>
            </div>

            {/* Colación */}
            <div className="bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[#718096] mb-1 font-mono uppercase font-bold">
                <Coffee className="w-3.5 h-3.5 text-[#E85D04]" />
                <span>Colación</span>
              </div>
              <span className="font-black text-lg text-[#2D3748] font-mono block">
                {typeof entrada.colacionMinutos === 'number' ? entrada.colacionMinutos : 60} min
              </span>
              <span className="text-xs text-[#718096]">Descontada</span>
            </div>

            {/* Centro de Práctica */}
            <div className="bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[#E85D04] mb-1 font-mono uppercase font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Centro Práctica</span>
              </div>
              <span className="font-bold text-xs text-[#2D3748] block truncate" title={entrada.empresaNombre}>
                {entrada.empresaNombre || 'TechLogix Chile'}
              </span>
              {entrada.rutEmpresa && (
                <span className="font-mono text-xs text-[#718096] block">
                  RUT: {entrada.rutEmpresa}
                </span>
              )}
            </div>

            {/* Turno y Estado */}
            <div className="bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[#718096] mb-1 font-mono uppercase font-bold">
                <Briefcase className="w-3.5 h-3.5 text-[#1B365D]" />
                <span>Turno / Estado</span>
              </div>
              <span className="font-bold text-xs text-[#2D3748] block">
                {entrada.turno || 'Matutino'}
              </span>
              <span className="text-xs text-[#137333] font-bold font-mono">
                {entrada.estado || 'Completado'}
              </span>
            </div>
          </div>

          {/* Tags */}
          {entrada.tags && entrada.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entrada.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#4A5568] bg-[#F5F6F8] px-2.5 py-0.5 rounded-md border border-[#CBD5E0]"
                >
                  <Tag className="w-3 h-3 text-[#E85D04]" />
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 1. Descripción de Actividades */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-[#1B365D] uppercase tracking-wider font-mono">
              Descripción de Actividades Realizadas en la Jornada
            </h3>
            <div className="text-[#2D3748] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-[#F5F6F8] p-4 rounded-xl border border-[#CBD5E0]">
              {entrada.contenido}
            </div>
          </div>

          {/* 2. Competencias Curriculares Aplicadas */}
          {entrada.competenciasAplicadas && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#137333] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#137333]" />
                Competencias Técnicas y Aprendizajes Aplicados
              </h3>
              <div className="text-[#2D3748] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-[#E6F4EA] p-3.5 rounded-xl border border-[#CEEAD6]">
                {entrada.competenciasAplicadas}
              </div>
            </div>
          )}

          {/* 3. Dificultades y Soluciones */}
          {entrada.dificultadesSolucion && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#E85D04] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#E85D04]" />
                Dificultades en Faena & Soluciones Adoptadas
              </h3>
              <div className="text-[#2D3748] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-[#FFF0E6] p-3.5 rounded-xl border border-[#FFD8BF]">
                {entrada.dificultadesSolucion}
              </div>
            </div>
          )}

          {/* 4. Acciones y Procedimientos Adicionales */}
          {entrada.accionesTomadas && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#4A5568] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B365D]" />
                Procedimientos Operativos
              </h3>
              <div className="text-[#2D3748] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-[#F5F6F8] p-3.5 rounded-xl border border-[#CBD5E0]">
                {entrada.accionesTomadas}
              </div>
            </div>
          )}

          {/* SECCIÓN DE VALIDACIONES Y VISADOS OFICIALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* V°B° DEL TUTOR DE EMPRESA */}
            <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#E85D04]" />
                  <span className="text-xs font-bold text-[#1B365D] uppercase font-mono">
                    V°B° Tutor Empresa (Maestro Guía)
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    entrada.voboTutorEmpresa
                  )}`}
                >
                  {entrada.voboTutorEmpresa || 'Pendiente'}
                </span>
              </div>

              {(esTutorEmpresa || esRoot) ? (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNuevoVoboEmpresa('Verificado')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        nuevoVoboEmpresa === 'Verificado'
                          ? 'bg-[#137333] text-white border-[#137333]'
                          : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:text-[#137333]'
                      }`}
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoVoboEmpresa('Observado')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        nuevoVoboEmpresa === 'Observado'
                          ? 'bg-[#C5221F] text-white border-[#C5221F]'
                          : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:text-[#C5221F]'
                      }`}
                    >
                      Observar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoVoboEmpresa('Pendiente')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        nuevoVoboEmpresa === 'Pendiente'
                          ? 'bg-[#E85D04] text-white border-[#E85D04]'
                          : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:text-[#E85D04]'
                      }`}
                    >
                      Pendiente
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={comentarioTutorInput}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setComentarioTutorInput(e.target.value)}
                    placeholder="Observaciones sobre desempeño, puntualidad y cumplimiento en faena..."
                    className="w-full bg-white border border-[#CBD5E0] rounded-xl p-2.5 text-base sm:text-xs text-[#2D3748] placeholder-[#A0AEC0] focus:border-[#E85D04]"
                  />
                </div>
              ) : (
                <div className="text-xs text-[#4A5568]">
                  {entrada.tutorEmpresaNombre && (
                    <p className="font-bold text-[#1B365D] mb-1">
                      Tutor: {entrada.tutorEmpresaNombre}
                    </p>
                  )}
                  {entrada.comentarioTutorEmpresa ? (
                    <p className="italic bg-white p-2.5 rounded-lg border border-[#CBD5E0] text-[#2D3748]">
                      "{entrada.comentarioTutorEmpresa}"
                    </p>
                  ) : (
                    <p className="italic text-[#718096]">Pendiente de V°B° por el maestro guía de la empresa.</p>
                  )}
                </div>
              )}
            </div>

            {/* VISADO ACADÉMICO DEL PROFESOR GUÍA */}
            <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B365D]" />
                  <span className="text-xs font-bold text-[#1B365D] uppercase font-mono">
                    Visado Profesor Guía (Docente)
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    entrada.estadoVerificacion
                  )}`}
                >
                  {entrada.estadoVerificacion || 'Pendiente'}
                </span>
              </div>

              {(esDocente || esRoot) ? (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNuevoEstadoVerificacion('Verificado')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        nuevoEstadoVerificacion === 'Verificado'
                          ? 'bg-[#1B365D] text-white border-[#1B365D]'
                          : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:text-[#1B365D]'
                      }`}
                    >
                      Acreditar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoEstadoVerificacion('Observado')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        nuevoEstadoVerificacion === 'Observado'
                          ? 'bg-[#C5221F] text-white border-[#C5221F]'
                          : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:text-[#C5221F]'
                      }`}
                    >
                      Observar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoEstadoVerificacion('Pendiente')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        nuevoEstadoVerificacion === 'Pendiente'
                          ? 'bg-[#E85D04] text-white border-[#E85D04]'
                          : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:text-[#E85D04]'
                      }`}
                    >
                      Pendiente
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={comentarioDocenteInput}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setComentarioDocenteInput(e.target.value)}
                    placeholder="Retroalimentación académica, evaluación curricular o dictamen de horas..."
                    className="w-full bg-white border border-[#CBD5E0] rounded-xl p-2.5 text-base sm:text-xs text-[#2D3748] placeholder-[#A0AEC0] focus:border-[#1B365D]"
                  />
                </div>
              ) : (
                <div className="text-xs text-[#4A5568]">
                  {entrada.verificadoPor && (
                    <p className="font-bold text-[#1B365D] mb-1">
                      Docente: {entrada.verificadoPor}
                    </p>
                  )}
                  {entrada.comentarioDocente ? (
                    <p className="italic bg-white p-2.5 rounded-lg border border-[#CBD5E0] text-[#2D3748]">
                      "{entrada.comentarioDocente}"
                    </p>
                  ) : (
                    <p className="italic text-[#718096]">Pendiente de acreditación por el profesor guía.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botón de Guardar Visados */}
          {(esDocente || esTutorEmpresa || esRoot) && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#CBD5E0]">
              {mensajeExito ? (
                <div className="text-xs font-bold text-[#137333] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                  <span>{mensajeExito}</span>
                </div>
              ) : (
                <span className="text-xs text-[#718096] font-mono">
                  Guarda las firmas y dictámenes para actualizar el libro de prácticas
                </span>
              )}
              <button
                type="button"
                onClick={handleGuardarVerificaciones}
                className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#E85D04]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Guardar Visado y Dictamen</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#F5F6F8] border-t border-[#CBD5E0] flex items-center justify-between gap-2 text-xs text-[#718096] print:hidden shrink-0">
          <span className="font-mono text-xs truncate">Bitácora Oficial &bull; Liceo Industrial</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-[#4A5568] hover:text-[#1A202C] bg-white hover:bg-gray-100 border border-[#CBD5E0] rounded-xl transition-colors cursor-pointer shrink-0 min-h-[38px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

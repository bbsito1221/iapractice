import React, { useState } from 'react';
import {
  NotificacionEmail,
  UsuarioApp,
  EntradaBitacora,
  EmpresaPractica,
} from '../types';
import {
  X,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap,
  Copy,
  Search,
  Filter,
  Eye,
  Check,
  Inbox,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificaciones: NotificacionEmail[];
  usuarioActual: UsuarioApp | null;
  entradas: EntradaBitacora[];
  usuarios: UsuarioApp[];
  empresas: EmpresaPractica[];
  onSeleccionarEntradaParaValidar?: (entradaId: number) => void;
  onReenviarNotificacion?: (notificacionId: string) => Promise<void>;
  onEnviarNotificacionManual?: (params: {
    entradaId: number;
    tipo: 'recordatorio_validacion' | 'nueva_entrada';
    notaAdicional?: string;
  }) => Promise<void>;
  onMarcarLeido?: (notificacionId: string) => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  notificaciones,
  usuarioActual,
  entradas,
  usuarios,
  empresas,
  onSeleccionarEntradaParaValidar,
  onReenviarNotificacion,
  onEnviarNotificacionManual,
  onMarcarLeido,
}) => {
  const [filtro, setFiltro] = useState<'todas' | 'para_mi' | 'nuevas' | 'recordatorios'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [notifSeleccionada, setNotifSeleccionada] = useState<NotificacionEmail | null>(
    notificaciones[0] || null
  );
  const [reenviandoId, setReenviandoId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  // Modal para envío manual
  const [mostrarModalNuevoAviso, setMostrarModalNuevoAviso] = useState(false);
  const [entradaSeleccionadaId, setEntradaSeleccionadaId] = useState<number>(
    entradas[0]?.id || 0
  );
  const [tipoNuevoAviso, setTipoNuevoAviso] = useState<'recordatorio_validacion' | 'nueva_entrada'>(
    'recordatorio_validacion'
  );
  const [notaManual, setNotaManual] = useState('');
  const [enviandoManual, setEnviandoManual] = useState(false);

  if (!isOpen) return null;

  // Filtrado de notificaciones
  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filtro === 'para_mi' && usuarioActual) {
      const coincideDestino = n.destinatarios.some(
        (d) =>
          d.email.toLowerCase() === usuarioActual.email.toLowerCase() ||
          (usuarioActual.rol === 'verificador' && d.rol === 'profesor') ||
          (usuarioActual.rol === 'tutor_empresa' && d.rol === 'tutor_empresa') ||
          (usuarioActual.rol === 'alumno' && d.email.toLowerCase() === usuarioActual.email.toLowerCase())
      );
      if (!coincideDestino) return false;
    } else if (filtro === 'nuevas') {
      if (n.tipo !== 'nueva_entrada') return false;
    } else if (filtro === 'recordatorios') {
      if (n.tipo !== 'recordatorio_validacion') return false;
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const coincide =
        n.asunto.toLowerCase().includes(q) ||
        n.alumnoNombre.toLowerCase().includes(q) ||
        (n.empresaNombre && n.empresaNombre.toLowerCase().includes(q)) ||
        n.destinatarios.some((d) => d.email.toLowerCase().includes(q) || d.nombre.toLowerCase().includes(q)) ||
        n.tituloEntrada.toLowerCase().includes(q);
      if (!coincide) return false;
    }

    return true;
  });

  const handleSeleccionar = (notif: NotificacionEmail) => {
    setNotifSeleccionada(notif);
    if (onMarcarLeido && usuarioActual) {
      onMarcarLeido(notif.id);
    }
  };

  const handleReenviar = async (id: string) => {
    if (!onReenviarNotificacion) return;
    try {
      setReenviandoId(id);
      await onReenviarNotificacion(id);
      setMensajeFeedback('Notificación de recordatorio reenviada exitosamente.');
      setTimeout(() => setMensajeFeedback(null), 4000);
    } catch (e) {
      console.error(e);
      setMensajeFeedback('Error al reenviar la notificación');
    } finally {
      setReenviandoId(null);
    }
  };

  const handleCopiarTexto = () => {
    if (!notifSeleccionada) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(notifSeleccionada.cuerpoTexto || '').catch(() => {});
      }
    } catch {}
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleEnviarNuevoAviso = async () => {
    if (!onEnviarNotificacionManual || !entradaSeleccionadaId) return;
    try {
      setEnviandoManual(true);
      await onEnviarNotificacionManual({
        entradaId: Number(entradaSeleccionadaId),
        tipo: tipoNuevoAviso,
        notaAdicional: notaManual,
      });
      setMostrarModalNuevoAviso(false);
      setNotaManual('');
      setMensajeFeedback('Aviso por email despachado a profesor y tutor de empresa.');
      setTimeout(() => setMensajeFeedback(null), 4000);
    } catch (error) {
      console.error(error);
      setMensajeFeedback('Error al emitir el aviso.');
    } finally {
      setEnviandoManual(false);
    }
  };

  const esNoLeido = (notif: NotificacionEmail) => {
    if (!usuarioActual) return false;
    return !notif.leidoPor.includes(usuarioActual.id) && !notif.leidoPor.includes(usuarioActual.email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-[#CBD5E0] overflow-hidden flex flex-col h-[92vh] max-h-[850px]">
        {/* Encabezado Superior */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#CBD5E0] bg-[#1B365D] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Mail className="w-5 h-5 text-[#E85D04]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Centro de Notificaciones por Correo
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E85D04] text-white uppercase tracking-wider">
                  Docentes &amp; Tutores
                </span>
              </div>
              <p className="text-xs text-white/80">
                Historial y despacho de avisos de jornadas para validación curricular y V°B° laboral
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarModalNuevoAviso(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl transition-all shadow-sm cursor-pointer"
              title="Redactar aviso de validación manual para una jornada"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Enviar Aviso Manual</span>
              <span className="sm:hidden">Avisar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {mensajeFeedback && (
          <div className="bg-[#E6F4EA] border-b border-[#CEEAD6] px-4 py-2 text-xs text-[#137333] flex items-center justify-between shrink-0 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0" />
              <span>{mensajeFeedback}</span>
            </div>
            <button
              onClick={() => setMensajeFeedback(null)}
              className="text-[#137333] hover:underline text-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#F5F6F8] border-b border-[#CBD5E0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filtro === 'todas'
                  ? 'bg-[#1B365D] text-white'
                  : 'text-[#4A5568] hover:text-[#1A202C] hover:bg-[#E2E8F0]'
              }`}
            >
              Todas ({notificaciones.length})
            </button>
            {usuarioActual && (
              <button
                onClick={() => setFiltro('para_mi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filtro === 'para_mi'
                    ? 'bg-[#1B365D] text-white'
                    : 'text-[#4A5568] hover:text-[#1A202C] hover:bg-[#E2E8F0]'
                }`}
              >
                Para Mí ({usuarioActual.rol === 'verificador' ? 'Docente' : usuarioActual.rol === 'tutor_empresa' ? 'Tutor' : 'Estudiante'})
              </button>
            )}
            <button
              onClick={() => setFiltro('nuevas')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filtro === 'nuevas'
                  ? 'bg-[#1B365D] text-white'
                  : 'text-[#4A5568] hover:text-[#1A202C] hover:bg-[#E2E8F0]'
              }`}
            >
              Nuevas Jornadas
            </button>
            <button
              onClick={() => setFiltro('recordatorios')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filtro === 'recordatorios'
                  ? 'bg-[#1B365D] text-white'
                  : 'text-[#4A5568] hover:text-[#1A202C] hover:bg-[#E2E8F0]'
              }`}
            >
              Recordatorios
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              placeholder="Buscar por alumno, correo o asunto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-[#CBD5E0] rounded-lg text-xs text-[#2D3748] placeholder-[#A0AEC0] focus:border-[#1B365D]"
            />
          </div>
        </div>

        {/* Contenedor Principal: Lista Lateral + Lector de Correo */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Panel Izquierdo: Lista de Notificaciones */}
          <div className={`w-full md:w-[360px] border-r border-[#CBD5E0] bg-white overflow-y-auto flex flex-col shrink-0 ${
            notifSeleccionada ? 'hidden md:flex' : 'flex'
          }`}>
            {notificacionesFiltradas.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#718096]">
                <Inbox className="w-10 h-10 stroke-1 text-[#A0AEC0] mb-2" />
                <p className="text-xs font-bold text-[#2D3748]">No hay notificaciones</p>
                <p className="text-xs text-[#718096] mt-1">
                  {busqueda ? 'No coinciden con la búsqueda' : 'No se han emitido avisos en este filtro'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {notificacionesFiltradas.map((notif) => {
                  const seleccionada = notifSeleccionada?.id === notif.id;
                  const noLeido = esNoLeido(notif);
                  const fechaFormateada = new Date(notif.fechaEnvio).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleSeleccionar(notif)}
                      className={`w-full text-left p-3.5 transition-all cursor-pointer relative ${
                        seleccionada
                          ? 'bg-[#F5F6F8] border-l-4 border-[#1B365D]'
                          : 'hover:bg-[#F5F6F8]/80'
                      }`}
                    >
                      {noLeido && (
                        <span className="w-2 h-2 rounded-full bg-[#E85D04] absolute right-3 top-3.5" />
                      )}

                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            notif.tipo === 'nueva_entrada'
                              ? 'bg-[#E6F4EA] text-[#137333]'
                              : notif.tipo === 'recordatorio_validacion'
                              ? 'bg-[#FFF0E6] text-[#E85D04]'
                              : 'bg-[#E8F0FE] text-[#1B365D]'
                          }`}
                        >
                          {notif.tipo === 'nueva_entrada'
                            ? 'Nueva Jornada'
                            : notif.tipo === 'recordatorio_validacion'
                            ? 'Recordatorio'
                            : 'Dictamen'}
                        </span>
                        <span className="text-xs font-mono text-[#718096]">
                          Folio #{notif.entradaId}
                        </span>
                        <span className="text-[10px] text-[#718096] ml-auto">
                          {fechaFormateada}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#2D3748] line-clamp-1 mb-1">
                        {notif.asunto}
                      </h4>

                      <div className="text-xs text-[#718096] flex items-center gap-1 mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1B365D] shrink-0" />
                        <span className="font-semibold text-[#2D3748] truncate">
                          {notif.alumnoNombre}
                        </span>
                        <span>&bull;</span>
                        <span className="text-[#137333] font-mono font-bold">
                          {notif.horasRegistradas} hrs
                        </span>
                      </div>

                      {/* Destinatarios */}
                      <div className="flex items-center gap-1 text-[10px] text-[#718096] truncate">
                        <span>Para:</span>
                        {notif.destinatarios
                          .filter((d) => d.tipo === 'para')
                          .map((d, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded text-[10px] text-[#2D3748] truncate"
                            >
                              {d.rol === 'profesor' ? 'Prof. ' : 'Tutor '}
                              {d.nombre.split(' ')[0]}
                            </span>
                          ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel Derecho: Vista Detallada del Correo Electrónico */}
          <div className={`flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden min-h-0 ${
            notifSeleccionada ? 'flex' : 'hidden md:flex'
          }`}>
            {notifSeleccionada ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Botón Volver en Móvil */}
                <div className="md:hidden px-4 py-2.5 bg-white border-b border-[#CBD5E0] flex items-center justify-between">
                  <button
                    onClick={() => setNotifSeleccionada(null)}
                    className="flex items-center gap-1.5 text-xs text-[#1B365D] font-bold cursor-pointer py-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a la lista</span>
                  </button>
                  <span className="text-xs text-[#718096] font-mono">
                    Folio #{notifSeleccionada.entradaId}
                  </span>
                </div>

                {/* Cabecera del Mensaje */}
                <div className="p-4 sm:p-5 border-b border-[#CBD5E0] bg-white shrink-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                            notifSeleccionada.tipo === 'nueva_entrada'
                              ? 'bg-[#E6F4EA] text-[#137333]'
                              : 'bg-[#FFF0E6] text-[#E85D04]'
                          }`}
                        >
                          {notifSeleccionada.tipo === 'nueva_entrada'
                            ? 'Aviso de Registro'
                            : 'Solicitud de Validación'}
                        </span>
                        <span className="text-xs font-mono text-[#718096]">
                          Folio #{notifSeleccionada.entradaId} &bull; Jornada {notifSeleccionada.jornadaFecha}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#E6F4EA] text-[#137333] flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {notifSeleccionada.estadoEnvio === 'enviado'
                            ? 'SMTP Despachado'
                            : 'Despacho Exitoso'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1B365D]">
                        {notifSeleccionada.asunto}
                      </h3>
                    </div>

                    {/* Botones de acción rápida */}
                    <div className="flex items-center gap-1.5 self-start shrink-0">
                      {onSeleccionarEntradaParaValidar && (
                        <button
                          onClick={() => {
                            onSeleccionarEntradaParaValidar(notifSeleccionada.entradaId);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#132743] rounded-xl transition-all shadow-sm cursor-pointer"
                          title="Abrir la entrada para revisar y validar"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Validar Jornada</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleReenviar(notifSeleccionada.id)}
                        disabled={reenviandoId === notifSeleccionada.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#2D3748] bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        title="Reenviar aviso de recordatorio por correo"
                      >
                        <RotateCw
                          className={`w-3.5 h-3.5 ${
                            reenviandoId === notifSeleccionada.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span className="hidden sm:inline">Reenviar</span>
                      </button>

                      <button
                        onClick={handleCopiarTexto}
                        className="p-1.5 text-[#718096] hover:text-[#2D3748] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                        title="Copiar texto del correo al portapapeles"
                      >
                        {copiado ? (
                          <Check className="w-4 h-4 text-[#137333]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadatos de Cabecera de Correo */}
                  <div className="bg-[#F5F6F8] p-3 rounded-xl border border-[#CBD5E0] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#718096] border-b border-[#CBD5E0] pb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold">De:</span>
                        <span className="text-[#2D3748] font-mono text-xs truncate font-medium">
                          {notifSeleccionada.remitente}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#718096] shrink-0">
                        {new Date(notifSeleccionada.fechaEnvio).toLocaleString('es-CL')}
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-[#718096]">
                      <span className="font-bold shrink-0">Para:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {notifSeleccionada.destinatarios
                          .filter((d) => d.tipo === 'para')
                          .map((dest, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#CBD5E0] text-[#2D3748] text-xs"
                            >
                              {dest.rol === 'profesor' ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-[#1B365D]" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-[#E85D04]" />
                              )}
                              <span className="font-semibold">{dest.nombre}</span>
                              <span className="text-[#718096] font-mono text-[10px]">
                                &lt;{dest.email}&gt;
                              </span>
                            </span>
                          ))}
                      </div>
                    </div>

                    {notifSeleccionada.destinatarios.some((d) => d.tipo === 'cc') && (
                      <div className="flex items-start gap-1.5 text-[#718096]">
                        <span className="font-bold shrink-0">CC:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {notifSeleccionada.destinatarios
                            .filter((d) => d.tipo === 'cc')
                            .map((dest, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#CBD5E0] text-[#2D3748] text-xs"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-[#1B365D]" />
                                <span>{dest.nombre}</span>
                                <span className="text-[#718096] font-mono text-[10px]">
                                  &lt;{dest.email}&gt;
                                </span>
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Render HTML del Correo en Contenedor Estilizado */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F6F8] flex justify-center">
                  <div className="w-full max-w-[620px] bg-white rounded-xl shadow-md overflow-hidden border border-[#CBD5E0] text-[#2D3748] text-xs">
                    {notifSeleccionada.cuerpoHtml ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: notifSeleccionada.cuerpoHtml }}
                        className="email-render-preview"
                      />
                    ) : (
                      <pre className="p-6 font-mono text-xs whitespace-pre-wrap text-[#2D3748] bg-white">
                        {notifSeleccionada.cuerpoTexto}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#718096]">
                <Mail className="w-12 h-12 stroke-1 text-[#A0AEC0] mb-3" />
                <p className="text-sm font-bold text-[#2D3748]">
                  Seleccione una notificación
                </p>
                <p className="text-xs text-[#718096] mt-1 max-w-sm">
                  Vea el detalle de las comunicaciones, estado de entrega y folios asociados.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Secundario: Redactar Aviso Manual */}
        {mostrarModalNuevoAviso && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-[#CBD5E0] shadow-2xl p-5 space-y-4 my-auto max-h-[92dvh] overflow-y-auto pb-5">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1B365D]/10 text-[#1B365D] flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#E85D04]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1B365D]">
                      Emitir Aviso de Validación por Email
                    </h3>
                    <p className="text-xs text-[#718096]">
                      Notifica de inmediato a los evaluadores asignados
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalNuevoAviso(false)}
                  className="p-1 text-[#718096] hover:text-[#2D3748]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">
                    Seleccionar Jornada de Bitácora a Notificar:
                  </label>
                  <select
                    value={entradaSeleccionadaId}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEntradaSeleccionadaId(Number(e.target.value))}
                    className="w-full bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl px-3 py-2.5 text-[#2D3748] text-base sm:text-xs focus:border-[#1B365D]"
                  >
                    {entradas.map((e) => (
                      <option key={e.id} value={e.id}>
                        Folio #{e.id} - {e.fecha} | {e.responsable || 'Alumno'} ({e.horasRegistradas || 8} hrs) - {e.titulo.slice(0, 35)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">
                    Tipo de Notificación:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoNuevoAviso('recordatorio_validacion')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        tipoNuevoAviso === 'recordatorio_validacion'
                          ? 'bg-[#FFF0E6] border-[#E85D04] text-[#E85D04]'
                          : 'bg-[#F5F6F8] border-[#CBD5E0] text-[#718096]'
                      }`}
                    >
                      <div className="font-bold text-xs">Recordatorio de Visado</div>
                      <div className="text-[10px] opacity-80">
                        Solicita urgencia en validación
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoNuevoAviso('nueva_entrada')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        tipoNuevoAviso === 'nueva_entrada'
                          ? 'bg-[#E6F4EA] border-[#137333] text-[#137333]'
                          : 'bg-[#F5F6F8] border-[#CBD5E0] text-[#718096]'
                      }`}
                    >
                      <div className="font-bold text-xs">Nueva Jornada</div>
                      <div className="text-[10px] opacity-80">
                        Aviso estándar de registro
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">
                    Nota Adicional para los Evaluadores (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={notaManual}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setNotaManual(e.target.value)}
                    placeholder="Ej: Estimado profesor y tutor, ya he subido los respaldos correspondientes para esta jornada..."
                    className="w-full bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl p-2.5 text-[#2D3748] text-base sm:text-xs placeholder-[#A0AEC0] focus:border-[#1B365D]"
                  />
                </div>

                <div className="bg-[#F5F6F8] p-3 rounded-xl border border-[#CBD5E0] text-xs text-[#718096]">
                  <p className="text-[#1B365D] font-bold mb-1">Destinatarios que recibirán el correo:</p>
                  <p>&bull; <strong>Profesor Guía:</strong> Docente supervisor académico asignado</p>
                  <p>&bull; <strong>Tutor Laboral:</strong> Maestro guía de la empresa colaboradora</p>
                  <p>&bull; <strong>Copia de respaldo:</strong> Estudiante autor de la jornada</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevoAviso(false)}
                  className="px-3.5 py-2 text-xs font-bold text-[#718096] hover:text-[#2D3748] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEnviarNuevoAviso}
                  disabled={enviandoManual}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {enviandoManual ? (
                    <span>Enviando correo...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Despachar Correo Ahora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

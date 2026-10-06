import React, { useState } from 'react';
import {
  Plus,
  Download,
  LogIn,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Building2,
  Key,
  BookOpen,
  Mail,
  Menu,
  X,
  User,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { UsuarioApp } from '../types';
import { LiceoLogo } from './LiceoLogo';

interface HeaderProps {
  vistaActiva: 'bitacora' | 'admin' | 'directivo';
  setVistaActiva: (vista: 'bitacora' | 'admin' | 'directivo') => void;
  onNuevaEntrada: () => void;
  onExportarJSON: () => void;
  usuario?: UsuarioApp | null;
  onAbrirLogin: () => void;
  onCerrarSesion: () => void;
  onAbrirLibroOficial?: () => void;
  onAbrirNotificaciones?: () => void;
  cantidadNotificacionesNoLeidas?: number;
}

export const Header: React.FC<HeaderProps> = ({
  vistaActiva,
  setVistaActiva,
  onNuevaEntrada,
  onExportarJSON,
  usuario,
  onAbrirLogin,
  onCerrarSesion,
  onAbrirLibroOficial,
  onAbrirNotificaciones,
  cantidadNotificacionesNoLeidas = 0,
}) => {
  const [mostrarMenuMovil, setMostrarMenuMovil] = useState(false);

  // Cerrar menú móvil si se presiona la tecla Escape o si se agranda la pantalla
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMostrarMenuMovil(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMostrarMenuMovil(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Bloquear scroll de fondo mientras el menú hamburguesa móvil esté abierto
  React.useEffect(() => {
    if (mostrarMenuMovil) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mostrarMenuMovil]);

  const getRolBadge = (rol?: string) => {
    switch (rol) {
      case 'root':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E85D04] text-white shadow-xs">
            <Key className="w-2.5 h-2.5" />
            COORD. TP
          </span>
        );
      case 'directivo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#7C3AED] text-white shadow-xs">
            <ShieldCheck className="w-2.5 h-2.5" />
            DIRECTIVO
          </span>
        );
      case 'verificador':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0ECB81] text-white shadow-xs">
            <ShieldCheck className="w-2.5 h-2.5" />
            DOCENTE
          </span>
        );
      case 'tutor_empresa':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-white border border-white/30">
            <Building2 className="w-2.5 h-2.5" />
            TUTOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-white border border-white/30">
            <GraduationCap className="w-2.5 h-2.5" />
            ALUMNO
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1B365D] border-b border-[#142A4A] shadow-md shadow-[#1B365D]/30 text-white w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Logo & Marca institucional Liceo Industrial */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
            <LiceoLogo className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-white tracking-tight text-xs sm:text-base md:text-lg uppercase truncate">
                Liceo Industrial
              </span>
              <span className="hidden sm:inline-block text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E85D04] text-white tracking-wider uppercase shadow-xs shrink-0">
                ELECTROTECNIA
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#CBD5E0] hidden md:block leading-none mt-0.5 truncate">
              Portal Oficial de Prácticas Profesionales &bull; liceorbl.cl
            </p>
          </div>
        </div>

        {/* Navegación Central para Pantallas Grandes (Desktop) */}
        {usuario && (
          <nav className="hidden lg:flex items-center gap-1 bg-[#132845] p-1 rounded-xl border border-[#274875] shrink-0">
            <button
              id="nav-tab-bitacora"
              onClick={() => setVistaActiva('bitacora')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                vistaActiva === 'bitacora'
                  ? 'bg-white/20 text-white font-bold shadow-xs'
                  : 'text-[#CBD5E0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#E85D04]" />
              <span>Bitácora<span className="hidden xl:inline"> de Práctica</span></span>
            </button>

            {onAbrirLibroOficial && (
              <button
                onClick={onAbrirLibroOficial}
                className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold text-[#CBD5E0] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Generar documento foliado con firmas oficiales"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#E85D04]" />
                <span>Libro Oficial</span>
              </button>
            )}

            {usuario.rol === 'root' && (
              <button
                id="nav-tab-admin"
                onClick={() => setVistaActiva('admin')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  vistaActiva === 'admin'
                    ? 'bg-[#E85D04] text-white font-bold shadow-xs'
                    : 'text-[#CBD5E0] hover:text-white hover:bg-white/10'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Gestión<span className="hidden xl:inline"> / Coordinador TP</span></span>
              </button>
            )}

            {(usuario.rol === 'directivo' || usuario.rol === 'root') && (
              <button
                id="nav-tab-directivo"
                onClick={() => setVistaActiva('directivo')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  vistaActiva === 'directivo'
                    ? 'bg-[#7C3AED] text-white font-bold shadow-xs'
                    : 'text-[#CBD5E0] hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Auditoría<span className="hidden xl:inline"> / Dirección</span></span>
              </button>
            )}
          </nav>
        )}

        {/* Acciones principales y Estado de Usuario */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón rápido "+ Registrar Jornada" con Color de Acento Naranja #E85D04 */}
          {vistaActiva === 'bitacora' && (
            <button
              id="btn-nueva-entrada"
              onClick={onNuevaEntrada}
              title="Registrar Jornada de Práctica"
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl transition-all shadow-md shadow-[#E85D04]/30 active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden md:inline">Registrar Jornada</span>
              <span className="hidden xs:inline md:hidden font-bold">Jornada</span>
            </button>
          )}

          {/* Notificaciones por Email */}
          {onAbrirNotificaciones && (
            <button
              id="btn-notificaciones-email"
              onClick={onAbrirNotificaciones}
              title="Centro de Notificaciones y Avisos de Visado"
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/15 border border-white/20 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Mail className="w-4 h-4 text-[#E85D04]" />
              {cantidadNotificacionesNoLeidas > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#E85D04] rounded-full ring-2 ring-[#1B365D] animate-pulse">
                  {cantidadNotificacionesNoLeidas > 9 ? '9+' : cantidadNotificacionesNoLeidas}
                </span>
              )}
            </button>
          )}

          {/* Exportar JSON en escritorio */}
          {vistaActiva === 'bitacora' && (
            <button
              id="btn-exportar-json"
              onClick={onExportarJSON}
              title="Descargar copia de seguridad en JSON"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#CBD5E0] hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#E85D04]" />
              <span>Respaldo</span>
            </button>
          )}

          {/* Usuario / Sesión en pantallas grandes */}
          {usuario ? (
            <div className="hidden lg:flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/20 shrink-0">
              <div className="flex items-center gap-2 p-1">
                {usuario.avatar ? (
                  <img
                    src={usuario.avatar}
                    alt={usuario.nombre}
                    className="w-8 h-8 rounded-full object-cover border border-[#E85D04]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#E85D04] text-white shadow-xs">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {usuario.nombre}
                    </span>
                    {getRolBadge(usuario.rol)}
                  </div>
                  <span className="text-[10px] text-[#CBD5E0] truncate max-w-[130px]">
                    {usuario.rol === 'root'
                      ? 'Coordinador TP'
                      : usuario.rol === 'directivo'
                      ? 'Director Institucional'
                      : usuario.rol === 'verificador'
                      ? 'Docente Supervisor'
                      : usuario.rol === 'tutor_empresa'
                      ? 'Tutor en Empresa'
                      : usuario.rut || 'Estudiante'}
                  </span>
                </div>
              </div>

              <button
                onClick={onCerrarSesion}
                title="Cerrar sesión"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#CBD5E0] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#E85D04]" />
                <span className="hidden xl:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAbrirLogin}
              title="Iniciar sesión en el portal"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl transition-all shadow-md shadow-[#E85D04]/20 active:scale-[0.98] cursor-pointer shrink-0"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Acceder</span>
            </button>
          )}

          {/* Botón de Menú Hamburguesa (visible en teléfonos y tablets) */}
          <button
            onClick={() => setMostrarMenuMovil(!mostrarMenuMovil)}
            className="lg:hidden flex items-center justify-center p-2 sm:p-2.5 text-white bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            aria-label={mostrarMenuMovil ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mostrarMenuMovil}
          >
            {mostrarMenuMovil ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MENÚ HAMBURGUESA MÓVIL (DRAWER RESPONSIVO CON OVERLAY)    */}
      {/* ========================================================= */}
      {mostrarMenuMovil && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
          {/* Telón de Fondo (Backdrop) */}
          <div
            onClick={() => setMostrarMenuMovil(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Panel Lateral Desplegable (Drawer) */}
          <div className="relative w-[86%] max-w-xs sm:max-w-sm h-full bg-[#142A4A] text-white shadow-2xl flex flex-col z-10 border-l border-[#274875] animate-in slide-in-from-right duration-200">
            {/* Cabecera del Drawer con botón de cierre */}
            <div className="p-4 border-b border-[#274875] flex items-center justify-between bg-[#10213A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <LiceoLogo className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-black text-xs uppercase tracking-tight text-white block">
                    Liceo Industrial
                  </span>
                  <span className="text-[10px] text-[#CBD5E0] block leading-none">
                    Menú Institucional TP
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMostrarMenuMovil(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl border border-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable del menú */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Tarjeta de Perfil de Usuario */}
              {usuario ? (
                <div className="p-3.5 rounded-xl bg-[#1B365D] border border-white/15 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-3">
                    {usuario.avatar ? (
                      <img
                        src={usuario.avatar}
                        alt={usuario.nombre}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#E85D04] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#E85D04] text-white shadow-xs shrink-0">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white truncate max-w-[140px]">
                          {usuario.nombre}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        {getRolBadge(usuario.rol)}
                      </div>
                      <span className="text-[11px] text-[#CBD5E0] block truncate mt-1">
                        {usuario.rut ? `RUT: ${usuario.rut}` : usuario.email || 'Usuario Activo'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMostrarMenuMovil(false);
                      onCerrarSesion();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#CBD5E0] hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#E85D04]" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMostrarMenuMovil(false);
                    onAbrirLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Acceder con Credenciales</span>
                </button>
              )}

              {/* Botón de Acción Rápida "+ Registrar Jornada" */}
              {vistaActiva === 'bitacora' && (
                <button
                  onClick={() => {
                    setMostrarMenuMovil(false);
                    onNuevaEntrada();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-sm rounded-xl shadow-md shadow-[#E85D04]/30 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Registrar Nueva Jornada</span>
                </button>
              )}

              {/* Sección de Módulos / Vistas Principales */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E0] px-1 block">
                  Navegación del Sistema
                </span>

                <button
                  onClick={() => {
                    setVistaActiva('bitacora');
                    setMostrarMenuMovil(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    vistaActiva === 'bitacora'
                      ? 'bg-white/20 text-white border border-white/30 shadow-xs'
                      : 'bg-[#1B365D]/70 text-[#CBD5E0] hover:bg-[#1B365D] hover:text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#E85D04]" />
                    <span>Bitácora de Práctica</span>
                  </div>
                  {vistaActiva === 'bitacora' && (
                    <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
                  )}
                </button>

                {usuario?.rol === 'root' && (
                  <button
                    onClick={() => {
                      setVistaActiva('admin');
                      setMostrarMenuMovil(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      vistaActiva === 'admin'
                        ? 'bg-[#E85D04] text-white border border-[#E85D04] shadow-xs'
                        : 'bg-[#1B365D]/70 text-[#CBD5E0] hover:bg-[#1B365D] hover:text-white border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Key className="w-4 h-4 text-white" />
                      <span>Panel Coordinador TP</span>
                    </div>
                    {vistaActiva === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                )}

                {(usuario?.rol === 'directivo' || usuario?.rol === 'root') && (
                  <button
                    onClick={() => {
                      setVistaActiva('directivo');
                      setMostrarMenuMovil(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      vistaActiva === 'directivo'
                        ? 'bg-[#7C3AED] text-white border border-[#7C3AED] shadow-xs'
                        : 'bg-[#1B365D]/70 text-[#CBD5E0] hover:bg-[#1B365D] hover:text-white border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Auditoría & Dirección</span>
                    </div>
                    {vistaActiva === 'directivo' && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                )}
              </div>

              {/* Herramientas & Documentos */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E0] px-1 block">
                  Herramientas Oficiales
                </span>

                {onAbrirLibroOficial && (
                  <button
                    onClick={() => {
                      setMostrarMenuMovil(false);
                      onAbrirLibroOficial();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1B365D]/70 hover:bg-[#1B365D] border border-white/10 text-xs text-white font-semibold cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-[#E85D04]" />
                      <span>Libro Oficial Foliado</span>
                    </div>
                    <span className="text-[10px] text-white font-mono bg-[#E85D04] px-1.5 py-0.5 rounded">
                      PDF
                    </span>
                  </button>
                )}

                {onAbrirNotificaciones && (
                  <button
                    onClick={() => {
                      setMostrarMenuMovil(false);
                      onAbrirNotificaciones();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1B365D]/70 hover:bg-[#1B365D] border border-white/10 text-xs text-white font-semibold cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#E85D04]" />
                      <span>Avisos por Correo</span>
                    </div>
                    {cantidadNotificacionesNoLeidas > 0 ? (
                      <span className="text-[10px] font-bold bg-[#E85D04] text-white px-2 py-0.5 rounded-full">
                        {cantidadNotificacionesNoLeidas} nuevas
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#CBD5E0]">Al día</span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setMostrarMenuMovil(false);
                    onExportarJSON();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1B365D]/70 hover:bg-[#1B365D] border border-white/10 text-xs text-[#CBD5E0] hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-[#E85D04]" />
                    <span>Copia de Respaldo</span>
                  </div>
                  <span className="text-[10px] text-white/70 font-mono">JSON</span>
                </button>
              </div>
            </div>

            {/* Pie del Menú Móvil */}
            <div className="p-3.5 border-t border-[#274875] bg-[#10213A] text-center text-[10px] text-[#CBD5E0]">
              <span className="font-bold text-white block">Liceo Industrial &bull; Electrotecnia</span>
              <span>Reglamento Prácticas Profesionales MINEDUC 2026</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

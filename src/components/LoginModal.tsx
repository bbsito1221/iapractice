import React, { useState } from 'react';
import { UsuarioApp } from '../types';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, X, UserCheck } from 'lucide-react';
import { LiceoLogo } from './LiceoLogo';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSelectUser: (usuario: UsuarioApp) => void;
  usuarioActual?: UsuarioApp | null;
  listaUsuarios: UsuarioApp[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  usuarioActual,
  listaUsuarios,
}) => {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [mostrarTestRoles, setMostrarTestRoles] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');

    const query = identificador.toLowerCase().trim();
    const pass = password.trim();

    if (!query || !pass) {
      setErrorLogin('Por favor ingrese su usuario o correo y contraseña.');
      return;
    }

    // Buscar coincidencia exacta o por credenciales de sistema (email, usuario, matrícula o RUT)
    const queryClean = query.replace(/[^0-9k]/gi, '');
    const usuarioEncontrado = listaUsuarios.find((u) => {
      const uRutClean = u.rut ? u.rut.replace(/[^0-9k]/gi, '').toLowerCase() : '';
      const coincideUsuario =
        (query === 'root' && u.rol === 'root') ||
        u.email.toLowerCase().trim() === query ||
        (u.username && u.username.toLowerCase().trim() === query) ||
        (u.matricula && u.matricula.toLowerCase().trim() === query) ||
        (Boolean(uRutClean) && Boolean(queryClean) && uRutClean === queryClean);

      const coincidePassword =
        (query === 'root' && pass === 'root' && u.rol === 'root') ||
        u.password === pass;

      return coincideUsuario && coincidePassword;
    });

    if (usuarioEncontrado) {
      onSelectUser(usuarioEncontrado);
      setIdentificador('');
      setPassword('');
      if (onClose) onClose();
    } else {
      setErrorLogin('Credenciales de acceso incorrectas. Verifique sus datos.');
    }
  };

  const handleQuickLogin = (u: UsuarioApp) => {
    onSelectUser(u);
    setIdentificador('');
    setPassword('');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#CBD5E0] overflow-hidden flex flex-col my-auto max-h-[92dvh] sm:max-h-[90vh]">
        {/* Cabecera Institucional */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#1B365D] shrink-0">
          <div className="flex items-center gap-3">
            <LiceoLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 shadow-sm" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Acceso al Sistema
              </h2>
              <p className="text-xs text-white/80">
                Liceo Industrial &bull; Prácticas Profesionales
              </p>
            </div>
          </div>

          {onClose && usuarioActual && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Formulario Estricto: Solo Correo y Contraseña */}
        <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          {errorLogin && (
            <div className="p-3 bg-[#FCE8E6] border border-[#FAD2CF] rounded-xl text-xs text-[#C5221F] flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorLogin}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2D3748] mb-1.5">
              Correo electrónico o usuario
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-identificador"
                type="text"
                autoComplete="username"
                required
                value={identificador}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="correo@liceorbl.cl o usuario"
                className="w-full pl-10 pr-4 py-3 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-base sm:text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/15 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D3748] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-password"
                type={mostrarPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-base sm:text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/15 focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#2D3748] cursor-pointer p-1"
                title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-iniciar-sesion"
              type="submit"
              className="w-full py-3.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-sm rounded-xl shadow-md shadow-[#E85D04]/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer min-h-[48px]"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Acceso Rápido para Pruebas (ideal en móvil) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setMostrarTestRoles(!mostrarTestRoles)}
              className="w-full py-2 px-3 text-xs font-semibold text-[#1B365D] hover:bg-[#F5F6F8] rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed border-[#CBD5E0]"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#E85D04]" />
              <span>{mostrarTestRoles ? 'Ocultar cuentas de prueba' : 'Acceso rápido con 1 toque (Cuentas de Prueba)'}</span>
            </button>

            {mostrarTestRoles && (
              <div className="mt-2.5 p-2 bg-[#F5F6F8] rounded-xl space-y-1.5 border border-[#E2E8F0] max-h-60 overflow-y-auto">
                {listaUsuarios.map((u) => {
                  const rolBadgeLabel =
                    u.rol === 'root'
                      ? '1. Coordinador TP'
                      : u.rol === 'verificador'
                      ? '2. Profesor Guía'
                      : u.rol === 'tutor_empresa'
                      ? '3. Maestro Guía Empresa'
                      : u.rol === 'directivo'
                      ? '5. Director / Auditor'
                      : '4. Alumno Practicante';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#E85D04] transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#1A202C]">{u.nombre}</div>
                        <div className="text-[11px] text-[#4A5568] flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#E85D04]">{rolBadgeLabel}</span>
                          {u.especialidad && (
                            <span>&bull; {u.especialidad}</span>
                          )}
                          {u.curso && (
                            <span className="font-mono text-[#1B365D]">({u.curso})</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1B365D] hover:bg-[#E85D04] text-white rounded shrink-0 transition-colors">
                        Acceder
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Pie de modal */}
        <div className="px-5 py-3 bg-[#F5F6F8] border-t border-[#E2E8F0] text-center text-xs text-[#718096]">
          Portal Oficial &bull; Liceo Industrial
        </div>
      </div>
    </div>
  );
};

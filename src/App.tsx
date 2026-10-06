import React, { useState, useEffect, useCallback } from 'react';
import {
  EntradaBitacora,
  UsuarioApp,
  EstadoVerificacion,
  EmpresaPractica,
  NotificacionEmail,
  DestinatarioEmail,
  ConfiguracionTP,
  EvaluacionDesempenoLaboral,
} from './types';
import { Header } from './components/Header';
import { EntryList } from './components/EntryList';
import { EntryModal } from './components/EntryModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { OfficialLogbookModal } from './components/OfficialLogbookModal';
import { LoginModal } from './components/LoginModal';
import { AdminPanel } from './components/AdminPanel';
import { DirectivoDashboard } from './components/DirectivoDashboard';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import {
  USUARIOS_PREDEFINIDOS,
  EMPRESAS_PREDEFINIDAS,
  ENTRADAS_INICIALES_ESTUDIANTILES,
  CONFIGURACION_TP_PREDEFINIDA,
} from './data/usuarios';
import { LogIn, Key, GraduationCap, ShieldCheck, Clock, Building2, Plus } from 'lucide-react';

export default function App() {
  // 1. GESTIÓN DE USUARIOS DINÁMICOS
  const [usuariosApp, setUsuariosApp] = useState<UsuarioApp[]>(() => {
    try {
      const guardado = localStorage.getItem('bitacora_usuarios_v2');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const rootIndex = parsed.findIndex(
            (u: UsuarioApp) => u.rol === 'root' || u.username === 'root'
          );
          if (rootIndex === -1) {
            return [USUARIOS_PREDEFINIDOS[0], ...parsed];
          } else {
            parsed[rootIndex] = {
              ...parsed[rootIndex],
              username: 'root',
              password: 'root',
              rol: 'root',
            };
            return parsed;
          }
        }
      }
    } catch {
      // fallback
    }
    return USUARIOS_PREDEFINIDOS;
  });

  // 2. GESTIÓN DE EMPRESAS DE PRÁCTICAS DINÁMICAS
  const [empresasApp, setEmpresasApp] = useState<EmpresaPractica[]>(() => {
    try {
      const guardado = localStorage.getItem('bitacora_empresas_v2');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return EMPRESAS_PREDEFINIDAS;
  });

  // 3. AUTENTICACIÓN: OBLIGATORIA AL ENTRAR
  const [usuarioActual, setUsuarioActual] = useState<UsuarioApp | null>(() => {
    try {
      const guardado = localStorage.getItem('bitacora_usuario_activo_v2');
      if (guardado) {
        return JSON.parse(guardado);
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [modalLoginAbierto, setModalLoginAbierto] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('bitacora_usuario_activo_v2');
    } catch {
      return true;
    }
  });

  // 4. CONFIGURACIÓN GENERAL DEL SISTEMA TP (MINEDUC)
  const [configuracionTP, setConfiguracionTP] = useState<ConfiguracionTP>(() => {
    try {
      const guardado = localStorage.getItem('bitacora_configuracion_tp_v2');
      if (guardado) {
        return JSON.parse(guardado);
      }
    } catch {
      // fallback
    }
    return CONFIGURACION_TP_PREDEFINIDA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bitacora_configuracion_tp_v2', JSON.stringify(configuracionTP));
    } catch (e) {
      console.error('Error guardando configuración TP:', e);
    }
  }, [configuracionTP]);

  // 5. VISTA ACTIVA (Bitácora, Coordinador TP Admin, o Dashboard Directivo)
  const [vistaActiva, setVistaActiva] = useState<'bitacora' | 'admin' | 'directivo'>('bitacora');

  useEffect(() => {
    if (usuarioActual?.rol === 'root') {
      setVistaActiva('admin');
    } else if (usuarioActual?.rol === 'directivo') {
      setVistaActiva('directivo');
    } else {
      setVistaActiva('bitacora');
    }
  }, [usuarioActual?.id, usuarioActual?.rol]);

  // 5. REGISTROS DE BITÁCORA Y HORAS
  const [entradas, setEntradas] = useState<EntradaBitacora[]>(() => {
    try {
      const saved = localStorage.getItem('bitacora_digital_entradas_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return ENTRADAS_INICIALES_ESTUDIANTILES;
  });

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [entradaParaEditar, setEntradaParaEditar] = useState<EntradaBitacora | null>(null);
  const [entradaDetalle, setEntradaDetalle] = useState<EntradaBitacora | null>(null);

  // Modal de Libro Oficial de Bitácora Foliado
  const [modalLibroOficial, setModalLibroOficial] = useState(false);
  const [alumnoSeleccionadoLibro, setAlumnoSeleccionadoLibro] = useState<UsuarioApp | null>(null);

  // 6. SISTEMA DE NOTIFICACIONES POR EMAIL A PROFESORES Y TUTORES
  const [notificaciones, setNotificaciones] = useState<NotificacionEmail[]>([]);
  const [modalNotificacionesAbierto, setModalNotificacionesAbierto] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotificaciones(data);
        }
      }
    } catch (e) {
      console.warn('No se pudieron cargar notificaciones del servidor:', e);
    }
  }, []);

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  // Persistir usuarios
  useEffect(() => {
    try {
      localStorage.setItem('bitacora_usuarios_v2', JSON.stringify(usuariosApp));
    } catch (e) {
      console.error('Error guardando usuarios:', e);
    }
  }, [usuariosApp]);

  // Persistir empresas
  useEffect(() => {
    try {
      localStorage.setItem('bitacora_empresas_v2', JSON.stringify(empresasApp));
    } catch (e) {
      console.error('Error guardando empresas:', e);
    }
  }, [empresasApp]);

  // Persistir entradas
  useEffect(() => {
    try {
      localStorage.setItem('bitacora_digital_entradas_v3', JSON.stringify(entradas));
    } catch (e) {
      console.error('Error guardando entradas:', e);
    }
  }, [entradas]);

  // Persistir usuario activo
  useEffect(() => {
    if (usuarioActual) {
      try {
        localStorage.setItem('bitacora_usuario_activo_v2', JSON.stringify(usuarioActual));
      } catch (e) {
        console.error('Error guardando usuario actual:', e);
      }
    } else {
      localStorage.removeItem('bitacora_usuario_activo_v2');
    }
  }, [usuarioActual]);

  // Sincronizar entradas con backend si está disponible
  const cargarEntradas = useCallback(async () => {
    try {
      const res = await fetch('/api/entradas');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const adaptadas: EntradaBitacora[] = data.map((d: any) => ({
            id: d.id,
            titulo: d.titulo,
            categoria: d.categoria,
            departamento: d.departamento,
            responsable: d.responsable,
            autorId: d.autorId || d.autor_id || 'alumno-carlos',
            autorEmail: d.autorEmail || d.autor_email,
            autorMatricula: d.autorMatricula || d.autor_matricula,
            rutAlumno: d.rutAlumno || d.rut_alumno,
            empresaId: d.empresaId || d.empresa_id,
            empresaNombre: d.empresaNombre || d.empresa_nombre || 'TechLogix Chile SpA',
            horasRegistradas: d.horasRegistradas || d.horas_registradas || 8,
            horaEntrada: d.horaEntrada || d.hora_entrada || '08:30',
            horaSalida: d.horaSalida || d.hora_salida || '17:30',
            colacionMinutos: d.colacionMinutos || d.colacion_minutos || 60,
            competenciasAplicadas: d.competenciasAplicadas || d.competencias_aplicadas,
            dificultadesAprendizaje: d.dificultadesAprendizaje || d.dificultades_aprendizaje,
            voboTutorEmpresa: d.voboTutorEmpresa || d.vobo_tutor_empresa || 'Pendiente',
            tutorEmpresaNombre: d.tutorEmpresaNombre || d.tutor_empresa_nombre,
            comentarioTutorEmpresa: d.comentarioTutorEmpresa || d.comentario_tutor_empresa,
            fechaVoboTutor: d.fechaVoboTutor || d.fecha_vobo_tutor,
            estadoVerificacion: d.estadoVerificacion || d.estado_verificacion || 'Pendiente',
            verificadoPor: d.verificadoPor || d.verificado_por,
            fechaVerificacion: d.fechaVerificacion || d.fecha_verificacion,
            comentarioDocente: d.comentarioDocente || d.comentario_docente,
            prioridad: d.prioridad,
            turno: d.turno,
            tiempoDedicado: d.tiempoDedicado || d.tiempo_dedicado,
            accionesTomadas: d.accionesTomadas || d.acciones_tomadas,
            observaciones: d.observaciones,
            fecha: d.fecha,
            contenido: d.contenido,
            tags:
              typeof d.tags === 'string'
                ? d.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : Array.isArray(d.tags)
                ? d.tags
                : [],
            estado: d.estado || 'Completado',
            creadoEn: d.createdAt || d.creadoEn || new Date().toISOString(),
          }));
          setEntradas(adaptadas);
        }
      }
    } catch (e) {
      console.warn('Usando almacenamiento local de entradas');
    }
  }, []);

  useEffect(() => {
    cargarEntradas();
  }, [cargarEntradas]);

  // CIERRE DE SESIÓN: Vuelve a exigir el Login
  const handleCerrarSesion = () => {
    setUsuarioActual(null);
    localStorage.removeItem('bitacora_usuario_activo_v2');
    setModalLoginAbierto(true);
  };

  // INICIO DE SESIÓN
  const handleSeleccionarUsuario = (usuario: UsuarioApp) => {
    setUsuarioActual(usuario);
    setModalLoginAbierto(false);
    if (usuario.rol === 'root') {
      setVistaActiva('admin');
    } else if (usuario.rol === 'directivo') {
      setVistaActiva('directivo');
    } else {
      setVistaActiva('bitacora');
    }
  };

  // CONFIGURACIÓN TP Y MINEDUC (Coordinador TP)
  const handleActualizarConfiguracion = (nuevaConfig: ConfiguracionTP) => {
    setConfiguracionTP(nuevaConfig);
  };

  // FIRMA DIGITAL DE ACTAS DE TITULACIÓN (Rol 5: Directivo / Auditor)
  const handleFirmarActaDirectivo = (alumnoId: string) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const nombreFirma = usuarioActual?.nombre || 'Don Luis Valenzuela Castro (Director)';
    setUsuariosApp((prev) =>
      prev.map((u) =>
        u.id === alumnoId
          ? {
              ...u,
              actaFirmadaDirectivo: true,
              fechaFirmaDirectivo: fechaHoy,
              directivoFirmaNombre: nombreFirma,
              estadoPractica: 'Completado',
            }
          : u
      )
    );
  };

  // EVALUACIÓN DE DESEMPEÑO LABORAL (Rol 3: Tutor de Empresa / Maestro Guía)
  const handleGuardarEvaluacionLaboral = (
    alumnoId: string,
    evaluacion: EvaluacionDesempenoLaboral
  ) => {
    setUsuariosApp((prev) =>
      prev.map((u) =>
        u.id === alumnoId
          ? {
              ...u,
              evaluacionEmpresa: evaluacion,
              estadoPractica: 'Completado',
            }
          : u
      )
    );
  };

  // OPERACIONES CRUD PARA EL USUARIO ROOT
  const handleCrearUsuario = (nuevoUsuario: UsuarioApp) => {
    setUsuariosApp((prev) => [nuevoUsuario, ...prev]);
  };

  const handleEditarUsuario = (usuarioActualizado: UsuarioApp) => {
    setUsuariosApp((prev) =>
      prev.map((u) => (u.id === usuarioActualizado.id ? usuarioActualizado : u))
    );
    if (usuarioActual?.id === usuarioActualizado.id) {
      setUsuarioActual(usuarioActualizado);
    }
  };

  const handleEliminarUsuario = (id: string) => {
    setUsuariosApp((prev) => prev.filter((u) => u.id !== id));
  };

  const handleCrearEmpresa = (nuevaEmpresa: EmpresaPractica) => {
    setEmpresasApp((prev) => [nuevaEmpresa, ...prev]);
  };

  const handleEditarEmpresa = (empresaActualizada: EmpresaPractica) => {
    setEmpresasApp((prev) =>
      prev.map((emp) => (emp.id === empresaActualizada.id ? empresaActualizada : emp))
    );
  };

  const handleEliminarEmpresa = (id: string) => {
    setEmpresasApp((prev) => prev.filter((emp) => emp.id !== id));
  };

  // OPERACIONES SOBRE LAS ENTRADAS DE PRÁCTICAS Y NOTIFICACIONES
  const despacharNotificacionEmailEntrada = async (
    entrada: EntradaBitacora,
    tipo: 'nueva_entrada' | 'recordatorio_validacion' | 'dictamen_tutor' | 'dictamen_docente' = 'nueva_entrada',
    notaAdicional?: string
  ) => {
    try {
      // 1. Encontrar al alumno
      const alumno =
        usuariosApp.find((u) => u.id === entrada.autorId || u.email === entrada.autorEmail) ||
        (usuarioActual?.rol === 'alumno' ? usuarioActual : null);

      // 2. Encontrar al profesor guía asignado
      const profesor =
        usuariosApp.find(
          (u) =>
            u.rol === 'verificador' &&
            (u.id === alumno?.profesorId || u.nombre === alumno?.profesorNombre || u.nombre === entrada.verificadoPor)
        ) || usuariosApp.find((u) => u.rol === 'verificador');

      // 3. Encontrar al tutor de empresa
      const tutor =
        usuariosApp.find(
          (u) =>
            u.rol === 'tutor_empresa' &&
            (u.id === alumno?.tutorId || u.nombre === alumno?.tutorNombre || u.empresaId === alumno?.empresaId)
        ) || usuariosApp.find((u) => u.rol === 'tutor_empresa');

      const destinatarios: DestinatarioEmail[] = [];
      if (profesor) {
        destinatarios.push({
          email: profesor.email,
          nombre: profesor.nombre,
          rol: 'profesor',
          tipo: 'para',
        });
      }
      if (tutor) {
        destinatarios.push({
          email: tutor.email,
          nombre: tutor.nombre,
          rol: 'tutor_empresa',
          tipo: 'para',
        });
      }
      if (alumno?.email) {
        destinatarios.push({
          email: alumno.email,
          nombre: alumno.nombre,
          rol: 'alumno',
          tipo: 'cc',
        });
      }

      const res = await fetch('/api/notificaciones/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entradaId: entrada.id,
          tituloEntrada: entrada.titulo,
          alumnoNombre: alumno?.nombre || entrada.responsable || 'Estudiante Practicante',
          alumnoRut: alumno?.rut || entrada.rutAlumno || '19.876.543-2',
          alumnoEmail: alumno?.email || entrada.autorEmail || 'alumno@instituto.cl',
          empresaNombre: entrada.empresaNombre || 'Centro de Prácticas',
          horasRegistradas: entrada.horasRegistradas || 8,
          jornadaFecha: entrada.fecha || new Date().toISOString().split('T')[0],
          tipo,
          destinatarios,
          resumenTareas: entrada.contenido,
          competenciasAplicadas: entrada.competenciasAplicadas,
          turno: entrada.turno,
          horario: `${entrada.horaEntrada || '08:30'} a ${entrada.horaSalida || '17:30'}`,
          notaAdicional,
        }),
      });

      if (res.ok) {
        const notifCreada = await res.json();
        setNotificaciones((prev) => [notifCreada, ...prev.filter((n) => n.id !== notifCreada.id)]);
      }
    } catch (e) {
      console.warn('Error despachando notificación por email:', e);
    }
  };

  const handleGuardarEntrada = async (
    datos: Omit<EntradaBitacora, 'id' | 'creadoEn'> & { id?: number; notificarPorEmail?: boolean }
  ) => {
    if (datos.id) {
      try {
        await fetch(`/api/entradas/${datos.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        });
      } catch (e) {
        console.warn('Guardando actualización localmente');
      }

      const entradaActualizada: EntradaBitacora = {
        ...datos,
        id: datos.id,
        creadoEn: new Date().toISOString(),
      } as EntradaBitacora;

      setEntradas((prev) =>
        prev.map((item) =>
          item.id === datos.id
            ? {
                ...item,
                ...datos,
              }
            : item
        )
      );

      if (datos.notificarPorEmail) {
        await despacharNotificacionEmailEntrada(entradaActualizada, 'nueva_entrada');
      }
    } else {
      let nuevoId = Date.now();
      try {
        const res = await fetch('/api/entradas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        });
        if (res.ok) {
          const created = await res.json();
          if (created.id) nuevoId = created.id;
        }
      } catch (e) {
        console.warn('Guardando entrada nueva localmente');
      }

      const nueva: EntradaBitacora = {
        id: nuevoId,
        ...datos,
        creadoEn: new Date().toISOString(),
      };
      setEntradas((prev) => [nueva, ...prev]);

      // Despachar notificación por correo si la opción está activa (por defecto true)
      if (datos.notificarPorEmail !== false) {
        await despacharNotificacionEmailEntrada(nueva, 'nueva_entrada');
      }
    }
  };

  // Dictamen completo: Docente Supervisor y Tutor de Empresa
  const handleActualizarVerificacionCompleta = async (
    id: number,
    nuevoEstadoDocente: string,
    comentarioDocente: string,
    nuevoVoboEmpresa?: string,
    comentarioTutor?: string
  ) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const payload: Partial<EntradaBitacora> = {
      estadoVerificacion: nuevoEstadoDocente as EstadoVerificacion,
      comentarioDocente: comentarioDocente,
      fechaVerificacion: fechaHoy,
      ...(usuarioActual?.rol === 'verificador' ? { verificadoPor: usuarioActual.nombre } : {}),
      ...(nuevoVoboEmpresa ? { voboTutorEmpresa: nuevoVoboEmpresa as EstadoVerificacion } : {}),
      ...(comentarioTutor !== undefined ? { comentarioTutorEmpresa: comentarioTutor } : {}),
      ...(usuarioActual?.rol === 'tutor_empresa'
        ? { tutorEmpresaNombre: usuarioActual.nombre, fechaVoboTutor: fechaHoy }
        : {}),
    };

    try {
      await fetch(`/api/entradas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Verificación actualizada localmente');
    }

    setEntradas((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const itemActualizado = {
            ...item,
            ...payload,
          };
          if (entradaDetalle?.id === id) {
            setEntradaDetalle(itemActualizado);
          }
          // Notificar resolución vía email
          const tipoNotif = usuarioActual?.rol === 'tutor_empresa' ? 'dictamen_tutor' : 'dictamen_docente';
          const nota = usuarioActual?.rol === 'tutor_empresa' ? comentarioTutor : comentarioDocente;
          despacharNotificacionEmailEntrada(itemActualizado, tipoNotif, nota);
          return itemActualizado;
        }
        return item;
      })
    );
  };

  // Dictamen dual simplificado
  const handleVerificarBitacora = async (
    id: number,
    nuevoEstado: EstadoVerificacion,
    comentario: string
  ) => {
    const esTutor = usuarioActual?.rol === 'tutor_empresa';
    if (esTutor) {
      await handleActualizarVerificacionCompleta(id, 'Pendiente', '', nuevoEstado, comentario);
    } else {
      await handleActualizarVerificacionCompleta(id, nuevoEstado, comentario);
    }
  };

  // Reenviar notificación existente por email
  const handleReenviarNotificacion = async (notificacionId: string) => {
    try {
      const res = await fetch(`/api/notificaciones/reenviar/${notificacionId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const nueva = await res.json();
        setNotificaciones((prev) => [nueva, ...prev]);
      }
    } catch (e) {
      console.error('Error al reenviar notificación:', e);
    }
  };

  // Marcar notificación como leída
  const handleMarcarLeido = async (notificacionId: string) => {
    if (!usuarioActual) return;
    try {
      await fetch(`/api/notificaciones/${notificacionId}/marcar-leido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuarioActual.id }),
      });
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id === notificacionId && !n.leidoPor.includes(usuarioActual.id)
            ? { ...n, leidoPor: [...n.leidoPor, usuarioActual.id] }
            : n
        )
      );
    } catch (e) {
      console.warn('Error marcando como leída');
    }
  };

  // Envío manual de aviso desde el centro de notificaciones
  const handleEnviarNotificacionManual = async (params: {
    entradaId: number;
    tipo: 'recordatorio_validacion' | 'nueva_entrada';
    notaAdicional?: string;
  }) => {
    const entrada = entradas.find((e) => e.id === params.entradaId);
    if (entrada) {
      await despacharNotificacionEmailEntrada(entrada, params.tipo, params.notaAdicional);
    }
  };

  const handleEliminarEntrada = async (id: number) => {
    try {
      await fetch(`/api/entradas/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Eliminación ejecutada localmente');
    }
    setEntradas((prev) => prev.filter((e) => e.id !== id));
    if (entradaDetalle?.id === id) {
      setEntradaDetalle(null);
    }
  };

  const handleAbrirLibroOficial = (alumno?: UsuarioApp) => {
    if (alumno) {
      setAlumnoSeleccionadoLibro(alumno);
    } else if (usuarioActual && usuarioActual.rol === 'alumno') {
      setAlumnoSeleccionadoLibro(usuarioActual);
    } else {
      const primerAlumno = usuariosApp.find((u) => u.rol === 'alumno') || null;
      setAlumnoSeleccionadoLibro(primerAlumno);
    }
    setModalLibroOficial(true);
  };

  const handleExportarJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            fechaExportacion: new Date().toISOString(),
            usuarioExportador: usuarioActual?.nombre,
            usuarios: usuariosApp,
            empresas: empresasApp,
            bitacorasHoras: entradas,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bitacora_practicas_profesionales_chile.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Alumno en contexto para el libro oficial
  const alumnoLibro =
    alumnoSeleccionadoLibro ||
    (usuarioActual?.rol === 'alumno' ? usuarioActual : usuariosApp.find((u) => u.rol === 'alumno')) ||
    null;

  const empresaLibro = alumnoLibro
    ? empresasApp.find(
        (e) => e.id === alumnoLibro.empresaId || e.nombre === alumnoLibro.empresaNombre
      ) || null
    : null;

  const profesorLibro = alumnoLibro
    ? usuariosApp.find(
        (u) =>
          u.rol === 'verificador' &&
          (u.id === alumnoLibro.profesorId || u.nombre === alumnoLibro.profesorNombre)
      ) || null
    : null;

  const tutorLibro = alumnoLibro
    ? usuariosApp.find(
        (u) =>
          u.rol === 'tutor_empresa' &&
          (u.id === alumnoLibro.tutorId || u.nombre === alumnoLibro.tutorNombre)
      ) || null
    : null;

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col font-sans text-[#1A202C] selection:bg-[#E85D04]/20 selection:text-[#E85D04]">
      {/* Barra de navegación superior */}
      <Header
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        onNuevaEntrada={() => {
          setEntradaParaEditar(null);
          setModalAbierto(true);
        }}
        onExportarJSON={handleExportarJSON}
        usuario={usuarioActual}
        onAbrirLogin={() => setModalLoginAbierto(true)}
        onCerrarSesion={handleCerrarSesion}
        onAbrirLibroOficial={() => handleAbrirLibroOficial()}
        onAbrirNotificaciones={() => setModalNotificacionesAbierto(true)}
        cantidadNotificacionesNoLeidas={
          notificaciones.filter((n) =>
            usuarioActual
              ? !n.leidoPor?.includes(usuarioActual.id) && !n.leidoPor?.includes(usuarioActual.email)
              : false
          ).length
        }
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-7">
        {!usuarioActual ? (
          /* Pantalla bloqueada cuando no hay sesión activa */
          <div className="py-16 text-center max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#CBD5E0] mx-auto flex items-center justify-center text-[#E85D04] shadow-md">
              <Key className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B365D]">
                Acceso al Portal de Prácticas
              </h2>
              <p className="text-sm text-[#4A5568] mt-1.5 leading-relaxed">
                Debe identificarse con sus credenciales institucionales para consultar o registrar en la bitácora de prácticas del Liceo Industrial.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalLoginAbierto(true)}
                className="px-6 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-sm rounded-xl shadow-md shadow-[#E85D04]/25 transition-all flex items-center justify-center gap-2 mx-auto active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          </div>
        ) : vistaActiva === 'admin' && usuarioActual.rol === 'root' ? (
          /* PANEL ROOT DE ADMINISTRACIÓN (Rol 1: Coordinador TP) */
          <AdminPanel
            usuarios={usuariosApp}
            empresas={empresasApp}
            entradas={entradas}
            onCrearUsuario={handleCrearUsuario}
            onEditarUsuario={handleEditarUsuario}
            onEliminarUsuario={handleEliminarUsuario}
            onCrearEmpresa={handleCrearEmpresa}
            onEditarEmpresa={handleEditarEmpresa}
            onEliminarEmpresa={handleEliminarEmpresa}
            onAbrirNotificaciones={() => setModalNotificacionesAbierto(true)}
            cantidadNotificaciones={notificaciones.length}
            configuracion={configuracionTP}
            onActualizarConfiguracion={handleActualizarConfiguracion}
          />
        ) : vistaActiva === 'directivo' ? (
          /* DASHBOARD DE EQUIPO DIRECTIVO / AUDITOR (Rol 5: Vista de Pájaro y Firma de Actas) */
          <DirectivoDashboard
            usuarios={usuariosApp}
            empresas={empresasApp}
            entradas={entradas}
            usuarioDirectivo={usuarioActual}
            onAbrirLibroOficial={handleAbrirLibroOficial}
            onFirmarActaDirectivo={handleFirmarActaDirectivo}
          />
        ) : (
          /* VISTA DE BITÁCORAS DE HORAS DE PRÁCTICAS */
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
            usuarioActual={usuarioActual}
            onAbrirLogin={() => setModalLoginAbierto(true)}
            listaUsuarios={usuariosApp}
            listaEmpresas={empresasApp}
            onIrAPanelRoot={() => setVistaActiva('admin')}
            onIrAPanelDirectivo={() => setVistaActiva('directivo')}
            onAbrirLibroOficial={handleAbrirLibroOficial}
            onGuardarEvaluacionLaboral={handleGuardarEvaluacionLaboral}
          />
        )}
      </main>

      {/* Barra fija en la parte inferior para Registrar Jornada en teléfonos */}
      {usuarioActual && vistaActiva === 'bitacora' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-white/95 backdrop-blur-md border-t border-[#CBD5E0] shadow-lg flex items-center justify-between gap-2 pb-safe">
          <button
            id="btn-inferior-movil-jornada"
            onClick={() => {
              setEntradaParaEditar(null);
              setModalAbierto(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#E85D04] hover:bg-[#D04F00] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#E85D04]/30 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Jornada de Práctica</span>
          </button>
        </div>
      )}

      {/* Pie de página institucional */}
      <footer className="bg-[#1B365D] border-t border-[#142A4A] py-6 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-sm text-white">
              Liceo Industrial &bull; Especialidad Electrotecnia
            </p>
            <p className="text-[#CBD5E0] text-xs mt-0.5">
              Portal Oficial de Acreditación de Prácticas Profesionales &bull; <a href="https://liceorbl.cl" target="_blank" rel="noopener noreferrer" className="text-[#E85D04] hover:underline font-semibold">liceorbl.cl</a>
            </p>
          </div>
          <div className="text-[#CBD5E0] text-xs">
            <span>Sistema Institucional de Gestión y Visado Digital</span>
          </div>
        </div>
      </footer>

      {/* Modal de Crear / Editar Jornada de Práctica */}
      <EntryModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setEntradaParaEditar(null);
        }}
        onSave={handleGuardarEntrada}
        entradaParaEditar={entradaParaEditar}
        usuarioActual={usuarioActual}
        listaAlumnos={usuariosApp.filter((u) => u.rol === 'alumno')}
        listaEmpresas={empresasApp}
      />

      {/* Modal de Vista Detalle con Doble Visado y Aviso por Email */}
      <EntryDetailModal
        entrada={entradaDetalle}
        isOpen={Boolean(entradaDetalle)}
        onClose={() => setEntradaDetalle(null)}
        onEditar={(entrada) => {
          setEntradaParaEditar(entrada);
          setModalAbierto(true);
        }}
        onEliminar={handleEliminarEntrada}
        usuarioActual={usuarioActual}
        onActualizarVerificacion={handleActualizarVerificacionCompleta}
        onEnviarNotificacionEmail={async (entrada, tipo) => {
          await despacharNotificacionEmailEntrada(entrada, tipo);
        }}
      />

      {/* Modal del Libro Oficial de Prácticas con Certificación y Firmas */}
      <OfficialLogbookModal
        isOpen={modalLibroOficial}
        onClose={() => setModalLibroOficial(false)}
        alumno={alumnoLibro}
        entradas={entradas}
        empresa={empresaLibro}
        profesor={profesorLibro}
        tutor={tutorLibro}
      />

      {/* Centro de Notificaciones por Email a Profesores y Tutores */}
      <EmailNotificationModal
        isOpen={modalNotificacionesAbierto}
        onClose={() => setModalNotificacionesAbierto(false)}
        notificaciones={notificaciones}
        usuarioActual={usuarioActual}
        entradas={entradas}
        usuarios={usuariosApp}
        empresas={empresasApp}
        onSeleccionarEntradaParaValidar={(entradaId) => {
          const seleccionada = entradas.find((e) => e.id === entradaId);
          if (seleccionada) {
            setEntradaDetalle(seleccionada);
          }
        }}
        onReenviarNotificacion={handleReenviarNotificacion}
        onEnviarNotificacionManual={handleEnviarNotificacionManual}
        onMarcarLeido={handleMarcarLeido}
      />

      {/* Modal de Inicio de Sesión Obligatorio y con Perfil ROOT */}
      <LoginModal
        isOpen={modalLoginAbierto || !usuarioActual}
        onClose={() => {
          if (usuarioActual) {
            setModalLoginAbierto(false);
          }
        }}
        usuarioActual={usuarioActual}
        listaUsuarios={usuariosApp}
        onSelectUser={handleSeleccionarUsuario}
      />
    </div>
  );
}

import React, { useState } from 'react';
import {
  UsuarioApp,
  EmpresaPractica,
  EntradaBitacora,
  ConfiguracionTP,
  EspecialidadTP,
  CursoTP,
  ESPECIALIDADES_OFICIALES,
  CURSOS_OFICIALES,
  HORAS_MINEDUC_OPCIONES,
} from '../types';
import { AdminChartsDashboard } from './AdminChartsDashboard';
import { generarReportePDFBitacora } from '../utils/pdfGenerator';
import {
  Users,
  GraduationCap,
  Building2,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Search,
  Mail,
  X,
  Award,
  MapPin,
  BarChart3,
  FileDown,
  Shield,
  Sliders,
  Check,
  Power,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface AdminPanelProps {
  usuarios: UsuarioApp[];
  empresas: EmpresaPractica[];
  entradas: EntradaBitacora[];
  onCrearUsuario: (nuevoUsuario: UsuarioApp) => void;
  onEditarUsuario: (usuarioActualizado: UsuarioApp) => void;
  onEliminarUsuario: (id: string) => void;
  onCrearEmpresa: (nuevaEmpresa: EmpresaPractica) => void;
  onEditarEmpresa: (empresaActualizada: EmpresaPractica) => void;
  onEliminarEmpresa: (id: string) => void;
  onAbrirNotificaciones?: () => void;
  cantidadNotificaciones?: number;
  configuracion?: ConfiguracionTP;
  onActualizarConfiguracion?: (cfg: ConfiguracionTP) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  usuarios,
  empresas,
  entradas,
  onCrearUsuario,
  onEditarUsuario,
  onEliminarUsuario,
  onCrearEmpresa,
  onEditarEmpresa,
  onEliminarEmpresa,
  onAbrirNotificaciones,
  cantidadNotificaciones = 0,
  configuracion,
  onActualizarConfiguracion,
}) => {
  const [tabActiva, setTabActiva] = useState<
    'dashboard' | 'estudiantes' | 'profesores' | 'tutores' | 'directivos' | 'empresas' | 'estructura' | 'resumen'
  >('dashboard');
  const [menuModulosMovilAbierto, setMenuModulosMovilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalEstudianteAbierto, setModalEstudianteAbierto] = useState(false);
  const [modalProfesorAbierto, setModalProfesorAbierto] = useState(false);
  const [modalTutorAbierto, setModalTutorAbierto] = useState(false);
  const [modalDirectivoAbierto, setModalDirectivoAbierto] = useState(false);
  const [modalEmpresaAbierto, setModalEmpresaAbierto] = useState(false);

  // Estados de edición
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<UsuarioApp | null>(null);
  const [empresaEnEdicion, setEmpresaEnEdicion] = useState<EmpresaPractica | null>(null);

  // Formulario Estudiante
  const [estNombre, setEstNombre] = useState('');
  const [estRut, setEstRut] = useState('');
  const [estMatricula, setEstMatricula] = useState('');
  const [estEmail, setEstEmail] = useState('');
  const [estPassword, setEstPassword] = useState('alumno123');
  const [estCarrera, setEstCarrera] = useState('');
  const [estEspecialidad, setEstEspecialidad] = useState<EspecialidadTP | string>('Electricidad');
  const [estCurso, setEstCurso] = useState<CursoTP | string>('4° Medio A');
  const [estActivo, setEstActivo] = useState(true);
  const [estTelefono, setEstTelefono] = useState('');
  const [estEmpresaId, setEstEmpresaId] = useState('');
  const [estTutorId, setEstTutorId] = useState('');
  const [estProfesorId, setEstProfesorId] = useState('');
  const [estHorasReq, setEstHorasReq] = useState(360);
  const [estFechaInicio, setEstFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [estFechaFin, setEstFechaFin] = useState('');

  // Formulario Profesor Guía
  const [profNombre, setProfNombre] = useState('');
  const [profRut, setProfRut] = useState('');
  const [profCodigo, setProfCodigo] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPassword, setProfPassword] = useState('docente123');
  const [profDepto, setProfDepto] = useState('');
  const [profCarrera, setProfCarrera] = useState('');
  const [profEspecialidadSupervisada, setProfEspecialidadSupervisada] = useState<EspecialidadTP | string>('Electricidad');
  const [profCursoSupervisado, setProfCursoSupervisado] = useState<CursoTP | string>('4° Medio A');
  const [profActivo, setProfActivo] = useState(true);
  const [profTelefono, setProfTelefono] = useState('');

  // Formulario Tutor de Empresa / Maestro Guía
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorRut, setTutorRut] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorPassword, setTutorPassword] = useState('tutor123');
  const [tutorCargo, setTutorCargo] = useState('');
  const [tutorEmpresaId, setTutorEmpresaId] = useState('');
  const [tutorActivo, setTutorActivo] = useState(true);
  const [tutorTelefono, setTutorTelefono] = useState('');

  // Formulario Directivo / Equipo Directivo
  const [dirNombre, setDirNombre] = useState('');
  const [dirRut, setDirRut] = useState('');
  const [dirEmail, setDirEmail] = useState('');
  const [dirPassword, setDirPassword] = useState('directivo123');
  const [dirCargo, setDirCargo] = useState('Director / Equipo Directivo');
  const [dirActivo, setDirActivo] = useState(true);
  const [dirTelefono, setDirTelefono] = useState('');

  // Configuración de Horas MINEDUC y Estructura TP
  const [horasMineducParam, setHorasMineducParam] = useState<number>(
    configuracion?.horasRequeridasMineduc || 360
  );
  const [anoLectivo, setAnoLectivo] = useState<number>(configuracion?.anoLectivo || 2026);
  const [periodoActivo, setPeriodoActivo] = useState<boolean>(
    configuracion?.periodoPracticasActivo !== false
  );
  const [especialidadesActivas, setEspecialidadesActivas] = useState<EspecialidadTP[]>(
    configuracion?.especialidadesActivas || ['Electricidad', 'Electrónica', 'Telecomunicaciones']
  );
  const [cursosActivos, setCursosActivos] = useState<CursoTP[]>(
    configuracion?.cursosActivos || ['4° Medio A', '4° Medio B', '4° Medio C']
  );
  const [guardadoConfigExito, setGuardadoConfigExito] = useState(false);

  const guardarParametrosMineduc = (e: React.FormEvent) => {
    e.preventDefault();
    if (onActualizarConfiguracion) {
      onActualizarConfiguracion({
        horasRequeridasMineduc: horasMineducParam,
        anoLectivo,
        especialidadesActivas,
        cursosActivos,
        periodoPracticasActivo: periodoActivo,
      });
    }
    setGuardadoConfigExito(true);
    setTimeout(() => setGuardadoConfigExito(false), 3000);
  };

  // Formulario Empresa
  const [empNombre, setEmpNombre] = useState('');
  const [empRut, setEmpRut] = useState('');
  const [empGiro, setEmpGiro] = useState('');
  const [empSector, setEmpSector] = useState('');
  const [empDireccion, setEmpDireccion] = useState('');
  const [empComuna, setEmpComuna] = useState('');
  const [empRegion, setEmpRegion] = useState('');
  const [empSupervisor, setEmpSupervisor] = useState('');
  const [empSupervisorCargo, setEmpSupervisorCargo] = useState('');
  const [empSupervisorEmail, setEmpSupervisorEmail] = useState('');
  const [empSupervisorTelefono, setEmpSupervisorTelefono] = useState('');
  const [empConvenio, setEmpConvenio] = useState(true);

  const estudiantes = usuarios.filter((u) => u.rol === 'alumno');
  const profesores = usuarios.filter((u) => u.rol === 'verificador');
  const tutoresEmpresa = usuarios.filter((u) => u.rol === 'tutor_empresa');
  const directivos = usuarios.filter((u) => u.rol === 'directivo');

  // Calcular horas acumuladas de un estudiante basadas en entradas verificadas
  const calcularHorasEstudiante = (alumnoId: string, alumnoEmail?: string, alumnoRut?: string) => {
    return entradas
      .filter(
        (e) =>
          (e.autorId === alumnoId || e.autorEmail === alumnoEmail || e.rutAlumno === alumnoRut) &&
          e.estadoVerificacion === 'Verificado'
      )
      .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);
  };

  // Toggle Activar / Deshabilitar cuenta de usuario (Requerimiento Coordinador TP)
  const toggleEstadoUsuario = (usuario: UsuarioApp) => {
    const nuevoEstado = usuario.activo === false ? true : false;
    onEditarUsuario({
      ...usuario,
      activo: nuevoEstado,
    });
  };

  // 1. MODAL ESTUDIANTE
  const abrirModalEstudiante = (alumno?: UsuarioApp) => {
    if (alumno) {
      setUsuarioEnEdicion(alumno);
      setEstNombre(alumno.nombre);
      setEstRut(alumno.rut || '');
      setEstMatricula(alumno.matricula || '');
      setEstEmail(alumno.email);
      setEstPassword(alumno.password || 'alumno123');
      setEstCarrera(alumno.carrera || '');
      setEstEspecialidad(alumno.especialidad || 'Electricidad');
      setEstCurso(alumno.curso || '4° Medio A');
      setEstActivo(alumno.activo !== false);
      setEstTelefono(alumno.telefono || '');
      setEstEmpresaId(alumno.empresaId || empresas[0]?.id || '');
      setEstTutorId(alumno.tutorId || tutoresEmpresa[0]?.id || '');
      setEstProfesorId(alumno.profesorId || profesores[0]?.id || '');
      setEstHorasReq(alumno.horasRequeridas || horasMineducParam || 360);
      setEstFechaInicio(alumno.fechaInicio || new Date().toISOString().split('T')[0]);
      setEstFechaFin(alumno.fechaFinEstimada || '');
    } else {
      setUsuarioEnEdicion(null);
      setEstNombre('');
      setEstRut('');
      setEstMatricula(`ALU-${Date.now().toString().slice(-4)}`);
      setEstEmail('');
      setEstPassword('alumno123');
      setEstCarrera('Técnico en Electricidad');
      setEstEspecialidad('Electricidad');
      setEstCurso('4° Medio A');
      setEstActivo(true);
      setEstTelefono('+56 9 ');
      setEstEmpresaId(empresas[0]?.id || '');
      setEstTutorId(tutoresEmpresa[0]?.id || '');
      setEstProfesorId(profesores[0]?.id || '');
      setEstHorasReq(horasMineducParam || 360);
      setEstFechaInicio(new Date().toISOString().split('T')[0]);
      setEstFechaFin('');
    }
    setModalEstudianteAbierto(true);
  };

  const guardarEstudiante = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empresas.find((e) => e.id === estEmpresaId);
    const tut = tutoresEmpresa.find((t) => t.id === estTutorId);
    const prof = profesores.find((p) => p.id === estProfesorId);

    if (usuarioEnEdicion) {
      onEditarUsuario({
        ...usuarioEnEdicion,
        nombre: estNombre.trim(),
        rut: estRut.trim(),
        matricula: estMatricula.trim(),
        email: estEmail.trim(),
        password: estPassword.trim(),
        carrera: estCarrera.trim() || `Técnico en ${estEspecialidad}`,
        especialidad: estEspecialidad,
        curso: estCurso,
        activo: estActivo,
        telefono: estTelefono.trim(),
        empresaId: estEmpresaId,
        empresaNombre: emp?.nombre || '',
        tutorId: estTutorId,
        tutorNombre: tut?.nombre || '',
        profesorId: estProfesorId,
        profesorNombre: prof?.nombre || '',
        horasRequeridas: estHorasReq,
        fechaInicio: estFechaInicio,
        fechaFinEstimada: estFechaFin,
      });
    } else {
      onCrearUsuario({
        id: `alumno-${Date.now()}`,
        nombre: estNombre.trim(),
        username: estEmail.split('@')[0] || `alumno_${Date.now()}`,
        email: estEmail.trim(),
        rol: 'alumno',
        rut: estRut.trim(),
        password: estPassword.trim(),
        matricula: estMatricula.trim(),
        carrera: estCarrera.trim() || `Técnico en ${estEspecialidad}`,
        especialidad: estEspecialidad,
        curso: estCurso,
        activo: estActivo,
        institucion: 'Liceo Industrial',
        telefono: estTelefono.trim(),
        empresaId: estEmpresaId,
        empresaNombre: emp?.nombre || '',
        tutorId: estTutorId,
        tutorNombre: tut?.nombre || '',
        profesorId: estProfesorId,
        profesorNombre: prof?.nombre || '',
        horasRequeridas: estHorasReq,
        fechaInicio: estFechaInicio,
        fechaFinEstimada: estFechaFin,
        avatar:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      });
    }
    setModalEstudianteAbierto(false);
  };

  // 2. MODAL PROFESOR GUÍA
  const abrirModalProfesor = (prof?: UsuarioApp) => {
    if (prof) {
      setUsuarioEnEdicion(prof);
      setProfNombre(prof.nombre);
      setProfRut(prof.rut || '');
      setProfCodigo(prof.matricula || '');
      setProfEmail(prof.email);
      setProfPassword(prof.password || 'docente123');
      setProfDepto(prof.especialidad || 'Electricidad');
      setProfEspecialidadSupervisada(prof.especialidadSupervisada || prof.especialidad || 'Electricidad');
      setProfCursoSupervisado(prof.cursosSupervisados?.[0] || '4° Medio A');
      setProfActivo(prof.activo !== false);
      setProfCarrera(prof.carrera || '');
      setProfTelefono(prof.telefono || '');
    } else {
      setUsuarioEnEdicion(null);
      setProfNombre('');
      setProfRut('');
      setProfCodigo(`DOC-${Date.now().toString().slice(-4)}`);
      setProfEmail('');
      setProfPassword('docente123');
      setProfDepto('Docente Supervisor de Prácticas');
      setProfEspecialidadSupervisada('Electricidad');
      setProfCursoSupervisado('4° Medio A');
      setProfActivo(true);
      setProfCarrera('Pedagogía Técnico Profesional');
      setProfTelefono('+56 9 ');
    }
    setModalProfesorAbierto(true);
  };

  const guardarProfesor = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioEnEdicion) {
      onEditarUsuario({
        ...usuarioEnEdicion,
        nombre: profNombre.trim(),
        rut: profRut.trim(),
        matricula: profCodigo.trim(),
        email: profEmail.trim(),
        password: profPassword.trim(),
        especialidad: profEspecialidadSupervisada,
        especialidadSupervisada: profEspecialidadSupervisada,
        cursosSupervisados: [profCursoSupervisado as string],
        activo: profActivo,
        carrera: profCarrera.trim(),
        telefono: profTelefono.trim(),
      });
    } else {
      onCrearUsuario({
        id: `prof-${Date.now()}`,
        nombre: profNombre.trim(),
        username: profEmail.split('@')[0] || `prof_${Date.now()}`,
        email: profEmail.trim(),
        rol: 'verificador',
        rut: profRut.trim(),
        password: profPassword.trim(),
        matricula: profCodigo.trim(),
        especialidad: profEspecialidadSupervisada,
        especialidadSupervisada: profEspecialidadSupervisada,
        cursosSupervisados: [profCursoSupervisado as string],
        activo: profActivo,
        carrera: profCarrera.trim(),
        institucion: 'Liceo Industrial',
        telefono: profTelefono.trim(),
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
    }
    setModalProfesorAbierto(false);
  };

  // 3. MODAL TUTOR DE EMPRESA (Maestro Guía)
  const abrirModalTutor = (tutor?: UsuarioApp) => {
    if (tutor) {
      setUsuarioEnEdicion(tutor);
      setTutorNombre(tutor.nombre);
      setTutorRut(tutor.rut || '');
      setTutorEmail(tutor.email);
      setTutorPassword(tutor.password || 'tutor123');
      setTutorCargo(tutor.especialidad || '');
      setTutorEmpresaId(tutor.empresaId || empresas[0]?.id || '');
      setTutorActivo(tutor.activo !== false);
      setTutorTelefono(tutor.telefono || '');
    } else {
      setUsuarioEnEdicion(null);
      setTutorNombre('');
      setTutorRut('');
      setTutorEmail('');
      setTutorPassword('tutor123');
      setTutorCargo('Jefe de Faena / Maestro Guía Laboral');
      setTutorEmpresaId(empresas[0]?.id || '');
      setTutorActivo(true);
      setTutorTelefono('+56 9 ');
    }
    setModalTutorAbierto(true);
  };

  const guardarTutor = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empresas.find((e) => e.id === tutorEmpresaId);
    if (usuarioEnEdicion) {
      onEditarUsuario({
        ...usuarioEnEdicion,
        nombre: tutorNombre.trim(),
        rut: tutorRut.trim(),
        email: tutorEmail.trim(),
        password: tutorPassword.trim(),
        especialidad: tutorCargo.trim(),
        empresaId: tutorEmpresaId,
        empresaNombre: emp?.nombre || '',
        institucion: emp?.nombre || '',
        activo: tutorActivo,
        telefono: tutorTelefono.trim(),
      });
    } else {
      onCrearUsuario({
        id: `tutor-${Date.now()}`,
        nombre: tutorNombre.trim(),
        username: tutorEmail.split('@')[0] || `tutor_${Date.now()}`,
        email: tutorEmail.trim(),
        rol: 'tutor_empresa',
        rut: tutorRut.trim(),
        password: tutorPassword.trim(),
        matricula: `TUT-${Date.now().toString().slice(-4)}`,
        especialidad: tutorCargo.trim(),
        institucion: emp?.nombre || 'Centro de Práctica',
        empresaId: tutorEmpresaId,
        empresaNombre: emp?.nombre || '',
        activo: tutorActivo,
        telefono: tutorTelefono.trim(),
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      });
    }
    setModalTutorAbierto(false);
  };

  // 4. MODAL DIRECTIVO / RECTORÍA
  const abrirModalDirectivo = (dir?: UsuarioApp) => {
    if (dir) {
      setUsuarioEnEdicion(dir);
      setDirNombre(dir.nombre);
      setDirRut(dir.rut || '');
      setDirEmail(dir.email);
      setDirPassword(dir.password || 'directivo123');
      setDirCargo(dir.especialidad || 'Director / Equipo Directivo');
      setDirActivo(dir.activo !== false);
      setDirTelefono(dir.telefono || '');
    } else {
      setUsuarioEnEdicion(null);
      setDirNombre('');
      setDirRut('');
      setDirEmail('');
      setDirPassword('directivo123');
      setDirCargo('Director / Equipo Directivo');
      setDirActivo(true);
      setDirTelefono('+56 9 ');
    }
    setModalDirectivoAbierto(true);
  };

  const guardarDirectivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioEnEdicion) {
      onEditarUsuario({
        ...usuarioEnEdicion,
        nombre: dirNombre.trim(),
        rut: dirRut.trim(),
        email: dirEmail.trim(),
        password: dirPassword.trim(),
        especialidad: dirCargo.trim(),
        activo: dirActivo,
        telefono: dirTelefono.trim(),
      });
    } else {
      onCrearUsuario({
        id: `dir-${Date.now()}`,
        nombre: dirNombre.trim(),
        username: dirEmail.split('@')[0] || `dir_${Date.now()}`,
        email: dirEmail.trim(),
        rol: 'directivo',
        rut: dirRut.trim(),
        password: dirPassword.trim(),
        matricula: `DIR-${Date.now().toString().slice(-4)}`,
        especialidad: dirCargo.trim(),
        institucion: 'Liceo Industrial',
        activo: dirActivo,
        telefono: dirTelefono.trim(),
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      });
    }
    setModalDirectivoAbierto(false);
  };

  // 4. MODAL EMPRESA
  const abrirModalEmpresa = (emp?: EmpresaPractica) => {
    if (emp) {
      setEmpresaEnEdicion(emp);
      setEmpNombre(emp.nombre);
      setEmpRut(emp.rut || emp.rfc || '');
      setEmpGiro(emp.giro || '');
      setEmpSector(emp.sector);
      setEmpDireccion(emp.direccion);
      setEmpComuna(emp.comuna || '');
      setEmpRegion(emp.region || 'Región Metropolitana de Santiago');
      setEmpSupervisor(emp.supervisorNombre);
      setEmpSupervisorCargo(emp.supervisorCargo);
      setEmpSupervisorEmail(emp.supervisorEmail);
      setEmpSupervisorTelefono(emp.supervisorTelefono);
      setEmpConvenio(emp.convenioVigente);
    } else {
      setEmpresaEnEdicion(null);
      setEmpNombre('');
      setEmpRut('');
      setEmpGiro('Servicios electromecánicos, mantenimiento y montajes industriales');
      setEmpSector('Electricidad, Control Industrial & Automatización');
      setEmpDireccion('');
      setEmpComuna('Santiago');
      setEmpRegion('Región Metropolitana de Santiago');
      setEmpSupervisor('');
      setEmpSupervisorCargo('Jefe de Operaciones & Maestro Guía');
      setEmpSupervisorEmail('');
      setEmpSupervisorTelefono('+56 9 ');
      setEmpConvenio(true);
    }
    setModalEmpresaAbierto(true);
  };

  const guardarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (empresaEnEdicion) {
      onEditarEmpresa({
        ...empresaEnEdicion,
        nombre: empNombre.trim(),
        rut: empRut.trim(),
        giro: empGiro.trim(),
        sector: empSector.trim(),
        direccion: empDireccion.trim(),
        comuna: empComuna.trim(),
        region: empRegion.trim(),
        supervisorNombre: empSupervisor.trim(),
        supervisorCargo: empSupervisorCargo.trim(),
        supervisorEmail: empSupervisorEmail.trim(),
        supervisorTelefono: empSupervisorTelefono.trim(),
        convenioVigente: empConvenio,
      });
    } else {
      onCrearEmpresa({
        id: `emp-${Date.now()}`,
        nombre: empNombre.trim(),
        rut: empRut.trim(),
        rfc: empRut.trim(),
        giro: empGiro.trim(),
        sector: empSector.trim(),
        direccion: empDireccion.trim(),
        comuna: empComuna.trim(),
        region: empRegion.trim(),
        supervisorNombre: empSupervisor.trim(),
        supervisorCargo: empSupervisorCargo.trim(),
        supervisorEmail: empSupervisorEmail.trim(),
        supervisorTelefono: empSupervisorTelefono.trim(),
        convenioVigente: empConvenio,
      });
    }
    setModalEmpresaAbierto(false);
  };

  // Filtrados por texto
  const estudiantesFiltrados = estudiantes.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.rut && e.rut.toLowerCase().includes(busqueda.toLowerCase())) ||
      (e.empresaNombre && e.empresaNombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (e.carrera && e.carrera.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const profesoresFiltrados = profesores.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.rut && p.rut.toLowerCase().includes(busqueda.toLowerCase())) ||
      p.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.especialidad && p.especialidad.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const tutoresFiltrados = tutoresEmpresa.filter(
    (t) =>
      t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (t.rut && t.rut.toLowerCase().includes(busqueda.toLowerCase())) ||
      t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (t.empresaNombre && t.empresaNombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const empresasFiltradas = empresas.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.rut && emp.rut.toLowerCase().includes(busqueda.toLowerCase())) ||
      emp.sector.toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.comuna && emp.comuna.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const directivosFiltrados = directivos.filter(
    (dir) =>
      dir.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (dir.rut && dir.rut.toLowerCase().includes(busqueda.toLowerCase())) ||
      dir.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (dir.especialidad && dir.especialidad.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Cabecera del Panel Root */}
      <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1B365D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#E85D04]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold text-[#1B365D]">
                  Panel de Administración Central &bull; Liceo Industrial
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E85D04] text-white font-mono text-[10px] font-bold shadow-xs">
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A5568] mt-0.5">
                Gestión oficial de estudiantes practicantes, docentes supervisores, tutores de faena y convenios
              </p>
            </div>
          </div>

          {/* Buscador global en el panel */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por RUT, nombre o empresa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-xs sm:text-sm text-[#1A202C] placeholder-[#718096] focus:border-[#1B365D] transition-colors"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* NAVEGACIÓN RESPONSIVA: MENÚ HAMBURGUESA EN TELÉFONOS      */}
        {/* ========================================================= */}

        {/* 1. Barra de Módulos para Móvil con Botón Hamburguesa (md:hidden) */}
        <div className="md:hidden mt-4 pt-3 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between gap-2 p-2.5 bg-[#F5F6F8] rounded-xl border border-[#CBD5E0]">
            {/* Módulo Activo Actual */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1B365D] text-white flex items-center justify-center shrink-0 shadow-xs">
                {tabActiva === 'dashboard' && <BarChart3 className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'estudiantes' && <GraduationCap className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'profesores' && <Users className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'tutores' && <Briefcase className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'directivos' && <Shield className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'empresas' && <Building2 className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'estructura' && <Sliders className="w-4 h-4 text-[#E85D04]" />}
                {tabActiva === 'resumen' && <Award className="w-4 h-4 text-[#E85D04]" />}
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[#718096] block leading-none">
                  Módulo Activo
                </span>
                <span className="text-xs font-bold text-[#1B365D] truncate block mt-0.5">
                  {tabActiva === 'dashboard' && 'Gráficas & Métricas'}
                  {tabActiva === 'estudiantes' && `Estudiantes (${estudiantes.length})`}
                  {tabActiva === 'profesores' && `Profesores Guías (${profesores.length})`}
                  {tabActiva === 'tutores' && `Tutores Empresa (${tutoresEmpresa.length})`}
                  {tabActiva === 'directivos' && `Directivos (${directivos.length})`}
                  {tabActiva === 'empresas' && `Centros Práctica (${empresas.length})`}
                  {tabActiva === 'estructura' && 'Estructura MINEDUC'}
                  {tabActiva === 'resumen' && 'Auditoría & Resumen'}
                </span>
              </div>
            </div>

            {/* Botón Hamburguesa para Desplegar Menú de Módulos */}
            <button
              type="button"
              onClick={() => setMenuModulosMovilAbierto(!menuModulosMovilAbierto)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1B365D] hover:bg-[#142A4A] active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              aria-label={menuModulosMovilAbierto ? 'Cerrar menú de módulos' : 'Abrir menú de módulos'}
              aria-expanded={menuModulosMovilAbierto}
            >
              {menuModulosMovilAbierto ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <Menu className="w-4 h-4 text-[#E85D04]" />
              )}
              <span>Módulos</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  menuModulosMovilAbierto ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Accesos rápidos horizontales tipo píldora en móvil */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <button
              onClick={() => setTabActiva('dashboard')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                tabActiva === 'dashboard'
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
              }`}
            >
              Gráficas
            </button>
            <button
              onClick={() => setTabActiva('estudiantes')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                tabActiva === 'estudiantes'
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
              }`}
            >
              Alumnos ({estudiantes.length})
            </button>
            <button
              onClick={() => setTabActiva('profesores')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                tabActiva === 'profesores'
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
              }`}
            >
              Profesores
            </button>
            <button
              onClick={() => setTabActiva('empresas')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                tabActiva === 'empresas'
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
              }`}
            >
              Empresas
            </button>
            <button
              onClick={() => setTabActiva('estructura')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                tabActiva === 'estructura'
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
              }`}
            >
              MINEDUC
            </button>
          </div>
        </div>

        {/* Drawer / Menú Desplegable Hamburguesa Móvil */}
        {menuModulosMovilAbierto && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              onClick={() => setMenuModulosMovilAbierto(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />

            {/* Panel Lateral Drawer */}
            <div className="relative w-[85%] max-w-xs sm:max-w-sm h-full bg-[#1B365D] text-white shadow-2xl flex flex-col z-10 border-l border-[#274875] animate-in slide-in-from-right duration-200">
              {/* Encabezado del Menú */}
              <div className="p-4 border-b border-[#274875] flex items-center justify-between bg-[#142A4A]">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#E85D04]" />
                    Módulos de Gestión TP
                  </h3>
                  <p className="text-[11px] text-[#CBD5E0]">
                    Liceo Industrial &bull; Coordinación
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuModulosMovilAbierto(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Cerrar menú de módulos"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista Completa de Módulos Táctiles */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {/* 1. Dashboard */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('dashboard');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'dashboard'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Gráficas & Métricas</span>
                      <span className="text-[10px] text-white/70 block">Estadísticas macro de avance</span>
                    </div>
                  </div>
                  {tabActiva === 'dashboard' && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* 2. Estudiantes */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('estudiantes');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'estudiantes'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Estudiantes Practicantes</span>
                      <span className="text-[10px] text-white/70 block">Alumnos matriculados en práctica</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {estudiantes.length}
                  </span>
                </button>

                {/* 3. Profesores Guías */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('profesores');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'profesores'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Profesores Guías</span>
                      <span className="text-[10px] text-white/70 block">Docentes supervisores TP</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {profesores.length}
                  </span>
                </button>

                {/* 4. Tutores Empresa */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('tutores');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'tutores'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Tutores Empresa</span>
                      <span className="text-[10px] text-white/70 block">Supervisores en faena laboral</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {tutoresEmpresa.length}
                  </span>
                </button>

                {/* 5. Directivos */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('directivos');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'directivos'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Equipo Directivo</span>
                      <span className="text-[10px] text-white/70 block">Directores y firma ministerial</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {directivos.length}
                  </span>
                </button>

                {/* 6. Centros de Práctica */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('empresas');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'empresas'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Centros de Práctica</span>
                      <span className="text-[10px] text-white/70 block">Empresas con convenios</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {empresas.length}
                  </span>
                </button>

                {/* 7. Estructura & MINEDUC */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('estructura');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'estructura'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Estructura & MINEDUC</span>
                      <span className="text-[10px] text-white/70 block">Parámetros oficiales y horas</span>
                    </div>
                  </div>
                  {tabActiva === 'estructura' && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* 8. Auditoría & Resumen */}
                <button
                  type="button"
                  onClick={() => {
                    setTabActiva('resumen');
                    setMenuModulosMovilAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    tabActiva === 'resumen'
                      ? 'bg-[#E85D04] text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Auditoría & Resumen</span>
                      <span className="text-[10px] text-white/70 block">Reporte final de titulaciones</span>
                    </div>
                  </div>
                  {tabActiva === 'resumen' && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* 9. Centro de Avisos & Notificaciones */}
                {onAbrirNotificaciones && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuModulosMovilAbierto(false);
                      onAbrirNotificaciones();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-[#142A4A] hover:bg-[#10213A] text-white border border-white/15 transition-all cursor-pointer mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#E85D04] shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">Centro de Notificaciones</span>
                        <span className="text-[10px] text-[#CBD5E0] block">Avisos por correo a tutores</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E85D04] text-white font-bold">
                      {cantidadNotificaciones}
                    </span>
                  </button>
                )}
              </div>

              {/* Pie del Drawer Móvil */}
              <div className="p-3 border-t border-[#274875] bg-[#142A4A] text-center text-[10px] text-[#CBD5E0]">
                <span>Liceo Industrial &bull; Módulos Oficiales 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Pestañas de Navegación Clásicas para Escritorio / Pantallas Medianas (hidden md:flex) */}
        <div className="hidden md:flex items-center gap-1.5 mt-5 border-b border-[#E2E8F0] overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setTabActiva('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'dashboard'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#E85D04]" />
            <span>Gráficas & Métricas</span>
          </button>

          <button
            onClick={() => setTabActiva('estudiantes')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'estudiantes'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#E85D04]" />
            <span>Estudiantes ({estudiantes.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('profesores')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'profesores'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <Users className="w-4 h-4 text-[#E85D04]" />
            <span>Profesores Guías ({profesores.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('tutores')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'tutores'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#E85D04]" />
            <span>Tutores Empresa ({tutoresEmpresa.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('directivos')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'directivos'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#E85D04]" />
            <span>Directivos ({directivos.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('empresas')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'empresas'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#E85D04]" />
            <span>Centros de Práctica ({empresas.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('estructura')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'estructura'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#E85D04]" />
            <span>Estructura & MINEDUC</span>
          </button>

          <button
            onClick={() => setTabActiva('resumen')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer ${
              tabActiva === 'resumen'
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8]'
            }`}
          >
            <Award className="w-4 h-4 text-[#E85D04]" />
            <span>Auditoría & Resumen</span>
          </button>

          {onAbrirNotificaciones && (
            <button
              type="button"
              onClick={onAbrirNotificaciones}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all font-bold whitespace-nowrap cursor-pointer text-[#1B365D] hover:bg-[#F5F6F8] ml-auto"
              title="Abrir el Centro de Notificaciones por Email a Profesores y Tutores"
            >
              <Mail className="w-4 h-4 text-[#E85D04]" />
              <span>Avisos ({cantidadNotificaciones})</span>
            </button>
          )}
        </div>
      </div>

      {/* 0. PESTAÑA: PANEL DE CONTROL CON GRÁFICAS */}
      {tabActiva === 'dashboard' && (
        <AdminChartsDashboard
          usuarios={usuarios}
          empresas={empresas}
          entradas={entradas}
        />
      )}

      {/* 1. PESTAÑA: ESTUDIANTES */}
      {tabActiva === 'estudiantes' && (
        <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                Nómina Oficial de Estudiantes Practicantes
              </h2>
              <p className="text-xs text-[#4A5568]">
                Cómputo de horas cronológicas, centros de práctica asignados y vinculación de tutores
              </p>
            </div>
            <button
              onClick={() => abrirModalEstudiante()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl shadow-md shadow-[#E85D04]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Practicante</span>
            </button>
          </div>

          {/* Vista Móvil: Tarjetas Táctiles y Limpias */}
          <div className="md:hidden space-y-3">
            {estudiantesFiltrados.length === 0 ? (
              <div className="p-6 text-center text-[#4A5568] italic bg-[#F5F6F8] rounded-xl border border-[#CBD5E0]">
                No se encontraron estudiantes registrados con los criterios seleccionados.
              </div>
            ) : (
              estudiantesFiltrados.map((alumno) => {
                const horasAprobadas = calcularHorasEstudiante(alumno.id, alumno.email, alumno.rut);
                const meta = alumno.horasRequeridas || 360;
                const pct = Math.min(100, Math.round((horasAprobadas / meta) * 100));

                return (
                  <div
                    key={alumno.id}
                    className="bg-white border border-[#CBD5E0] rounded-xl p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#1A202C] text-sm">{alumno.nombre}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-mono mt-0.5">
                          <span className="text-[#E85D04] font-bold">RUT: {alumno.rut || 'Sin RUT'}</span>
                          <span className="text-[#CBD5E0]">&bull;</span>
                          <span className="text-[#718096]">{alumno.matricula}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#1B365D]/10 text-[#1B365D] font-mono text-xs font-bold shrink-0">
                        {pct}%
                      </span>
                    </div>

                    <div className="text-xs text-[#4A5568] space-y-1 bg-[#F5F6F8] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <div>
                        <strong className="text-[#1B365D]">Empresa:</strong>{' '}
                        {alumno.empresaNombre || 'Sin asignar'}
                      </div>
                      <div>
                        <strong className="text-[#1B365D]">Especialidad:</strong>{' '}
                        {alumno.especialidad || alumno.carrera}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#CBD5E0]">
                        <span>Tutor: {alumno.tutorNombre || 'Por asignar'}</span>
                        <span>Docente: {alumno.profesorNombre || 'Por asignar'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#4A5568]">Horas Validadas:</span>
                        <strong className="text-[#137333] font-bold">
                          {horasAprobadas} / {meta} hrs
                        </strong>
                      </div>
                      <div className="w-full bg-[#F5F6F8] h-2 rounded-full overflow-hidden border border-[#CBD5E0]">
                        <div
                          className="bg-[#137333] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => {
                          const emp = empresas.find(
                            (e) => e.id === alumno.empresaId || e.nombre === alumno.empresaNombre
                          );
                          const prof = usuarios.find(
                            (u) =>
                              u.rol === 'verificador' &&
                              (u.id === alumno.profesorId || u.nombre === alumno.profesorNombre)
                          );
                          const tut = usuarios.find(
                            (u) =>
                              u.rol === 'tutor_empresa' &&
                              (u.id === alumno.tutorId || u.nombre === alumno.tutorNombre)
                          );
                          generarReportePDFBitacora({
                            alumno,
                            entradas,
                            empresa: emp,
                            profesor: prof,
                            tutor: tut,
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#1B365D] bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] cursor-pointer min-h-[38px]"
                        title="Descargar Reporte PDF del Libro Oficial"
                      >
                        <FileDown className="w-4 h-4 text-[#E85D04]" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => abrirModalEstudiante(alumno)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#4A5568] hover:text-[#1B365D] bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] cursor-pointer min-h-[38px]"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => onEliminarUsuario(alumno.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#C5221F] bg-[#FCE8E6] hover:bg-[#FAD2CF] border border-[#FAD2CF] cursor-pointer min-h-[38px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Vista Tablet / Escritorio: Tabla Completa */}
          <div className="hidden md:block overflow-x-auto border border-[#CBD5E0] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] border-b border-[#CBD5E0] text-[#1B365D] font-bold">
                <tr>
                  <th className="p-3">Estudiante / RUT</th>
                  <th className="p-3">Carrera & Especialidad</th>
                  <th className="p-3">Centro de Práctica (Empresa)</th>
                  <th className="p-3">Maestro Guía & Docente</th>
                  <th className="p-3 text-center">Horas Exigidas / Acreditadas</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1A202C]">
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#4A5568] italic">
                      No se encontraron estudiantes registrados con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((alumno) => {
                    const horasAprobadas = calcularHorasEstudiante(alumno.id, alumno.email, alumno.rut);
                    const meta = alumno.horasRequeridas || 360;
                    const pct = Math.min(100, Math.round((horasAprobadas / meta) * 100));

                    return (
                      <tr key={alumno.id} className="hover:bg-[#F5F6F8] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-[#1A202C]">{alumno.nombre}</div>
                          <div className="flex items-center gap-2 font-mono text-xs text-[#4A5568]">
                            <span className="text-[#E85D04] font-bold">{alumno.rut || 'Sin RUT'}</span>
                            <span>&bull;</span>
                            <span>{alumno.matricula}</span>
                          </div>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-semibold text-[#1A202C] line-clamp-1">{alumno.carrera}</div>
                          <div className="text-[11px] text-[#4A5568] line-clamp-1">{alumno.especialidad}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-[#1B365D]">{alumno.empresaNombre || 'Sin asignar'}</div>
                          <div className="text-[11px] text-[#4A5568]">
                            {alumno.fechaInicio} al {alumno.fechaFinEstimada || 'Vigente'}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-[#4A5568]">
                          <div><span className="font-semibold text-[#1B365D]">Tutor:</span> {alumno.tutorNombre || 'Por asignar'}</div>
                          <div><span className="font-semibold text-[#1B365D]">Docente:</span> {alumno.profesorNombre || 'Por asignar'}</div>
                        </td>
                        <td className="p-3 text-center font-mono">
                          <div className="font-black text-sm text-[#137333]">
                            {horasAprobadas} / {meta} hrs
                          </div>
                          <div className="w-24 bg-[#F5F6F8] h-2 rounded-full overflow-hidden mx-auto mt-1 border border-[#CBD5E0]">
                            <div className="bg-[#137333] h-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] text-[#4A5568] font-bold">{pct}% completado</span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const emp = empresas.find(
                                  (e) => e.id === alumno.empresaId || e.nombre === alumno.empresaNombre
                                );
                                const prof = usuarios.find(
                                  (u) =>
                                    u.rol === 'verificador' &&
                                    (u.id === alumno.profesorId || u.nombre === alumno.profesorNombre)
                                );
                                const tut = usuarios.find(
                                  (u) =>
                                    u.rol === 'tutor_empresa' &&
                                    (u.id === alumno.tutorId || u.nombre === alumno.tutorNombre)
                                );
                                generarReportePDFBitacora({
                                  alumno,
                                  entradas,
                                  empresa: emp,
                                  profesor: prof,
                                  tutor: tut,
                                });
                              }}
                              className="p-2 rounded-lg text-[#1B365D] hover:text-[#E85D04] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
                              title="Descargar Reporte PDF del Libro Oficial de este alumno"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => abrirModalEstudiante(alumno)}
                              className="p-2 rounded-lg text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
                              title="Editar datos del estudiante"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEliminarUsuario(alumno.id)}
                              className="p-2 rounded-lg text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] transition-colors cursor-pointer"
                              title="Eliminar estudiante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PESTAÑA: PROFESORES GUÍAS */}
      {tabActiva === 'profesores' && (
        <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                Cuerpo Docente &bull; Supervisores Académicos de Práctica
              </h2>
              <p className="text-xs text-[#4A5568]">
                Docentes facultados para validar competencias, dictaminar bitácoras y acreditar horas curriculares
              </p>
            </div>
            <button
              onClick={() => abrirModalProfesor()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl shadow-md shadow-[#E85D04]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Profesor Guía</span>
            </button>
          </div>

          {/* Vista Móvil: Tarjetas para Profesores */}
          <div className="md:hidden space-y-3">
            {profesoresFiltrados.length === 0 ? (
              <div className="p-6 text-center text-[#4A5568] italic bg-[#F5F6F8] rounded-xl border border-[#CBD5E0]">
                No se encontraron profesores guías registrados.
              </div>
            ) : (
              profesoresFiltrados.map((prof) => {
                const alumnosAsignados = estudiantes.filter((a) => a.profesorId === prof.id);

                return (
                  <div
                    key={prof.id}
                    className="bg-white border border-[#CBD5E0] rounded-xl p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#1A202C] text-sm">{prof.nombre}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-mono mt-0.5">
                          <span className="text-[#E85D04] font-bold">RUT: {prof.rut || 'Pendiente'}</span>
                          <span className="text-[#CBD5E0]">&bull;</span>
                          <span className="text-[#718096]">{prof.matricula}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#137333]/10 text-[#137333] font-mono text-xs font-bold shrink-0">
                        {alumnosAsignados.length} alumnos
                      </span>
                    </div>

                    <div className="text-xs text-[#4A5568] space-y-1 bg-[#F5F6F8] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <div>
                        <strong className="text-[#1B365D]">Especialidad:</strong>{' '}
                        {prof.carrera || 'Electricidad y Automatización'}
                      </div>
                      <div className="text-[11px] text-[#718096]">{prof.especialidad}</div>
                      <div className="pt-1 border-t border-[#CBD5E0] flex items-center justify-between text-[11px]">
                        <span>{prof.email}</span>
                        <span>{prof.telefono || ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => abrirModalProfesor(prof)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#4A5568] hover:text-[#1B365D] bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] cursor-pointer min-h-[38px]"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => onEliminarUsuario(prof.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#C5221F] bg-[#FCE8E6] hover:bg-[#FAD2CF] border border-[#FAD2CF] cursor-pointer min-h-[38px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="hidden md:block overflow-x-auto border border-[#CBD5E0] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] border-b border-[#CBD5E0] text-[#1B365D] font-bold">
                <tr>
                  <th className="p-3">Docente / RUT</th>
                  <th className="p-3">Carrera Asignada & Especialidad</th>
                  <th className="p-3">Contacto Oficial</th>
                  <th className="p-3 text-center">Practicantes Supervisados</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1A202C]">
                {profesoresFiltrados.map((prof) => {
                  const alumnosAsignados = estudiantes.filter((a) => a.profesorId === prof.id);

                  return (
                    <tr key={prof.id} className="hover:bg-[#F5F6F8] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-[#1A202C]">{prof.nombre}</div>
                        <div className="font-mono text-xs text-[#E85D04] font-semibold">
                          RUT: {prof.rut || 'Pendiente'} &bull; {prof.matricula}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#1B365D]">{prof.carrera || 'Electricidad y Automatización'}</div>
                        <div className="text-[11px] text-[#4A5568]">{prof.especialidad}</div>
                      </td>
                      <td className="p-3 text-xs">
                        <div className="font-semibold text-[#1A202C]">{prof.email}</div>
                        <div className="text-[#4A5568]">{prof.telefono || '+56 9 ...'}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#137333]">
                        {alumnosAsignados.length} alumnos
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => abrirModalProfesor(prof)}
                            className="p-2 rounded-lg text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEliminarUsuario(prof.id)}
                            className="p-2 rounded-lg text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: TUTORES DE EMPRESA (Maestros Guía) */}
      {tabActiva === 'tutores' && (
        <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                Tutores de Empresa &bull; Maestros Guía Laborales
              </h2>
              <p className="text-xs text-[#4A5568]">
                Profesionales en faena facultados para otorgar el Visto Bueno (V°B°) a la asistencia y tareas
              </p>
            </div>
            <button
              onClick={() => abrirModalTutor()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl shadow-md shadow-[#E85D04]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Maestro Guía</span>
            </button>
          </div>

          {/* Vista Móvil: Tarjetas para Tutores */}
          <div className="md:hidden space-y-3">
            {tutoresFiltrados.length === 0 ? (
              <div className="p-6 text-center text-[#4A5568] italic bg-[#F5F6F8] rounded-xl border border-[#CBD5E0]">
                No se encontraron tutores de empresa registrados.
              </div>
            ) : (
              tutoresFiltrados.map((tutor) => {
                const alumnosTutelados = estudiantes.filter(
                  (a) => a.tutorId === tutor.id || a.tutorNombre === tutor.nombre
                );

                return (
                  <div
                    key={tutor.id}
                    className="bg-white border border-[#CBD5E0] rounded-xl p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#1A202C] text-sm">{tutor.nombre}</h3>
                        <div className="font-mono text-xs text-[#E85D04] font-semibold mt-0.5">
                          RUT: {tutor.rut || 'Pendiente'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#E85D04]/10 text-[#E85D04] font-mono text-xs font-bold shrink-0">
                        {alumnosTutelados.length} alumnos
                      </span>
                    </div>

                    <div className="text-xs text-[#4A5568] space-y-1 bg-[#F5F6F8] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <div>
                        <strong className="text-[#1B365D]">Empresa:</strong>{' '}
                        {tutor.empresaNombre || tutor.institucion || 'Empresa Colaboradora'}
                      </div>
                      <div className="text-[11px] text-[#718096]">{tutor.especialidad}</div>
                      <div className="pt-1 border-t border-[#CBD5E0] flex items-center justify-between text-[11px]">
                        <span>{tutor.email}</span>
                        <span>{tutor.telefono || ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => abrirModalTutor(tutor)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#4A5568] hover:text-[#1B365D] bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] cursor-pointer min-h-[38px]"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => onEliminarUsuario(tutor.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-[#C5221F] bg-[#FCE8E6] hover:bg-[#FAD2CF] border border-[#FAD2CF] cursor-pointer min-h-[38px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="hidden md:block overflow-x-auto border border-[#CBD5E0] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] border-b border-[#CBD5E0] text-[#1B365D] font-bold">
                <tr>
                  <th className="p-3">Tutor Laboral / RUT</th>
                  <th className="p-3">Empresa & Cargo</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-center">Practicantes Asignados</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1A202C]">
                {tutoresFiltrados.map((tutor) => {
                  const alumnosTutelados = estudiantes.filter(
                    (a) => a.tutorId === tutor.id || a.tutorNombre === tutor.nombre
                  );

                  return (
                    <tr key={tutor.id} className="hover:bg-[#F5F6F8] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-[#1A202C]">{tutor.nombre}</div>
                        <div className="font-mono text-xs text-[#E85D04] font-semibold">
                          RUT: {tutor.rut || 'Pendiente'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#1B365D]">
                          {tutor.empresaNombre || tutor.institucion || 'Empresa Colaboradora'}
                        </div>
                        <div className="text-[11px] text-[#4A5568]">{tutor.especialidad}</div>
                      </td>
                      <td className="p-3 text-xs">
                        <div className="font-semibold text-[#1A202C]">{tutor.email}</div>
                        <div className="text-[#4A5568]">{tutor.telefono || '+56 9 ...'}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#E85D04]">
                        {alumnosTutelados.length} practicantes
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => abrirModalTutor(tutor)}
                            className="p-2 rounded-lg text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEliminarUsuario(tutor.id)}
                            className="p-2 rounded-lg text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: EMPRESAS */}
      {tabActiva === 'empresas' && (
        <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                Centros de Práctica &bull; Empresas en Convenio
              </h2>
              <p className="text-xs text-[#4A5568]">
                Empresas con convenio formal para recepción y acreditación de prácticas del Liceo Industrial
              </p>
            </div>
            <button
              onClick={() => abrirModalEmpresa()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl shadow-md shadow-[#E85D04]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Centro de Práctica</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresasFiltradas.map((emp) => {
              const practicantes = estudiantes.filter((a) => a.empresaId === emp.id);

              return (
                <div
                  key={emp.id}
                  className="bg-white border border-[#CBD5E0] hover:border-[#1B365D] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#E85D04] font-bold">
                        RUT: {emp.rut || '76.840.120-4'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] text-xs font-bold border border-[#CEEAD6]">
                        Convenio Vigente
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1B365D] text-base leading-snug">{emp.nombre}</h3>
                    <p className="text-xs text-[#4A5568] line-clamp-2">{emp.sector}</p>
                    <div className="text-xs text-[#4A5568] flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#E85D04] shrink-0" />
                      <span>
                        {emp.direccion ? `${emp.direccion}, ` : ''}
                        {emp.comuna || 'Santiago'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5 text-xs text-[#4A5568]">
                    <div className="flex items-center justify-between">
                      <span>Supervisor: <strong className="text-[#1A202C]">{emp.supervisorNombre}</strong></span>
                      <span className="font-bold text-[#1B365D] bg-[#F5F6F8] px-2 py-0.5 rounded">
                        {practicantes.length} alumnos
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#718096]">{emp.supervisorEmail}</div>
                    <div className="flex items-center justify-end gap-1 pt-2">
                      <button
                        onClick={() => abrirModalEmpresa(emp)}
                        className="p-2 rounded-lg text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminarEmpresa(emp.id)}
                        className="p-2 rounded-lg text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PESTAÑA: DIRECTIVOS (Rol Ejecutivo / Auditor) */}
      {tabActiva === 'directivos' && (
        <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                  Equipo Directivo &bull; Rectoría y UTP
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-mono text-xs font-bold">
                  ROL 5: DIRECTIVO
                </span>
              </div>
              <p className="text-xs text-[#4A5568]">
                Directivos con acceso al panel macro ("Vista de Pájaro") y firma digital de actas de titulación
              </p>
            </div>
            <button
              onClick={() => abrirModalDirectivo()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-md shadow-[#7C3AED]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Directivo</span>
            </button>
          </div>

          {/* Vista Móvil: Tarjetas Directivos */}
          <div className="md:hidden space-y-3">
            {directivosFiltrados.length === 0 ? (
              <div className="p-6 text-center text-[#4A5568] italic bg-[#F5F6F8] rounded-xl border border-[#CBD5E0]">
                No se encontraron directivos registrados.
              </div>
            ) : (
              directivosFiltrados.map((dir) => (
                <div
                  key={dir.id}
                  className="bg-white border border-[#CBD5E0] rounded-xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#1A202C] text-sm">{dir.nombre}</h3>
                      <div className="font-mono text-xs text-[#7C3AED] font-semibold mt-0.5">
                        RUT: {dir.rut || 'Pendiente'} &bull; {dir.matricula}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      dir.activo !== false
                        ? 'bg-[#E6F4EA] text-[#137333]'
                        : 'bg-[#FCE8E6] text-[#C5221F]'
                    }`}>
                      {dir.activo !== false ? 'Activo' : 'Deshabilitado'}
                    </span>
                  </div>

                  <div className="text-xs text-[#4A5568] space-y-1 bg-[#F5F6F8] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <div>
                      <strong className="text-[#1B365D]">Cargo:</strong> {dir.especialidad || 'Director Institucional'}
                    </div>
                    <div className="pt-1 border-t border-[#CBD5E0] flex items-center justify-between text-[11px]">
                      <span>{dir.email}</span>
                      <span>{dir.telefono || ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                    <button
                      onClick={() => toggleEstadoUsuario(dir)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                        dir.activo !== false
                          ? 'text-[#C5221F] bg-[#FCE8E6] hover:bg-[#FAD2CF]'
                          : 'text-[#137333] bg-[#E6F4EA] hover:bg-[#CEEAD6]'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{dir.activo !== false ? 'Deshabilitar' : 'Habilitar'}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirModalDirectivo(dir)}
                        className="p-2 rounded-lg text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminarUsuario(dir.id)}
                        className="p-2 rounded-lg text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Vista Escritorio: Tabla Directivos */}
          <div className="hidden md:block overflow-x-auto border border-[#CBD5E0] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] border-b border-[#CBD5E0] text-[#1B365D] font-bold">
                <tr>
                  <th className="p-3">Directivo / RUT</th>
                  <th className="p-3">Cargo Institucional</th>
                  <th className="p-3">Contacto Oficial</th>
                  <th className="p-3 text-center">Estado Cuenta</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1A202C]">
                {directivosFiltrados.map((dir) => (
                  <tr key={dir.id} className="hover:bg-[#F5F6F8] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-[#1A202C]">{dir.nombre}</div>
                      <div className="font-mono text-xs text-[#7C3AED] font-semibold">
                        RUT: {dir.rut || 'Pendiente'} &bull; {dir.matricula}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[#1B365D]">{dir.especialidad || 'Director / Equipo Directivo'}</div>
                      <div className="text-[11px] text-[#4A5568]">Liceo Industrial &bull; RBL</div>
                    </td>
                    <td className="p-3 text-xs">
                      <div className="font-semibold text-[#1A202C]">{dir.email}</div>
                      <div className="text-[#4A5568]">{dir.telefono || '+56 9 ...'}</div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleEstadoUsuario(dir)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          dir.activo !== false
                            ? 'bg-[#E6F4EA] text-[#137333] hover:bg-[#CEEAD6]'
                            : 'bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF]'
                        }`}
                        title="Click para habilitar o deshabilitar cuenta"
                      >
                        <Power className="w-3 h-3" />
                        <span>{dir.activo !== false ? 'Activa' : 'Deshabilitada'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirModalDirectivo(dir)}
                          className="p-2 rounded-lg text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEliminarUsuario(dir.id)}
                          className="p-2 rounded-lg text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PESTAÑA: ESTRUCTURA CURRICULAR & MINEDUC (Rol 1: Administrador General / Coordinador TP) */}
      {tabActiva === 'estructura' && (
        <div className="space-y-5">
          {/* Card 1: Parámetros Oficiales MINEDUC */}
          <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-xl bg-[#E85D04]/15 flex items-center justify-center text-[#E85D04]">
                <Sliders className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                  Configuración de Parámetros de Práctica &bull; MINEDUC
                </h2>
                <p className="text-xs text-[#4A5568]">
                  Definición reglamentaria de horas obligatorias de titulación y calendario lectivo institucional
                </p>
              </div>
            </div>

            <form onSubmit={guardarParametrosMineduc} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Meta de Horas MINEDUC */}
                <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] space-y-2">
                  <label className="block text-xs font-bold text-[#1B365D] uppercase tracking-wide">
                    Total Horas Requeridas MINEDUC
                  </label>
                  <p className="text-[11px] text-[#718096]">
                    Normativa oficial según Decreto Técnico Profesional
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {HORAS_MINEDUC_OPCIONES.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHorasMineducParam(h)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          horasMineducParam === h
                            ? 'bg-[#E85D04] text-white shadow-md shadow-[#E85D04]/25'
                            : 'bg-white text-[#4A5568] border border-[#CBD5E0] hover:border-[#1B365D]'
                        }`}
                      >
                        {h} Horas
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-[#4A5568] mt-1 italic">
                    {horasMineducParam === 180
                      ? 'Decreto 180 hrs: Régimen abreviado de titulación técnica.'
                      : horasMineducParam === 360
                      ? 'Decreto 360 hrs: Práctica profesional estándar completa.'
                      : 'Decreto 450 hrs: Régimen dual intensivo con alternancia.'}
                  </div>
                </div>

                {/* Año Lectivo */}
                <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] space-y-2">
                  <label className="block text-xs font-bold text-[#1B365D] uppercase tracking-wide">
                    Año Lectivo de Prácticas
                  </label>
                  <p className="text-[11px] text-[#718096]">
                    Período escolar de egreso y titulación
                  </p>
                  <input
                    type="number"
                    min={2024}
                    max={2030}
                    value={anoLectivo}
                    onChange={(e) => setAnoLectivo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E0] rounded-xl text-sm font-bold text-[#1B365D] focus:border-[#E85D04]"
                  />
                  <div className="text-[11px] text-[#137333] font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cohorte oficial activa</span>
                  </div>
                </div>

                {/* Período Activo */}
                <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] space-y-2">
                  <label className="block text-xs font-bold text-[#1B365D] uppercase tracking-wide">
                    Estado del Proceso de Práctica
                  </label>
                  <p className="text-[11px] text-[#718096]">
                    Habilita o pausa el registro de nuevas bitácoras
                  </p>
                  <button
                    type="button"
                    onClick={() => setPeriodoActivo(!periodoActivo)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      periodoActivo
                        ? 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                        : 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{periodoActivo ? 'Período Oficial HABILITADO' : 'Período Oficial PAUSADO'}</span>
                  </button>
                  <div className="text-[11px] text-[#718096]">
                    {periodoActivo ? 'Alumnos pueden declarar y registrar jornadas.' : 'Portal en modo auditoría/lectura.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {guardadoConfigExito && (
                  <span className="text-xs font-bold text-[#137333] bg-[#E6F4EA] px-3 py-1.5 rounded-xl border border-[#CEEAD6] flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Parámetros guardados y sincronizados correctamente</span>
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white font-bold text-xs rounded-xl shadow-md shadow-[#E85D04]/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Guardar Parámetros MINEDUC</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Las 3 Especialidades Técnicas Oficiales */}
          <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#1B365D]">
                    Especialidades Técnicas del Liceo Industrial
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#1B365D] text-white font-mono text-[10px] font-bold">
                    3 ESPECIALIDADES
                  </span>
                </div>
                <p className="text-xs text-[#4A5568]">
                  Estructura curricular de especialidades técnicas profesionales aprobadas por el MINEDUC
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ESPECIALIDADES_OFICIALES.map((esp) => {
                const alumnosEsp = estudiantes.filter((e) => e.especialidad === esp);
                const profsEsp = profesores.filter(
                  (p) => p.especialidad === esp || p.especialidadSupervisada === esp
                );
                const horasTotales = alumnosEsp.reduce((acc, a) => acc + (a.horasAcumuladas || 0), 0);

                const getIconColor = () => {
                  if (esp === 'Electricidad') return 'from-[#E85D04] to-[#C05621]';
                  if (esp === 'Electrónica') return 'from-[#1B365D] to-[#2B6CB0]';
                  return 'from-[#7C3AED] to-[#4C1D95]';
                };

                return (
                  <div
                    key={esp}
                    className="border border-[#CBD5E0] rounded-2xl p-4 sm:p-5 bg-[#F5F6F8] flex flex-col justify-between space-y-3 hover:border-[#1B365D] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-white font-bold text-xs bg-gradient-to-r ${getIconColor()}`}>
                          {esp}
                        </span>
                        <span className="text-[11px] font-bold text-[#137333] bg-[#E6F4EA] px-2 py-0.5 rounded-full border border-[#CEEAD6]">
                          Vigente MINEDUC
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1B365D] leading-tight">
                        Técnico de Nivel Medio en {esp}
                      </h4>
                      <p className="text-xs text-[#4A5568] mt-1">
                        {esp === 'Electricidad'
                          ? 'Instalaciones eléctricas industriales, tableros de fuerza, normativa SEC y mantenimiento.'
                          : esp === 'Electrónica'
                          ? 'Circuitos de potencia, microcontroladores, automatización de plantas y sensores industriales.'
                          : 'Conectividad de redes, cableado estructurado, fibra óptica, enlaces de microondas y conmutación.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#CBD5E0] text-xs space-y-1.5 text-[#4A5568]">
                      <div className="flex justify-between">
                        <span>Alumnos inscritos:</span>
                        <strong className="text-[#1B365D]">{alumnosEsp.length} estudiantes</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Docentes supervisores:</span>
                        <strong className="text-[#1B365D]">{profsEsp.length} asignados</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas acumuladas:</span>
                        <strong className="text-[#E85D04] font-mono">{horasTotales} hrs</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Estructura de Cursos */}
          <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1B365D]">
                  Cursos &bull; Nivel 4° Medio
                </h3>
                <p className="text-xs text-[#4A5568]">
                  Estructuración de alumnos por Curso y Especialidad para asignación de Docentes Tutores
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CURSOS_OFICIALES.map((curso) => {
                const alumnosCurso = estudiantes.filter((e) => e.curso === curso);
                const espSugerida =
                  curso === '4° Medio A'
                    ? 'Electricidad'
                    : curso === '4° Medio B'
                    ? 'Electrónica'
                    : 'Telecomunicaciones';
                const profesorAsignado = profesores.find((p) =>
                  p.cursosSupervisados?.includes(curso) || p.especialidadSupervisada === espSugerida
                );

                return (
                  <div
                    key={curso}
                    className="p-4 rounded-xl border border-[#CBD5E0] bg-white space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1B365D]">{curso}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1B365D]/10 text-[#1B365D]">
                        {alumnosCurso.length} alumnos
                      </span>
                    </div>

                    <div className="text-xs text-[#4A5568] space-y-1 bg-[#F5F6F8] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <div>
                        <strong>Especialidad:</strong> <span className="text-[#E85D04] font-semibold">{espSugerida}</span>
                      </div>
                      <div>
                        <strong>Profesor Guía:</strong>{' '}
                        <span>{profesorAsignado ? profesorAsignado.nombre : 'Por asignar'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. PESTAÑA: RESUMEN Y AUDITORÍA */}
      {tabActiva === 'resumen' && (
        <AdminChartsDashboard
          usuarios={usuarios}
          empresas={empresas}
          entradas={entradas}
        />
      )}

      {/* MODAL EDITAR/CREAR ESTUDIANTE */}
      {modalEstudianteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-[#CBD5E0] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94dvh] sm:max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F5F6F8] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[#1B365D] text-base">
                {usuarioEnEdicion ? 'Editar Estudiante Practicante' : 'Registrar Nuevo Estudiante Practicante'}
              </h3>
              <button
                onClick={() => setModalEstudianteAbierto(false)}
                className="text-[#718096] hover:text-[#1A202C] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEstudiante} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain flex-1 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Nombre Completo <span className="text-[#C5221F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={estNombre}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstNombre(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Silva"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E85D04] uppercase mb-1">
                    RUT Chileno <span className="text-[#C5221F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={estRut}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstRut(e.target.value)}
                    placeholder="Ej. 20.481.932-5"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#E85D04] font-mono font-bold text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={estEmail}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstEmail(e.target.value)}
                    placeholder="carlos.mendoza@liceorbl.cl"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Contraseña
                  </label>
                  <input
                    type="text"
                    required
                    value={estPassword}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Teléfono (+56 9...)
                  </label>
                  <input
                    type="text"
                    value={estTelefono}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstTelefono(e.target.value)}
                    placeholder="+56 9 4312 9901"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Especialidad Técnica
                  </label>
                  <input
                    type="text"
                    required
                    value={estCarrera}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstCarrera(e.target.value)}
                    placeholder="Técnico en Electricidad"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Horas de Práctica Requeridas
                  </label>
                  <input
                    type="number"
                    required
                    value={estHorasReq}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEstHorasReq(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#137333] font-mono font-bold text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              {/* Vinculaciones institucionales */}
              <div className="p-4 bg-[#F5F6F8] rounded-xl border border-[#CBD5E0] space-y-3">
                <span className="text-xs font-bold text-[#1B365D] uppercase block">
                  Asignación de Centro de Práctica, Tutor y Profesor
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">Empresa</label>
                    <select
                      value={estEmpresaId}
                      onFocus={handleInputFocusScroll}
                      onChange={(e) => setEstEmpresaId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                    >
                      {empresas.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">Maestro Guía</label>
                    <select
                      value={estTutorId}
                      onFocus={handleInputFocusScroll}
                      onChange={(e) => setEstTutorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                    >
                      {tutoresEmpresa.map((tut) => (
                        <option key={tut.id} value={tut.id}>
                          {tut.nombre} ({tut.empresaNombre || 'Empresa'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">Profesor Guía</label>
                    <select
                      value={estProfesorId}
                      onFocus={handleInputFocusScroll}
                      onChange={(e) => setEstProfesorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                    >
                      {profesores.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalEstudianteAbierto(false)}
                  className="px-4 py-2.5 bg-[#F5F6F8] hover:bg-[#E2E8F0] text-[#4A5568] rounded-xl font-bold cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white rounded-xl font-bold cursor-pointer shadow-md min-h-[44px]"
                >
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR/CREAR PROFESOR GUÍA */}
      {modalProfesorAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-[#CBD5E0] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94dvh] sm:max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F5F6F8] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[#1B365D] text-base">
                {usuarioEnEdicion ? 'Editar Profesor Guía' : 'Registrar Profesor Guía'}
              </h3>
              <button
                onClick={() => setModalProfesorAbierto(false)}
                className="text-[#718096] hover:text-[#1A202C] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarProfesor} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain flex-1 pb-5">
              <div>
                <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={profNombre}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setProfNombre(e.target.value)}
                  placeholder="Prof. Roberto Morales"
                  className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#E85D04] uppercase mb-1">
                    RUT Chileno
                  </label>
                  <input
                    type="text"
                    required
                    value={profRut}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setProfRut(e.target.value)}
                    placeholder="12.845.670-3"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#E85D04] font-mono font-bold text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Código / Matrícula
                  </label>
                  <input
                    type="text"
                    value={profCodigo}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setProfCodigo(e.target.value)}
                    placeholder="DOC-GUI-01"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={profEmail}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setProfEmail(e.target.value)}
                    placeholder="profesor@liceorbl.cl"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Contraseña
                  </label>
                  <input
                    type="text"
                    required
                    value={profPassword}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setProfPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                  Especialidad / Área Asignada
                </label>
                <input
                  type="text"
                  value={profDepto}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setProfDepto(e.target.value)}
                  placeholder="Supervisor Académico de Prácticas Profesionales"
                  className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalProfesorAbierto(false)}
                  className="px-4 py-2.5 bg-[#F5F6F8] hover:bg-[#E2E8F0] text-[#4A5568] rounded-xl font-bold cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white rounded-xl font-bold cursor-pointer shadow-md min-h-[44px]"
                >
                  Guardar Profesor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR/CREAR TUTOR DE EMPRESA */}
      {modalTutorAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-[#CBD5E0] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94dvh] sm:max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F5F6F8] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[#1B365D] text-base">
                {usuarioEnEdicion ? 'Editar Maestro Guía' : 'Registrar Maestro Guía de Empresa'}
              </h3>
              <button
                onClick={() => setModalTutorAbierto(false)}
                className="text-[#718096] hover:text-[#1A202C] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarTutor} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain flex-1 pb-5">
              <div>
                <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                  Nombre Completo del Tutor
                </label>
                <input
                  type="text"
                  required
                  value={tutorNombre}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setTutorNombre(e.target.value)}
                  placeholder="Ing. Fernando Castro"
                  className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#E85D04] uppercase mb-1">
                    RUT Chileno
                  </label>
                  <input
                    type="text"
                    required
                    value={tutorRut}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setTutorRut(e.target.value)}
                    placeholder="14.230.540-8"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#E85D04] font-mono font-bold text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Empresa Vinculada
                  </label>
                  <select
                    value={tutorEmpresaId}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setTutorEmpresaId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={tutorEmail}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setTutorEmail(e.target.value)}
                    placeholder="fcastro@techlogix.cl"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Contraseña
                  </label>
                  <input
                    type="text"
                    required
                    value={tutorPassword}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setTutorPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                  Cargo en la Empresa
                </label>
                <input
                  type="text"
                  value={tutorCargo}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setTutorCargo(e.target.value)}
                  placeholder="Jefe de Faena / Maestro Guía Laboral"
                  className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalTutorAbierto(false)}
                  className="px-4 py-2.5 bg-[#F5F6F8] hover:bg-[#E2E8F0] text-[#4A5568] rounded-xl font-bold cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white rounded-xl font-bold cursor-pointer shadow-md min-h-[44px]"
                >
                  Guardar Maestro Guía
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR/CREAR EMPRESA EN CHILE */}
      {modalEmpresaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-[#CBD5E0] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94dvh] sm:max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F5F6F8] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[#1B365D] text-base">
                {empresaEnEdicion ? 'Editar Centro de Práctica' : 'Registrar Centro de Práctica'}
              </h3>
              <button
                onClick={() => setModalEmpresaAbierto(false)}
                className="text-[#718096] hover:text-[#1A202C] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEmpresa} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain flex-1 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Razón Social / Nombre <span className="text-[#C5221F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={empNombre}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpNombre(e.target.value)}
                    placeholder="TechLogix Chile SpA"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E85D04] uppercase mb-1">
                    RUT Empresa <span className="text-[#C5221F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={empRut}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpRut(e.target.value)}
                    placeholder="76.840.120-4"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#E85D04] font-mono font-bold text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                  Giro Comercial
                </label>
                <input
                  type="text"
                  value={empGiro}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setEmpGiro(e.target.value)}
                  placeholder="Servicios electromecánicos, montajes y mantenimiento industrial"
                  className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={empDireccion}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpDireccion(e.target.value)}
                    placeholder="Av. Providencia 1234"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Comuna
                  </label>
                  <input
                    type="text"
                    value={empComuna}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpComuna(e.target.value)}
                    placeholder="Providencia"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Región
                  </label>
                  <input
                    type="text"
                    value={empRegion}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpRegion(e.target.value)}
                    placeholder="Región Metropolitana"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Representante / Supervisor
                  </label>
                  <input
                    type="text"
                    value={empSupervisor}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpSupervisor(e.target.value)}
                    placeholder="Ing. Fernando Castro"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Teléfono (+56 9...)
                  </label>
                  <input
                    type="text"
                    value={empSupervisorTelefono}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setEmpSupervisorTelefono(e.target.value)}
                    placeholder="+56 9 8490 2100"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalEmpresaAbierto(false)}
                  className="px-4 py-2.5 bg-[#F5F6F8] hover:bg-[#E2E8F0] text-[#4A5568] rounded-xl font-bold cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white rounded-xl font-bold cursor-pointer shadow-md min-h-[44px]"
                >
                  Guardar Centro de Práctica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR/CREAR DIRECTIVO / RECTORÍA */}
      {modalDirectivoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-[#CBD5E0] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94dvh] sm:max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F5F6F8] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[#1B365D] text-base">
                {usuarioEnEdicion ? 'Editar Cuenta Directiva' : 'Registrar Miembro del Equipo Directivo'}
              </h3>
              <button
                onClick={() => setModalDirectivoAbierto(false)}
                className="text-[#718096] hover:text-[#1A202C] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarDirectivo} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain flex-1 pb-5">
              <div>
                <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={dirNombre}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setDirNombre(e.target.value)}
                  placeholder="Don Luis Valenzuela Castro"
                  className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#E85D04] uppercase mb-1">
                    RUT Chileno
                  </label>
                  <input
                    type="text"
                    required
                    value={dirRut}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setDirRut(e.target.value)}
                    placeholder="9.450.812-4"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#E85D04] font-mono font-bold text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Cargo / Función Institucional
                  </label>
                  <input
                    type="text"
                    required
                    value={dirCargo}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setDirCargo(e.target.value)}
                    placeholder="Director Institucional / Jefe UTP"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={dirEmail}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setDirEmail(e.target.value)}
                    placeholder="director@liceorbl.cl"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Contraseña
                  </label>
                  <input
                    type="text"
                    required
                    value={dirPassword}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setDirPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Teléfono (+56 9...)
                  </label>
                  <input
                    type="text"
                    value={dirTelefono}
                    onFocus={handleInputFocusScroll}
                    onChange={(e) => setDirTelefono(e.target.value)}
                    placeholder="+56 9 9123 4567"
                    className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] font-mono text-base sm:text-xs focus:border-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                    Estado de la Cuenta
                  </label>
                  <button
                    type="button"
                    onClick={() => setDirActivo(!dirActivo)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      dirActivo
                        ? 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                        : 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{dirActivo ? 'Cuenta Activa' : 'Cuenta Deshabilitada'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalDirectivoAbierto(false)}
                  className="px-4 py-2.5 bg-[#F5F6F8] hover:bg-[#E2E8F0] text-[#4A5568] rounded-xl font-bold cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold cursor-pointer shadow-md min-h-[44px]"
                >
                  Guardar Directivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

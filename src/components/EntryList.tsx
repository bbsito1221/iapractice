import React, { useMemo, useState } from 'react';
import {
  EntradaBitacora,
  EstadoEntrada,
  UsuarioApp,
  EstadoVerificacion,
  EmpresaPractica,
  EvaluacionDesempenoLaboral,
  EspecialidadTP,
  CursoTP,
  ESPECIALIDADES_OFICIALES,
  CURSOS_OFICIALES,
} from '../types';
import { USUARIOS_PREDEFINIDOS } from '../data/usuarios';
import { HoursProgressCard } from './HoursProgressCard';
import { EvaluacionLaboralModal } from './EvaluacionLaboralModal';
import {
  Search,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  ShieldCheck,
  GraduationCap,
  Filter,
  X,
  MessageSquareQuote,
  Users,
  Building2,
  Key,
  Award,
  BookOpen,
  Check,
  Star,
  Shield,
  FileCheck,
  TrendingUp,
  Menu,
} from 'lucide-react';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface EntryListProps {
  entradas: EntradaBitacora[];
  busqueda: string;
  setBusqueda: (q: string) => void;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (cat: string) => void;
  onVerEntrada: (entrada: EntradaBitacora) => void;
  onEditarEntrada: (entrada: EntradaBitacora) => void;
  onEliminarEntrada: (id: number) => void;
  onNuevaEntrada: () => void;
  usuarioActual: UsuarioApp | null;
  onAbrirLogin: () => void;
  listaUsuarios?: UsuarioApp[];
  listaEmpresas?: EmpresaPractica[];
  onIrAPanelRoot?: () => void;
  onIrAPanelDirectivo?: () => void;
  onAbrirLibroOficial?: (alumno?: UsuarioApp) => void;
  onGuardarEvaluacionLaboral?: (alumnoId: string, evaluacion: EvaluacionDesempenoLaboral) => void;
}

export const EntryList: React.FC<EntryListProps> = ({
  entradas,
  busqueda,
  setBusqueda,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  onVerEntrada,
  onEditarEntrada,
  onEliminarEntrada,
  onNuevaEntrada,
  usuarioActual,
  onAbrirLogin,
  listaUsuarios = USUARIOS_PREDEFINIDOS,
  listaEmpresas = [],
  onIrAPanelRoot,
  onIrAPanelDirectivo,
  onAbrirLibroOficial,
  onGuardarEvaluacionLaboral,
}) => {
  const [tabEstadoFiltro, setTabEstadoFiltro] = useState<'todas' | 'visadas' | 'pendientes' | 'observadas'>('todas');
  const [departamentoFiltro, setDepartamentoFiltro] = useState('');
  const [alumnoFiltro, setAlumnoFiltro] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState<string>('todas');
  const [cursoFiltro, setCursoFiltro] = useState<string>('todos');
  const [filtrosAvanzadosAbiertos, setFiltrosAvanzadosAbiertos] = useState(false);
  const [alumnoParaEvaluar, setAlumnoParaEvaluar] = useState<UsuarioApp | null>(null);

  const esDocente = usuarioActual?.rol === 'verificador';
  const esAlumno = usuarioActual?.rol === 'alumno';
  const esTutor = usuarioActual?.rol === 'tutor_empresa';
  const esRoot = usuarioActual?.rol === 'root';
  const esDirectivo = usuarioActual?.rol === 'directivo';

  // REGLA DE VISIBILIDAD:
  // Alumno: ve sus propias bitácoras.
  // Tutor Empresa: ve bitácoras de su empresa.
  // Docente o Root: ve todas las bitácoras.
  const entradasAccesibles = useMemo(() => {
    if (!usuarioActual) {
      return [];
    }
    if (esAlumno) {
      return entradas.filter(
        (e) =>
          e.autorId === usuarioActual.id ||
          (e.responsable && e.responsable.toLowerCase() === usuarioActual.nombre.toLowerCase()) ||
          (e.autorEmail && e.autorEmail.toLowerCase() === usuarioActual.email.toLowerCase()) ||
          (e.rutAlumno && usuarioActual.rut && e.rutAlumno === usuarioActual.rut)
      );
    }
    if (esTutor) {
      return entradas.filter(
        (e) =>
          e.empresaId === usuarioActual.empresaId ||
          (e.empresaNombre && usuarioActual.empresaNombre && e.empresaNombre === usuarioActual.empresaNombre) ||
          e.tutorEmpresaNombre === usuarioActual.nombre
      );
    }
    return entradas;
  }, [entradas, usuarioActual, esAlumno, esTutor]);

  const alumnosLista = useMemo(() => {
    return listaUsuarios.filter((u) => u.rol === 'alumno');
  }, [listaUsuarios]);

  const empresaAlumno = useMemo(() => {
    if (!usuarioActual || !esAlumno) return undefined;
    return listaEmpresas.find(
      (e) => e.id === usuarioActual.empresaId || e.nombre === usuarioActual.empresaNombre
    );
  }, [usuarioActual, esAlumno, listaEmpresas]);

  const profesorAlumno = useMemo(() => {
    if (!usuarioActual || !esAlumno) return undefined;
    return listaUsuarios.find(
      (u) =>
        u.rol === 'verificador' &&
        (u.id === usuarioActual.profesorId || u.nombre === usuarioActual.profesorNombre)
    );
  }, [usuarioActual, esAlumno, listaUsuarios]);

  const tutorAlumno = useMemo(() => {
    if (!usuarioActual || !esAlumno) return undefined;
    return listaUsuarios.find(
      (u) =>
        u.rol === 'tutor_empresa' &&
        (u.id === usuarioActual.tutorId || u.nombre === usuarioActual.tutorNombre)
    );
  }, [usuarioActual, esAlumno, listaUsuarios]);

  // Alumnos asignados al Tutor Laboral (Empresa)
  const alumnosDelTutor = useMemo(() => {
    if (!esTutor || !usuarioActual) return [];
    return listaUsuarios.filter(
      (u) =>
        u.rol === 'alumno' &&
        (u.tutorId === usuarioActual.id ||
          u.tutorNombre === usuarioActual.nombre ||
          u.empresaId === usuarioActual.empresaId ||
          (usuarioActual.empresaNombre && u.empresaNombre === usuarioActual.empresaNombre))
    );
  }, [esTutor, usuarioActual, listaUsuarios]);

  // Alumnos asignados al Docente Supervisor (Profesor Guía)
  const alumnosDelDocente = useMemo(() => {
    if (!esDocente || !usuarioActual) return [];
    return listaUsuarios.filter(
      (u) =>
        u.rol === 'alumno' &&
        (u.profesorId === usuarioActual.id ||
          u.profesorNombre === usuarioActual.nombre ||
          (usuarioActual.especialidadSupervisada && u.especialidad === usuarioActual.especialidadSupervisada) ||
          (usuarioActual.cursosSupervisados && u.curso && usuarioActual.cursosSupervisados.includes(u.curso as string)))
    );
  }, [esDocente, usuarioActual, listaUsuarios]);

  // Alertas tempranas para el Docente Supervisor
  const alumnosEnAlertaDocente = useMemo(() => {
    return alumnosDelDocente.filter((a) => {
      const horasAcum = a.horasAcumuladas || 0;
      const horasReq = a.horasRequeridas || 360;
      const pct = (horasAcum / horasReq) * 100;
      return (pct < 25 && a.estadoPractica !== 'Completado') || a.estadoPractica === 'En Alerta';
    });
  }, [alumnosDelDocente]);

  const departamentos = useMemo(() => {
    const deps = new Set(entradasAccesibles.map((e) => e.departamento).filter(Boolean));
    return Array.from(deps) as string[];
  }, [entradasAccesibles]);

  // Cómputos y estadísticas rápidas para los botones de pestañas
  const stats = useMemo(() => {
    const total = entradasAccesibles.length;
    const visadas = entradasAccesibles.filter((e) => e.estadoVerificacion === 'Verificado').length;
    const pendientes = entradasAccesibles.filter(
      (e) => e.estadoVerificacion === 'Pendiente' || !e.estadoVerificacion
    ).length;
    const observadas = entradasAccesibles.filter((e) => e.estadoVerificacion === 'Observado').length;
    const totalHoras = entradasAccesibles
      .filter((e) => e.estadoVerificacion === 'Verificado')
      .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

    return { total, visadas, pendientes, observadas, totalHoras };
  }, [entradasAccesibles]);

  // Filtrado de entradas
  const entradasFiltradas = useMemo(() => {
    return entradasAccesibles.filter((entrada) => {
      // 1. Pestaña de estado rápido
      if (tabEstadoFiltro === 'visadas' && entrada.estadoVerificacion !== 'Verificado') {
        return false;
      }
      if (
        tabEstadoFiltro === 'pendientes' &&
        entrada.estadoVerificacion !== 'Pendiente' &&
        entrada.estadoVerificacion
      ) {
        return false;
      }
      if (tabEstadoFiltro === 'observadas' && entrada.estadoVerificacion !== 'Observado') {
        return false;
      }

      // 2. Búsqueda por texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideTitulo = entrada.titulo.toLowerCase().includes(query);
        const coincideContenido = entrada.contenido.toLowerCase().includes(query);
        const coincideResponsable = entrada.responsable?.toLowerCase().includes(query);
        const coincideEmpresa = entrada.empresaNombre?.toLowerCase().includes(query);
        const coincideRut = entrada.rutAlumno?.toLowerCase().includes(query);
        const coincideCompetencia = entrada.competenciasAplicadas?.toLowerCase().includes(query);
        const coincideTags = entrada.tags?.some((t) => t.toLowerCase().includes(query));

        if (
          !coincideTitulo &&
          !coincideContenido &&
          !coincideResponsable &&
          !coincideEmpresa &&
          !coincideRut &&
          !coincideCompetencia &&
          !coincideTags
        ) {
          return false;
        }
      }

      // 3. Filtros avanzados opcionales
      if (departamentoFiltro && entrada.departamento !== departamentoFiltro) {
        return false;
      }

      if (alumnoFiltro) {
        const alumnoObj = alumnosLista.find((a) => a.id === alumnoFiltro);
        if (alumnoObj) {
          const coincideId = entrada.autorId === alumnoObj.id;
          const coincideNombre = entrada.responsable === alumnoObj.nombre;
          const coincideRut = entrada.rutAlumno === alumnoObj.rut;
          if (!coincideId && !coincideNombre && !coincideRut) {
            return false;
          }
        }
      }

      // 4. Filtro por Especialidad Técnica y Curso TP
      if (especialidadFiltro !== 'todas' || cursoFiltro !== 'todos') {
        const alumnoObj = alumnosLista.find(
          (a) => a.id === entrada.autorId || a.nombre === entrada.responsable || a.rut === entrada.rutAlumno
        );
        if (alumnoObj) {
          if (especialidadFiltro !== 'todas' && alumnoObj.especialidad !== especialidadFiltro) {
            return false;
          }
          if (cursoFiltro !== 'todos' && alumnoObj.curso !== cursoFiltro) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    entradasAccesibles,
    tabEstadoFiltro,
    busqueda,
    departamentoFiltro,
    alumnoFiltro,
    especialidadFiltro,
    cursoFiltro,
    alumnosLista,
  ]);

  // Badges limpios de alto contraste
  const getVerificacionBadge = (estado?: EstadoVerificacion) => {
    switch (estado) {
      case 'Verificado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Visado Docente
          </span>
        );
      case 'Observado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]">
            <AlertCircle className="w-3.5 h-3.5" />
            Con Observaciones
          </span>
        );
      case 'Pendiente':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]">
            <Clock className="w-3.5 h-3.5" />
            Pendiente de Visado
          </span>
        );
    }
  };

  const getVoboTutorBadge = (vobo?: string) => {
    switch (vobo) {
      case 'Verificado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#E85D04] border border-[#FFD8BF]">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            V°B° Empresa
          </span>
        );
      case 'Observado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]">
            <AlertCircle className="w-3.5 h-3.5" />
            Obs. Tutor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0]">
            <Clock className="w-3.5 h-3.5" />
            Sin V°B° Empresa
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. VISTA SUPERIOR ESPECÍFICA POR ROL */}
      {usuarioActual ? (
        esAlumno ? (
          <HoursProgressCard
            usuario={usuarioActual}
            entradas={entradas}
            empresa={empresaAlumno}
            profesor={profesorAlumno}
            tutor={tutorAlumno}
            onNuevaEntrada={onNuevaEntrada}
            onAbrirLibroOficial={() => onAbrirLibroOficial?.(usuarioActual)}
          />
        ) : esRoot ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#1B365D] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Key className="w-6 h-6 stroke-[2.5] text-[#E85D04]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1B365D]">
                    Panel de Administración del Liceo Industrial
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#E85D04] text-white font-mono text-[10px] font-bold">
                    ROOT
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#4A5568] mt-0.5">
                  Auditoría integral de jornadas de práctica, asignación de docentes supervisores y empresas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onAbrirLibroOficial && (
                <button
                  onClick={() => onAbrirLibroOficial?.(alumnosLista[0])}
                  className="px-3.5 py-2.5 bg-[#F5F6F8] hover:bg-[#E2E8F0] border border-[#CBD5E0] text-xs font-bold text-[#1B365D] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#E85D04]" />
                  <span>Libro Oficial</span>
                </button>
              )}
              {onIrAPanelRoot && (
                <button
                  onClick={onIrAPanelRoot}
                  className="px-4 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#E85D04]/25 flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Gestionar Usuarios</span>
                </button>
              )}
            </div>
          </div>
        ) : esTutor ? (
          /* ROL 3: TUTOR LABORAL / MAESTRO GUÍA (EMPRESA) */
          <div className="bg-white border border-[#CBD5E0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E85D04]/15 text-[#E85D04] flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-[#1B365D]">{usuarioActual.nombre}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E85D04]/15 text-[#E85D04]">
                      ROL 3: MAESTRO GUÍA EN EMPRESA
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5F6F8] text-[#1B365D] border border-[#CBD5E0]">
                      {usuarioActual.empresaNombre || 'Centro de Práctica'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A5568] mt-0.5">
                    Responsable de validar asistencia diaria, horarios trabajados, visto bueno semanal y pauta final de desempeño laboral.
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Practicantes Asignados en la Empresa */}
            {alumnosDelTutor.length > 0 && (
              <div className="pt-2 border-t border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B365D] uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#E85D04]" />
                    <span>Estudiantes a su Cargo en la Empresa ({alumnosDelTutor.length})</span>
                  </span>
                  <span className="text-[11px] text-[#718096]">
                    Haga clic en evaluar para emitir la pauta final
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alumnosDelTutor.map((alumno) => {
                    const horasAcum = alumno.horasAcumuladas || 0;
                    const horasReq = alumno.horasRequeridas || 360;
                    const pct = Math.min(100, Math.round((horasAcum / horasReq) * 100));
                    const evaluado = alumno.evaluacionEmpresa?.completada;

                    return (
                      <div
                        key={alumno.id}
                        className="p-3.5 rounded-xl border border-[#CBD5E0] bg-[#F5F6F8] hover:border-[#E85D04] transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm text-[#1A202C]">{alumno.nombre}</div>
                            <div className="text-xs text-[#4A5568] flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[#E85D04] font-semibold">{alumno.rut}</span>
                              <span>&bull;</span>
                              <span>{alumno.especialidad}</span>
                              {alumno.curso && <span className="font-mono">({alumno.curso})</span>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            evaluado
                              ? 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                              : pct >= 100
                              ? 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]'
                              : 'bg-white text-[#4A5568] border border-[#CBD5E0]'
                          }`}>
                            {evaluado ? 'Evaluado' : `${pct}% horas`}
                          </span>
                        </div>

                        {/* Avance de Horas */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#4A5568]">Avance Horas Acreditadas:</span>
                            <span className="font-mono font-bold text-[#1B365D]">
                              {horasAcum} / {horasReq} hrs
                            </span>
                          </div>
                          <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#E85D04] h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Acciones del Tutor para este alumno */}
                        <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0]">
                          <button
                            type="button"
                            onClick={() => setAlumnoParaEvaluar(alumno)}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              evaluado
                                ? 'bg-[#137333] hover:bg-[#0E5B28] text-white shadow-xs'
                                : 'bg-[#E85D04] hover:bg-[#D04F00] text-white shadow-xs'
                            }`}
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>
                              {evaluado
                                ? `Pauta Final: ${alumno.evaluacionEmpresa?.promedioFinal?.toFixed(1)} (Editar)`
                                : 'Pauta de Evaluación Laboral'}
                            </span>
                          </button>

                          {onAbrirLibroOficial && (
                            <button
                              type="button"
                              onClick={() => onAbrirLibroOficial(alumno)}
                              className="py-2 px-2.5 rounded-xl text-xs font-bold bg-white hover:bg-[#E2E8F0] border border-[#CBD5E0] text-[#1B365D] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              title="Ver y visado del libro oficial foliado"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#E85D04]" />
                              <span>Libro</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : esDocente ? (
          /* ROL 2: PROFESOR GUÍA / DOCENTE TUTOR DE PRÁCTICA (ROL PEDAGÓGICO) */
          <div className="bg-white border border-[#CBD5E0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1B365D] text-white flex items-center justify-center font-bold shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#E85D04]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-[#1B365D]">{usuarioActual.nombre}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1B365D]/10 text-[#1B365D]">
                      ROL 2: DOCENTE SUPERVISOR TP
                    </span>
                    {usuarioActual.especialidadSupervisada && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E85D04]/15 text-[#E85D04]">
                        Especialidad: {usuarioActual.especialidadSupervisada}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A5568] mt-0.5">
                    Supervisión pedagógica y curricular de alumnos practicantes. Control de concordancia con especialidad técnica.
                  </p>
                </div>
              </div>

              {alumnosDelDocente.length > 0 && (
                <div className="flex items-center gap-2 bg-[#F5F6F8] px-3 py-1.5 rounded-xl border border-[#CBD5E0] shrink-0 text-xs">
                  <Users className="w-4 h-4 text-[#1B365D]" />
                  <span className="font-bold text-[#1B365D]">
                    {alumnosDelDocente.length} alumnos asignados
                  </span>
                </div>
              )}
            </div>

            {/* Alerta temprana pedagógica si hay alumnos con bajo avance */}
            {alumnosEnAlertaDocente.length > 0 && (
              <div className="p-3 bg-[#FEF7E0] border border-[#FEEFC3] rounded-xl text-xs text-[#B06000] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#B06000] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Alerta de Seguimiento Docente:</strong>{' '}
                  <span>
                    Hay {alumnosEnAlertaDocente.length} estudiante(s) con avance inferior al 25% de las horas requeridas o en estado de alerta:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {alumnosEnAlertaDocente.map((a) => (
                      <span
                        key={a.id}
                        className="px-2 py-0.5 bg-white border border-[#FEEFC3] rounded font-bold text-[11px] text-[#B06000]"
                      >
                        {a.nombre} ({a.horasAcumuladas || 0}/{a.horasRequeridas || 360} hrs)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filtros rápidos por Especialidad y Curso para el Docente */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[#4A5568] font-bold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#E85D04]" />
                Filtrar por Especialidad:
              </span>
              <button
                type="button"
                onClick={() => setEspecialidadFiltro('todas')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  especialidadFiltro === 'todas'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
                }`}
              >
                Todas
              </button>
              {ESPECIALIDADES_OFICIALES.map((esp) => (
                <button
                  key={esp}
                  type="button"
                  onClick={() => setEspecialidadFiltro(esp)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    especialidadFiltro === esp
                      ? 'bg-[#E85D04] text-white shadow-xs'
                      : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {esp}
                </button>
              ))}

              <span className="text-[#4A5568] font-bold ml-2">Curso:</span>
              <button
                type="button"
                onClick={() => setCursoFiltro('todos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  cursoFiltro === 'todos'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
                }`}
              >
                Todos
              </button>
              {CURSOS_OFICIALES.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCursoFiltro(cur)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    cursoFiltro === cur
                      ? 'bg-[#1B365D] text-white shadow-xs'
                      : 'bg-[#F5F6F8] text-[#4A5568] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        ) : esDirectivo ? (
          /* ROL 5: DIRECTOR / EQUIPO DIRECTIVO (ROL EJECUTIVO / AUDITOR) */
          <div className="bg-white border border-[#7C3AED] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Shield className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-[#1B365D]">{usuarioActual.nombre}</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED]">
                    ROL 5: EQUIPO DIRECTIVO
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#4A5568] mt-0.5">
                  Supervisión macro, vista de pájaro y firma de actas oficiales de acreditación para titulación.
                </p>
              </div>
            </div>

            {onIrAPanelDirectivo && (
              <button
                type="button"
                onClick={onIrAPanelDirectivo}
                className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#7C3AED]/25 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Abrir Dashboard Directivo</span>
              </button>
            )}
          </div>
        ) : null
      ) : null}

      {/* 2. MENÚ INTUITIVO DE PESTAÑAS (Fácil navegación sin información bruta) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1B365D] tracking-tight">
            {esAlumno ? 'Mis Jornadas Registradas' : 'Bitácoras de Práctica Profesional'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568]">
            {esAlumno
              ? 'Consulta el estado de visado docente y el visto bueno de tu tutor de faena'
              : 'Revisa y acredita las actividades técnicas declaradas por los estudiantes'}
          </p>
        </div>
      </div>

      {/* 3. Pestañas de Estado Rápidas Responsivas (Cuadrícula en Móvil, Fila en Tablet/Desktop) */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 text-xs">
        <button
          onClick={() => setTabEstadoFiltro('todas')}
          className={`flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabEstadoFiltro === 'todas'
              ? 'bg-[#1B365D] text-white shadow-sm'
              : 'bg-white text-[#4A5568] hover:bg-[#E2E8F0] border border-[#CBD5E0]'
          }`}
        >
          <span>Todas</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            tabEstadoFiltro === 'todas' ? 'bg-white/20 text-white' : 'bg-[#F5F6F8] text-[#1B365D]'
          }`}>
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setTabEstadoFiltro('visadas')}
          className={`flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabEstadoFiltro === 'visadas'
              ? 'bg-[#137333] text-white shadow-sm'
              : 'bg-white text-[#4A5568] hover:bg-[#E2E8F0] border border-[#CBD5E0]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] group-hover:text-white" />
            <span>Visadas</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            tabEstadoFiltro === 'visadas' ? 'bg-white/20 text-white' : 'bg-[#E6F4EA] text-[#137333]'
          }`}>
            {stats.visadas}
          </span>
        </button>

        <button
          onClick={() => setTabEstadoFiltro('pendientes')}
          className={`flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabEstadoFiltro === 'pendientes'
              ? 'bg-[#E85D04] text-white shadow-sm'
              : 'bg-white text-[#4A5568] hover:bg-[#E2E8F0] border border-[#CBD5E0]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E85D04]" />
            <span>En Revisión</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            tabEstadoFiltro === 'pendientes' ? 'bg-white/20 text-white' : 'bg-[#FFF0E6] text-[#E85D04]'
          }`}>
            {stats.pendientes}
          </span>
        </button>

        <button
          onClick={() => setTabEstadoFiltro('observadas')}
          className={`flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            tabEstadoFiltro === 'observadas'
              ? 'bg-[#C5221F] text-white shadow-sm'
              : 'bg-white text-[#4A5568] hover:bg-[#E2E8F0] border border-[#CBD5E0]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#C5221F]" />
            <span>Observadas</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            tabEstadoFiltro === 'observadas' ? 'bg-white/20 text-white' : 'bg-[#FCE8E6] text-[#C5221F]'
          }`}>
            {stats.observadas}
          </span>
        </button>
      </div>

      {/* 4. Barra de Búsqueda y Filtro por Alumno */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#CBD5E0] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Campo de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-buscar-entradas"
              type="text"
              value={busqueda}
              onFocus={handleInputFocusScroll}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={
                !esAlumno
                  ? 'Buscar por estudiante, RUT, empresa, tarea o competencia...'
                  : 'Buscar en mis bitácoras por tarea, actividad técnica...'
              }
              className="w-full pl-10 pr-9 py-2.5 text-base sm:text-sm bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl focus:border-[#1B365D] text-[#1A202C] placeholder:text-[#718096] transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#718096] hover:text-[#1A202C] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro por Alumno si es Docente o Root */}
          {(!esAlumno || esRoot) && (
            <div className="sm:w-64">
              <select
                value={alumnoFiltro}
                onChange={(e) => setAlumnoFiltro(e.target.value)}
                className="w-full px-3 py-2.5 text-base sm:text-sm bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#1A202C] focus:border-[#1B365D]"
              >
                <option value="">Todos los estudiantes ({alumnosLista.length})</option>
                {alumnosLista.map((alumno) => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.nombre} ({alumno.rut || 'Estudiante'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón Filtros Avanzados */}
          <button
            onClick={() => setFiltrosAvanzadosAbiertos(!filtrosAvanzadosAbiertos)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filtrosAvanzadosAbiertos || departamentoFiltro
                ? 'bg-[#1B365D] text-white border-[#1B365D]'
                : 'bg-[#F5F6F8] hover:bg-[#E2E8F0] border-[#CBD5E0] text-[#4A5568]'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Panel Desplegable de Filtros Avanzados */}
        {filtrosAvanzadosAbiertos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-[#CBD5E0] animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-[#4A5568] mb-1">
                Área o Faena Técnica
              </label>
              <select
                value={departamentoFiltro}
                onChange={(e) => setDepartamentoFiltro(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F8] border border-[#CBD5E0] rounded-lg text-[#1A202C]"
              >
                <option value="">Todas las áreas técnicas</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {departamentoFiltro && (
              <div className="flex items-end">
                <button
                  onClick={() => setDepartamentoFiltro('')}
                  className="px-3 py-2 text-xs font-bold text-[#E85D04] hover:underline cursor-pointer"
                >
                  Limpiar filtros avanzados
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Grid Responsivo de Tarjetas de Bitácora */}
      {entradasFiltradas.length === 0 ? (
        <div className="p-10 text-center bg-white border border-[#CBD5E0] rounded-2xl space-y-3 shadow-sm">
          <Clock className="w-12 h-12 text-[#718096] mx-auto opacity-70" />
          <h3 className="font-bold text-base sm:text-lg text-[#1B365D]">
            No hay registros de jornada con este criterio
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5568] max-w-md mx-auto">
            {busqueda || tabEstadoFiltro !== 'todas' || departamentoFiltro || alumnoFiltro
              ? 'Prueba modificando la búsqueda o restableciendo los filtros activos.'
              : 'Aún no se han registrado bitácoras de práctica profesional.'}
          </p>
          {onNuevaEntrada && (
            <div className="pt-2">
              <button
                onClick={onNuevaEntrada}
                className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#E85D04]/25 cursor-pointer"
              >
                Registrar Primera Jornada
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entradasFiltradas.map((entrada) => {
            const esAutor =
              usuarioActual?.id === entrada.autorId ||
              usuarioActual?.email === entrada.autorEmail ||
              usuarioActual?.nombre === entrada.responsable;

            return (
              <div
                key={entrada.id}
                className="bg-white border border-[#CBD5E0] hover:border-[#1B365D] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md group"
              >
                <div>
                  {/* Cabecera de la tarjeta: Fecha y Horas */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#4A5568] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#E85D04]" />
                      <span>{entrada.fecha}</span>
                      <span className="text-[#CBD5E0]">&bull;</span>
                      <span className="font-mono text-[11px] text-[#718096]">Folio #{entrada.id}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#1B365D] text-white font-mono text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3 text-[#E85D04]" />
                      {entrada.horasRegistradas || 6} hrs
                    </span>
                  </div>

                  {/* Badges de Visado de Alto Contraste */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {getVoboTutorBadge(entrada.voboTutorEmpresa)}
                    {getVerificacionBadge(entrada.estadoVerificacion)}
                  </div>

                  {/* Centro de Práctica / Estudiante */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#4A5568] mb-2.5 font-medium">
                    {entrada.empresaNombre && (
                      <span className="inline-flex items-center gap-1 bg-[#F5F6F8] px-2 py-0.5 rounded-md border border-[#E2E8F0] font-semibold text-[#1B365D]">
                        <Building2 className="w-3 h-3 text-[#E85D04]" />
                        <span className="truncate max-w-[170px]">{entrada.empresaNombre}</span>
                      </span>
                    )}

                    {(!esAlumno || esRoot) && entrada.responsable && (
                      <span className="inline-flex items-center gap-1 bg-[#F5F6F8] px-2 py-0.5 rounded-md border border-[#E2E8F0] text-[#1A202C]">
                        <GraduationCap className="w-3 h-3 text-[#1B365D]" />
                        <span className="truncate max-w-[140px]">{entrada.responsable}</span>
                      </span>
                    )}
                  </div>

                  {/* Título de la actividad técnica */}
                  <h3
                    onClick={() => onVerEntrada(entrada)}
                    className="font-bold text-[#1B365D] text-sm sm:text-base leading-snug group-hover:text-[#E85D04] transition-colors cursor-pointer mb-1.5 line-clamp-2"
                  >
                    {entrada.titulo}
                  </h3>

                  {/* Resumen de la labor realizada */}
                  <p className="text-xs text-[#4A5568] leading-relaxed mb-3 line-clamp-2">
                    {entrada.contenido}
                  </p>

                  {/* Competencias Técnicas */}
                  {entrada.competenciasAplicadas && (
                    <div className="text-[11px] text-[#1B365D] bg-[#1B365D]/8 px-2.5 py-1 rounded-lg border border-[#1B365D]/15 mb-3 line-clamp-1">
                      <strong className="text-[#E85D04]">Competencias:</strong> {entrada.competenciasAplicadas}
                    </div>
                  )}

                  {/* Dictamen o Comentario del Docente */}
                  {entrada.comentarioDocente && (
                    <div className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] text-xs text-[#1A202C] mb-3 flex items-start gap-2">
                      <MessageSquareQuote className="w-4 h-4 text-[#E85D04] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-[#1B365D] block uppercase">
                          Observación del Supervisor ({entrada.verificadoPor || 'Docente'}):
                        </span>
                        <p className="italic text-[#4A5568] line-clamp-2 mt-0.5">
                          "{entrada.comentarioDocente}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pie de Tarjeta y Acciones */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#718096] bg-[#F5F6F8] px-2 py-0.5 rounded">
                    {entrada.departamento || 'Electrotecnia'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Botón especial para Docente o Maestro Guía: Visar */}
                    {(esDocente || esTutor) && (
                      <button
                        onClick={() => onVerEntrada(entrada)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Visar o dictaminar horas de esta jornada"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{esTutor ? 'V°B°' : 'Acreditar'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onVerEntrada(entrada)}
                      title="Ver detalle completo"
                      className="p-2 text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {(esDocente || esAutor || esRoot) && (
                      <>
                        <button
                          onClick={() => onEditarEntrada(entrada)}
                          title="Editar registro"
                          className="p-2 text-[#4A5568] hover:text-[#1B365D] hover:bg-[#F5F6F8] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEliminarEntrada(entrada.id)}
                          title="Eliminar registro"
                          className="p-2 text-[#4A5568] hover:text-[#C5221F] hover:bg-[#FCE8E6] rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PAUTA DE EVALUACIÓN LABORAL (Rol 3: Maestro Guía en Empresa) */}
      {alumnoParaEvaluar && usuarioActual && (
        <EvaluacionLaboralModal
          isOpen={Boolean(alumnoParaEvaluar)}
          onClose={() => setAlumnoParaEvaluar(null)}
          alumno={alumnoParaEvaluar}
          tutorActual={usuarioActual}
          onGuardarEvaluacion={(alumnoId, evaluacion) => {
            onGuardarEvaluacionLaboral?.(alumnoId, evaluacion);
            setAlumnoParaEvaluar(null);
          }}
        />
      )}
    </div>
  );
};

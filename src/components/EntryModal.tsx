import React, { useState, useEffect } from 'react';
import {
  EntradaBitacora,
  EstadoEntrada,
  PrioridadEntrada,
  TurnoTrabajo,
  UsuarioApp,
  EmpresaPractica,
} from '../types';
import {
  X,
  AlertCircle,
  GraduationCap,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  Coffee,
  BookOpen,
  Wrench,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entrada: Omit<EntradaBitacora, 'id' | 'creadoEn'> & { id?: number; notificarPorEmail?: boolean }) => void;
  entradaParaEditar?: EntradaBitacora | null;
  usuarioActual: UsuarioApp | null;
  listaAlumnos?: UsuarioApp[];
  listaEmpresas?: EmpresaPractica[];
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entradaParaEditar,
  usuarioActual,
  listaAlumnos = [],
  listaEmpresas = [],
}) => {
  const [titulo, setTitulo] = useState('');
  const [departamento, setDepartamento] = useState('Operaciones / Área Técnica');
  const [categoria, setCategoria] = useState('Jornada de Práctica');
  const [responsable, setResponsable] = useState('');
  const [autorId, setAutorId] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [rutAlumno, setRutAlumno] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('08:30');
  const [horaSalida, setHoraSalida] = useState('17:30');
  const [colacionMinutos, setColacionMinutos] = useState<number>(60);
  const [horasRegistradas, setHorasRegistradas] = useState<number>(8);
  const [prioridad, setPrioridad] = useState<PrioridadEntrada>('Media');
  const [turno, setTurno] = useState<TurnoTrabajo>('Matutino');
  const [estado, setEstado] = useState<EstadoEntrada>('Completado');
  const [contenido, setContenido] = useState('');
  const [accionesTomadas, setAccionesTomadas] = useState('');
  const [competenciasAplicadas, setCompetenciasAplicadas] = useState('');
  const [dificultadesSolucion, setDificultadesSolucion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notificarPorEmail, setNotificarPorEmail] = useState(true);
  const [error, setError] = useState('');

  const esAlumno = usuarioActual?.rol === 'alumno';
  const esDocente = usuarioActual?.rol === 'verificador';
  const esTutor = usuarioActual?.rol === 'tutor_empresa';
  const esRoot = usuarioActual?.rol === 'root';

  // Cálculo automático de horas cronológicas basado en entrada, salida y colación
  const calcularHoras = (entradaStr: string, salidaStr: string, colacionMin: number) => {
    try {
      const [hEntrada, mEntrada] = entradaStr.split(':').map(Number);
      const [hSalida, mSalida] = salidaStr.split(':').map(Number);
      if (!isNaN(hEntrada) && !isNaN(mEntrada) && !isNaN(hSalida) && !isNaN(mSalida)) {
        const minutosEntrada = hEntrada * 60 + mEntrada;
        const minutosSalida = hSalida * 60 + mSalida;
        let diffMinutos = minutosSalida - minutosEntrada;
        if (diffMinutos < 0) {
          diffMinutos += 24 * 60;
        }
        const minutosNetos = Math.max(0, diffMinutos - colacionMin);
        const horasCalculadas = Math.round((minutosNetos / 60) * 10) / 10;
        return horasCalculadas;
      }
    } catch {
      // fallback
    }
    return 8;
  };

  const handleHorarioChange = (
    nuevaEntrada: string,
    nuevaSalida: string,
    nuevaColacion: number
  ) => {
    setHoraEntrada(nuevaEntrada);
    setHoraSalida(nuevaSalida);
    setColacionMinutos(nuevaColacion);
    const hrs = calcularHoras(nuevaEntrada, nuevaSalida, nuevaColacion);
    setHorasRegistradas(hrs);
  };

  useEffect(() => {
    if (entradaParaEditar) {
      setTitulo(entradaParaEditar.titulo);
      setDepartamento(entradaParaEditar.departamento || 'Área Técnica');
      setCategoria(entradaParaEditar.categoria || 'Jornada de Práctica');
      setResponsable(entradaParaEditar.responsable);
      setAutorId(entradaParaEditar.autorId || '');
      setEmpresaNombre(entradaParaEditar.empresaNombre || '');
      setRutEmpresa(entradaParaEditar.rutEmpresa || '');
      setRutAlumno(entradaParaEditar.rutAlumno || '');
      setFecha(entradaParaEditar.fecha);
      setHoraEntrada(entradaParaEditar.horaEntrada || '08:30');
      setHoraSalida(entradaParaEditar.horaSalida || '17:30');
      setColacionMinutos(entradaParaEditar.colacionMinutos ?? 60);
      setHorasRegistradas(entradaParaEditar.horasRegistradas || 8);
      setPrioridad(entradaParaEditar.prioridad);
      setTurno(entradaParaEditar.turno);
      setEstado(entradaParaEditar.estado);
      setContenido(entradaParaEditar.contenido);
      setAccionesTomadas(entradaParaEditar.accionesTomadas || '');
      setCompetenciasAplicadas(entradaParaEditar.competenciasAplicadas || '');
      setDificultadesSolucion(entradaParaEditar.dificultadesSolucion || '');
      setObservaciones(entradaParaEditar.observaciones || '');
      setTagsInput(entradaParaEditar.tags ? entradaParaEditar.tags.join(', ') : '');
    } else {
      setTitulo('');
      setDepartamento('Área Técnica / Operaciones');
      setCategoria('Jornada de Práctica');
      setFecha(new Date().toISOString().split('T')[0]);
      setHoraEntrada('08:30');
      setHoraSalida('17:30');
      setColacionMinutos(60);
      setHorasRegistradas(8);
      setPrioridad('Media');
      setTurno('Matutino');
      setEstado('Completado');
      setContenido('');
      setAccionesTomadas('');
      setCompetenciasAplicadas('');
      setDificultadesSolucion('');
      setObservaciones('');
      setTagsInput('');

      // Auto-completar datos si es Alumno
      if (esAlumno && usuarioActual) {
        setResponsable(usuarioActual.nombre);
        setAutorId(usuarioActual.id);
        setRutAlumno(usuarioActual.rut || '');
        setEmpresaNombre(usuarioActual.empresaNombre || '');

        const empresaAsociada = listaEmpresas.find(
          (emp) =>
            emp.id === usuarioActual.empresaId || emp.nombre === usuarioActual.empresaNombre
        );
        if (empresaAsociada) {
          setRutEmpresa(empresaAsociada.rut || '');
        }
      } else if (listaAlumnos.length > 0) {
        const primerAlumno = listaAlumnos[0];
        setResponsable(primerAlumno.nombre);
        setAutorId(primerAlumno.id);
        setRutAlumno(primerAlumno.rut || '');
        setEmpresaNombre(primerAlumno.empresaNombre || '');
      }
    }
  }, [entradaParaEditar, isOpen, esAlumno, usuarioActual, listaAlumnos, listaEmpresas]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !contenido.trim()) {
      setError('Por favor complete el título y la descripción detallada de las actividades.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const alumnoSeleccionado = listaAlumnos.find(
      (a) => a.id === autorId || a.nombre === responsable
    );
    const empresaSeleccionada = listaEmpresas.find(
      (em) => em.nombre.toLowerCase() === empresaNombre.toLowerCase()
    );

    onSave({
      id: entradaParaEditar?.id,
      titulo: titulo.trim(),
      departamento: departamento.trim() || 'General',
      categoria: categoria.trim() || 'Jornada de Práctica',
      responsable: alumnoSeleccionado?.nombre || responsable.trim() || 'Estudiante Practicante',
      autorId: alumnoSeleccionado?.id || autorId || entradaParaEditar?.autorId,
      autorEmail: alumnoSeleccionado?.email || entradaParaEditar?.autorEmail,
      autorMatricula: alumnoSeleccionado?.matricula || entradaParaEditar?.autorMatricula,
      rutAlumno: alumnoSeleccionado?.rut || rutAlumno || entradaParaEditar?.rutAlumno,
      empresaNombre: empresaNombre.trim() || alumnoSeleccionado?.empresaNombre || 'Centro de Práctica',
      rutEmpresa: empresaSeleccionada?.rut || rutEmpresa || entradaParaEditar?.rutEmpresa,
      fecha: fecha || new Date().toISOString().split('T')[0],
      horaEntrada,
      horaSalida,
      colacionMinutos,
      horasRegistradas: Number(horasRegistradas) || 8,
      tiempoDedicado: `${horasRegistradas} horas cronológicas`,
      prioridad,
      turno,
      estado,
      contenido: contenido.trim(),
      accionesTomadas: accionesTomadas.trim(),
      competenciasAplicadas: competenciasAplicadas.trim(),
      dificultadesSolucion: dificultadesSolucion.trim(),
      observaciones: observaciones.trim(),
      tags,
      voboTutorEmpresa: entradaParaEditar?.voboTutorEmpresa || 'Pendiente',
      tutorEmpresaNombre: entradaParaEditar?.tutorEmpresaNombre || alumnoSeleccionado?.tutorNombre,
      fechaVoboEmpresa: entradaParaEditar?.fechaVoboEmpresa,
      comentarioTutorEmpresa: entradaParaEditar?.comentarioTutorEmpresa,
      estadoVerificacion: entradaParaEditar?.estadoVerificacion || 'Pendiente',
      comentarioDocente: entradaParaEditar?.comentarioDocente,
      verificadoPor: entradaParaEditar?.verificadoPor || alumnoSeleccionado?.profesorNombre,
      fechaVerificacion: entradaParaEditar?.fechaVerificacion,
      notificarPorEmail,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-3xl shadow-2xl border-t sm:border border-[#CBD5E0] overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Manilla / Grab handle para teléfonos */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#1B365D] flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>

        {/* Header de la Hoja de Bitácora */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E2E8F0] bg-[#1B365D] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-inner shrink-0">
              <BookOpen className="w-5 h-5 text-[#E85D04]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-white leading-tight">
                  {entradaParaEditar
                    ? 'Editar Hoja de Bitácora'
                    : 'Registrar Jornada de Práctica'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E85D04] text-white font-bold hidden xs:inline">
                  LICEO INDUSTRIAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/80 leading-tight mt-0.5">
                Registro de actividades y cálculo automático de horas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Estructurado con auto-scroll en teclado */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm pb-8 sm:pb-6 overscroll-contain flex-1">
          {error && (
            <div className="p-3 bg-[#FCE8E6] border border-[#FAD2CF] rounded-xl flex items-center gap-2 text-xs text-[#C5221F] font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Banner de Identificación del Estudiante */}
          <div className="p-3.5 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <GraduationCap className="w-4 h-4 text-[#1B365D] shrink-0" />
              <span className="text-[#4A5568]">
                Practicante: <strong className="text-[#1A202C]">{esAlumno ? usuarioActual?.nombre : responsable || 'Estudiante'}</strong>
              </span>
              {rutAlumno && (
                <span className="font-mono text-[#E85D04] bg-white px-2 py-0.5 rounded border border-[#CBD5E0] font-bold text-xs">
                  RUT: {rutAlumno}
                </span>
              )}
            </div>

            {(!esAlumno || esRoot) && listaAlumnos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[#4A5568] text-xs">Cambiar:</span>
                <select
                  value={autorId}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => {
                    const id = e.target.value;
                    setAutorId(id);
                    const al = listaAlumnos.find((a) => a.id === id);
                    if (al) {
                      setResponsable(al.nombre);
                      setRutAlumno(al.rut || '');
                      setEmpresaNombre(al.empresaNombre || '');
                      const em = listaEmpresas.find(
                        (em) => em.id === al.empresaId || em.nombre === al.empresaNombre
                      );
                      setRutEmpresa(em?.rut || '');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                >
                  {listaAlumnos.map((alum) => (
                    <option key={alum.id} value={alum.id}>
                      {alum.nombre} ({alum.rut || alum.matricula})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 1. SECCIÓN DE HORARIO, ASISTENCIA Y CÓMPUTO DE HORAS */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#1B365D] uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E85D04]" />
                Horario y Cómputo Automático
              </span>
              <span className="text-[11px] text-[#4A5568]">
                Resta el tiempo de colación automáticamente
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {/* Fecha */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D] font-mono"
                />
              </div>

              {/* Hora Entrada */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                  Ingreso
                </label>
                <input
                  type="time"
                  required
                  value={horaEntrada}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => handleHorarioChange(e.target.value, horaSalida, colacionMinutos)}
                  className="w-full px-2.5 py-2.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D] font-mono"
                />
              </div>

              {/* Hora Salida */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                  Salida
                </label>
                <input
                  type="time"
                  required
                  value={horaSalida}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) => handleHorarioChange(horaEntrada, e.target.value, colacionMinutos)}
                  className="w-full px-2.5 py-2.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D] font-mono"
                />
              </div>

              {/* Colación */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-[#E85D04]" />
                  Colación
                </label>
                <select
                  value={colacionMinutos}
                  onFocus={handleInputFocusScroll}
                  onChange={(e) =>
                    handleHorarioChange(horaEntrada, horaSalida, Number(e.target.value))
                  }
                  className="w-full px-2.5 py-2.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A202C] text-base sm:text-xs focus:border-[#1B365D]"
                >
                  <option value={0}>0 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min (1 hr)</option>
                  <option value={90}>90 min (1.5 hr)</option>
                </select>
              </div>

              {/* Total Horas Efectivas */}
              <div className="bg-white p-2 rounded-lg border border-[#CEEAD6] flex flex-col justify-center items-center text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#137333]">Horas Netas</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-lg font-mono font-black text-[#137333]">
                    {horasRegistradas}
                  </span>
                  <span className="text-xs text-[#137333] font-bold font-mono">hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DATOS DE FAENA Y CENTRO DE PRÁCTICA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-[#E85D04]" />
                Centro de Práctica (Empresa)
              </label>
              <input
                type="text"
                required
                value={empresaNombre}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setEmpresaNombre(e.target.value)}
                placeholder="Nombre de la empresa"
                className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-base sm:text-sm text-[#1A202C] focus:border-[#1B365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                Sección / Área de Desempeño
              </label>
              <input
                type="text"
                value={departamento}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ej. Taller, Mantención, Redes"
                className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-base sm:text-sm text-[#1A202C] focus:border-[#1B365D]"
              />
            </div>
          </div>

          {/* 3. TÍTULO Y DESCRIPCIÓN */}
          <div>
            <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
              Título Breve de la Jornada <span className="text-[#C5221F]">*</span>
            </label>
            <input
              type="text"
              required
              value={titulo}
              onFocus={handleInputFocusScroll}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Mantenimiento preventivo de tableros eléctricos"
              className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl focus:border-[#1B365D] text-base sm:text-sm text-[#1A202C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
              Descripción de lo Realizado en Faena <span className="text-[#C5221F]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={contenido}
              onFocus={handleInputFocusScroll}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe aquí las tareas ejecutadas, herramientas usadas, normas de seguridad..."
              className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl focus:border-[#1B365D] text-base sm:text-sm text-[#1A202C] leading-relaxed resize-y"
            />
          </div>

          {/* 4. COMPETENCIAS CURRICULARES Y DIFICULTADES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#137333] uppercase mb-1 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-[#137333]" />
                Aprendizajes Aplicados (Opcional)
              </label>
              <textarea
                rows={2}
                value={competenciasAplicadas}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setCompetenciasAplicadas(e.target.value)}
                placeholder="Conocimientos técnicos o asignaturas aplicadas..."
                className="w-full px-3.5 py-2 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl focus:border-[#137333] text-base sm:text-sm text-[#1A202C] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E85D04] uppercase mb-1 flex items-center gap-1">
                <Wrench className="w-4 h-4 text-[#E85D04]" />
                Dificultades y Solución (Opcional)
              </label>
              <textarea
                rows={2}
                value={dificultadesSolucion}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setDificultadesSolucion(e.target.value)}
                placeholder="Problemas encontrados y cómo se solucionaron..."
                className="w-full px-3.5 py-2 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl focus:border-[#E85D04] text-base sm:text-sm text-[#1A202C] resize-none"
              />
            </div>
          </div>

          {/* 5. TURNO, PRIORIDAD Y TAGS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                Turno
              </label>
              <select
                value={turno}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setTurno(e.target.value as TurnoTrabajo)}
                className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-lg text-base sm:text-xs text-[#1A202C] focus:border-[#1B365D]"
              >
                <option value="Matutino">Matutino (Diurno)</option>
                <option value="Vespertino">Vespertino (Tarde)</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Continuo">Jornada Continua</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setPrioridad(e.target.value as PrioridadEntrada)}
                className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-lg text-base sm:text-xs text-[#1A202C] focus:border-[#1B365D]"
              >
                <option value="Media">Media (Habitual)</option>
                <option value="Baja">Baja</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A5568] uppercase mb-1">
                Palabras clave / Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onFocus={handleInputFocusScroll}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ej: electricidad, motores"
                className="w-full px-3 py-2.5 bg-[#F5F6F8] border border-[#CBD5E0] rounded-lg text-base sm:text-xs text-[#1A202C] focus:border-[#1B365D]"
              />
            </div>
          </div>

          {/* 6. AVISO DE NOTIFICACIÓN POR EMAIL */}
          <div className="bg-[#F5F6F8] p-3.5 rounded-xl border border-[#CBD5E0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1B365D]/10 text-[#1B365D] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#E85D04]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A202C]">
                  Avisar por correo para solicitar firma
                </p>
                <p className="text-[11px] text-[#4A5568]">
                  Notifica al Profesor Guía y Tutor Laboral para la revisión.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={notificarPorEmail}
                onChange={(e) => setNotificarPorEmail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#CBD5E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E85D04]"></div>
            </label>
          </div>

          {/* Botones de acción directos fijados en la parte inferior */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5 sticky bottom-0 bg-white py-3 px-4 sm:px-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 shadow-md sm:shadow-none pb-safe shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-3 text-xs sm:text-sm font-bold text-[#4A5568] hover:text-[#1A202C] bg-[#F5F6F8] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#E85D04] hover:bg-[#D04F00] rounded-xl shadow-md shadow-[#E85D04]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{entradaParaEditar ? 'Guardar Cambios' : 'Registrar Jornada'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

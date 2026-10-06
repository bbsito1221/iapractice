export type EstadoEntrada = 'Completado' | 'En progreso' | 'Pendiente' | 'Bloqueado';
export type PrioridadEntrada = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type TurnoTrabajo = 'Matutino' | 'Vespertino' | 'Nocturno' | 'Continuo';

// 5 Roles de la Arquitectura de Bitácora TP
export type RolUsuario =
  | 'root' // 1. Administrador General del Sistema / Coordinador TP
  | 'verificador' // 2. Profesor Guía / Docente Tutor de Práctica (Rol Pedagógico)
  | 'tutor_empresa' // 3. Tutor Laboral / Maestro Guía (Rol Empresa)
  | 'alumno' // 4. Estudiante / Practicante (Rol Alumno)
  | 'directivo'; // 5. Director / Equipo Directivo (Rol Ejecutivo / Auditor)

export type EstadoVerificacion = 'Pendiente' | 'Verificado' | 'Observado';

// Especialidades Oficiales del Liceo Industrial Técnico Profesional
export type EspecialidadTP = 'Electricidad' | 'Electrónica' | 'Telecomunicaciones';
export type CursoTP = '4° Medio A' | '4° Medio B' | '4° Medio C';

export const ESPECIALIDADES_OFICIALES: EspecialidadTP[] = [
  'Electricidad',
  'Electrónica',
  'Telecomunicaciones',
];

export const CURSOS_OFICIALES: CursoTP[] = [
  '4° Medio A',
  '4° Medio B',
  '4° Medio C',
];

export const HORAS_MINEDUC_OPCIONES = [180, 360, 450];

// Pauta de Evaluación de Desempeño Laboral (Exigida por el Liceo al finalizar la práctica)
export interface EvaluacionDesempenoLaboral {
  puntualidadAsistencia: number; // Escala chilena 1.0 - 7.0
  cumplimientoNormasSeguridad: number;
  calidadTrabajoTecnico: number;
  iniciativaAdaptabilidad: number;
  trabajoEquipoRelaciones: number;
  promedioFinal: number;
  observacionesFinales?: string;
  fechaEvaluacion: string;
  tutorFirmaNombre: string;
  completada: boolean;
}

// Configuración general del sistema administrada por el Coordinador TP
export interface ConfiguracionTP {
  horasRequeridasMineduc: number; // 180 o 360
  anoLectivo: number;
  especialidadesActivas: EspecialidadTP[];
  cursosActivos: CursoTP[];
  periodoPracticasActivo: boolean;
}

export interface EmpresaPractica {
  id: string;
  nombre: string;
  rut?: string; // RUT chileno (ej: 76.543.210-K)
  rfc?: string;
  sector: string;
  giro?: string;
  direccion: string;
  comuna?: string;
  region?: string;
  supervisorNombre: string; // Tutor de Empresa / Maestro Guía
  supervisorCargo: string;
  supervisorEmail: string;
  supervisorTelefono: string;
  convenioVigente: boolean;
  alumnosAsignados?: number;
}

export interface UsuarioApp {
  id: string;
  nombre: string;
  email: string;
  username?: string;
  rol: RolUsuario;
  rut?: string; // RUT del estudiante o profesor (ej: 20.481.932-5)
  matricula?: string;
  especialidad?: EspecialidadTP | string;
  curso?: CursoTP | string; // ej: 4° Medio A, 4° Medio B
  carrera?: string;
  institucion?: string;
  avatar?: string;
  password?: string;
  telefono?: string;
  activo?: boolean; // Para habilitar o deshabilitar cuentas por Coordinador TP
  // Asignación de supervisión docente
  cursosSupervisados?: string[];
  especialidadSupervisada?: EspecialidadTP | string;
  // Campos de prácticas profesionales en Chile
  empresaId?: string;
  empresaNombre?: string;
  profesorId?: string;
  profesorNombre?: string;
  tutorId?: string; // ID del Tutor de Empresa (Maestro Guía)
  tutorNombre?: string; // Nombre del Maestro Guía
  horasRequeridas?: number; // 180 o 360 horas según normativa MINEDUC
  horasAcumuladas?: number;
  fechaInicio?: string;
  fechaFinEstimada?: string;
  estadoPractica?: 'Activo' | 'Completado' | 'Pausado' | 'En Alerta';
  // Pauta de evaluación laboral del tutor
  evaluacionEmpresa?: EvaluacionDesempenoLaboral;
  // Cierre y visado institucional del Director / Equipo Directivo
  actaFirmadaDirectivo?: boolean;
  fechaFirmaDirectivo?: string;
  directivoFirmaNombre?: string;
}

export interface EntradaBitacora {
  id: number;
  titulo: string;
  categoria: string;
  fecha: string;
  contenido: string; // Descripción detallada de actividades y tareas desarrolladas
  tags: string[];
  estado: EstadoEntrada;
  creadoEn: string;
  // Campos de la bitácora física chilena
  departamento?: string; // Sección / Faena / Área
  responsable?: string;
  autorId?: string;
  autorEmail?: string;
  autorMatricula?: string;
  rutAlumno?: string;
  empresaNombre?: string;
  rutEmpresa?: string;
  // Registro de jornada y cómputo de horas cronológicas
  horaEntrada?: string; // Ej: "08:30"
  horaSalida?: string; // Ej: "17:30"
  colacionMinutos?: number; // Ej: 60 minutos
  horasRegistradas?: number; // Horas cronológicas efectivas acreditadas en la jornada
  prioridad?: PrioridadEntrada;
  turno?: TurnoTrabajo;
  tiempoDedicado?: string;
  accionesTomadas?: string;
  competenciasAplicadas?: string; // Conocimientos y competencias técnicas curriculares aplicadas
  dificultadesSolucion?: string; // Problemas u obstáculos en la faena y soluciones aplicadas
  observaciones?: string;
  // V°B° del Tutor de la Empresa (Maestro Guía en Chile)
  voboTutorEmpresa?: EstadoVerificacion;
  tutorEmpresaNombre?: string;
  fechaVoboEmpresa?: string;
  fechaVoboTutor?: string;
  comentarioTutorEmpresa?: string;
  empresaId?: string;
  dificultadesAprendizaje?: string;
  // V°B° y Verificación Académica del Profesor Guía (Docente)
  estadoVerificacion?: EstadoVerificacion;
  verificadoPor?: string;
  fechaVerificacion?: string;
  comentarioDocente?: string;
}

export type TipoNotificacionEmail =
  | 'nueva_entrada'
  | 'recordatorio_validacion'
  | 'dictamen_tutor'
  | 'dictamen_docente';

export interface DestinatarioEmail {
  email: string;
  nombre: string;
  rol: 'profesor' | 'tutor_empresa' | 'alumno';
  tipo: 'para' | 'cc';
}

export interface NotificacionEmail {
  id: string;
  entradaId: number;
  tipo: TipoNotificacionEmail;
  asunto: string;
  remitente: string;
  destinatarios: DestinatarioEmail[];
  alumnoNombre: string;
  alumnoEmail: string;
  alumnoRut?: string;
  empresaNombre?: string;
  carrera?: string;
  jornadaFecha: string;
  horasRegistradas: number;
  tituloEntrada: string;
  resumenContenido: string;
  fechaEnvio: string;
  estadoEnvio: 'enviado' | 'simulado' | 'error';
  cuerpoHtml: string;
  cuerpoTexto: string;
  leidoPor: string[];
}

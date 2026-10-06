import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Tabla de usuarios sincronizada con Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla de empresas colaboradoras en Chile
export const empresas = pgTable('empresas', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  rut: text('rut'), // RUT de la empresa en Chile
  sector: text('sector'),
  giro: text('giro'),
  direccion: text('direccion'),
  comuna: text('comuna'),
  region: text('region'),
  supervisorNombre: text('supervisor_nombre'),
  supervisorCargo: text('supervisor_cargo'),
  supervisorEmail: text('supervisor_email'),
  supervisorTelefono: text('supervisor_telefono'),
  convenioVigente: text('convenio_vigente').default('true'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla de perfiles y usuarios del sistema (estudiantes, docentes, tutores de empresa, root)
export const usuariosPracticas = pgTable('usuarios_practicas', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  username: text('username'),
  rol: text('rol').notNull(), // 'root' | 'verificador' | 'alumno' | 'tutor_empresa'
  rut: text('rut'),
  matricula: text('matricula'),
  carrera: text('carrera'),
  especialidad: text('especialidad'),
  institucion: text('institucion'),
  telefono: text('telefono'),
  empresaId: text('empresa_id'),
  empresaNombre: text('empresa_nombre'),
  profesorId: text('profesor_id'),
  profesorNombre: text('profesor_nombre'),
  tutorId: text('tutor_id'),
  tutorNombre: text('tutor_nombre'),
  horasRequeridas: integer('horas_requeridas').default(360),
  fechaInicio: text('fecha_inicio'),
  fechaFinEstimada: text('fecha_fin_estimada'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla de entradas de la bitácora física digitalizada
export const entradas = pgTable('entradas', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  titulo: text('titulo').notNull(),
  categoria: text('categoria').notNull(),
  fecha: text('fecha').notNull(), // Formato: YYYY-MM-DD
  contenido: text('contenido').notNull(), // Actividades realizadas
  tags: text('tags'),
  estado: text('estado').default('Completado').notNull(),
  departamento: text('departamento'), // Faena / Área
  responsable: text('responsable'),
  prioridad: text('prioridad').default('Media'),
  turno: text('turno'),
  tiempoDedicado: text('tiempo_dedicado'),
  accionesTomadas: text('acciones_tomadas'),
  observaciones: text('observaciones'),
  autorId: text('autor_id'),
  autorEmail: text('autor_email'),
  autorMatricula: text('autor_matricula'),
  rutAlumno: text('rut_alumno'),
  empresaNombre: text('empresa_nombre'),
  rutEmpresa: text('rut_empresa'),
  // Horarios de entrada/salida y cálculo de jornada
  horaEntrada: text('hora_entrada'),
  horaSalida: text('hora_salida'),
  colacionMinutos: integer('colacion_minutos').default(60),
  horasRegistradas: integer('horas_registradas').default(6),
  competenciasAplicadas: text('competencias_aplicadas'),
  dificultadesSolucion: text('dificultades_solucion'),
  // V°B° del Tutor de la Empresa (Maestro Guía)
  voboTutorEmpresa: text('vobo_tutor_empresa').default('Pendiente'),
  tutorEmpresaNombre: text('tutor_empresa_nombre'),
  fechaVoboEmpresa: text('fecha_vobo_empresa'),
  comentarioTutorEmpresa: text('comentario_tutor_empresa'),
  // V°B° y dictamen del Profesor Guía (Docente)
  estadoVerificacion: text('estado_verificacion').default('Pendiente'),
  verificadoPor: text('verificado_por'),
  fechaVerificacion: text('fecha_verificacion'),
  comentarioDocente: text('comentario_docente'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  entradas: many(entradas),
}));

export const entradasRelations = relations(entradas, ({ one }) => ({
  author: one(users, {
    fields: [entradas.userId],
    references: [users.id],
  }),
}));

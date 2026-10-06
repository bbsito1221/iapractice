import { db } from './index.ts';
import { entradas } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface EntradaDataInput {
  userId?: number;
  titulo: string;
  categoria: string;
  fecha: string;
  contenido: string;
  tags?: string;
  estado?: string;
  departamento?: string;
  responsable?: string;
  prioridad?: string;
  turno?: string;
  tiempoDedicado?: string;
  accionesTomadas?: string;
  observaciones?: string;
  autorId?: string;
  autorEmail?: string;
  autorMatricula?: string;
  rutAlumno?: string;
  empresaNombre?: string;
  rutEmpresa?: string;
  horaEntrada?: string;
  horaSalida?: string;
  colacionMinutos?: number;
  horasRegistradas?: number;
  competenciasAplicadas?: string;
  dificultadesSolucion?: string;
  voboTutorEmpresa?: string;
  tutorEmpresaNombre?: string;
  fechaVoboEmpresa?: string;
  comentarioTutorEmpresa?: string;
  estadoVerificacion?: string;
  verificadoPor?: string;
  fechaVerificacion?: string;
  comentarioDocente?: string;
}

export async function getEntradas(userId?: number) {
  try {
    if (userId) {
      return await db
        .select()
        .from(entradas)
        .where(eq(entradas.userId, userId))
        .orderBy(desc(entradas.fecha), desc(entradas.id));
    }
    return await db
      .select()
      .from(entradas)
      .orderBy(desc(entradas.fecha), desc(entradas.id));
  } catch (error) {
    console.error('Database getEntradas query failed:', error);
    throw new Error('Failed to fetch entries.', { cause: error });
  }
}

export async function createEntrada(data: EntradaDataInput) {
  try {
    const res = await db
      .insert(entradas)
      .values({
        userId: data.userId,
        titulo: data.titulo,
        categoria: data.categoria,
        fecha: data.fecha,
        contenido: data.contenido,
        tags: data.tags,
        estado: data.estado || 'Completado',
        departamento: data.departamento,
        responsable: data.responsable,
        prioridad: data.prioridad || 'Media',
        turno: data.turno,
        tiempoDedicado: data.tiempoDedicado,
        accionesTomadas: data.accionesTomadas,
        observaciones: data.observaciones,
        autorId: data.autorId,
        autorEmail: data.autorEmail,
        autorMatricula: data.autorMatricula,
        rutAlumno: data.rutAlumno,
        empresaNombre: data.empresaNombre,
        rutEmpresa: data.rutEmpresa,
        horaEntrada: data.horaEntrada,
        horaSalida: data.horaSalida,
        colacionMinutos: data.colacionMinutos,
        horasRegistradas: data.horasRegistradas,
        competenciasAplicadas: data.competenciasAplicadas,
        dificultadesSolucion: data.dificultadesSolucion,
        voboTutorEmpresa: data.voboTutorEmpresa || 'Pendiente',
        tutorEmpresaNombre: data.tutorEmpresaNombre,
        fechaVoboEmpresa: data.fechaVoboEmpresa,
        comentarioTutorEmpresa: data.comentarioTutorEmpresa,
        estadoVerificacion: data.estadoVerificacion || 'Pendiente',
        verificadoPor: data.verificadoPor,
        fechaVerificacion: data.fechaVerificacion,
        comentarioDocente: data.comentarioDocente,
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database createEntrada query failed:', error);
    throw new Error('Failed to create entry.', { cause: error });
  }
}

export async function updateEntrada(id: number, data: Partial<EntradaDataInput>) {
  try {
    const res = await db
      .update(entradas)
      .set(data)
      .where(eq(entradas.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database updateEntrada query failed:', error);
    throw new Error('Failed to update entry.', { cause: error });
  }
}

export async function deleteEntrada(id: number) {
  try {
    await db.delete(entradas).where(eq(entradas.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database deleteEntrada query failed:', error);
    throw new Error('Failed to delete entry.', { cause: error });
  }
}

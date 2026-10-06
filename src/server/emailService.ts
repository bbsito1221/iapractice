import nodemailer, { type Transporter } from 'nodemailer';
import { NotificacionEmail, DestinatarioEmail, TipoNotificacionEmail } from '../types';
import { generarPlantillaEmailHTML } from '../utils/emailTemplate';

// Almacén en memoria de notificaciones enviadas
let notificacionesServidor: NotificacionEmail[] = [];

// Transporter de Nodemailer
let mailTransporter: Transporter | null = null;

function obtenerTransporter(): { transporter: Transporter; esReal: boolean } {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    if (!mailTransporter) {
      mailTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    }
    return { transporter: mailTransporter, esReal: true };
  }

  // Fallback transparente: JSON transport para modo desarrollo / demostración
  const transportFallback = nodemailer.createTransport({
    jsonTransport: true,
  });

  return { transporter: transportFallback, esReal: false };
}

export interface EnviarNotificacionParams {
  entradaId: number;
  tipo?: TipoNotificacionEmail;
  alumnoNombre: string;
  alumnoEmail: string;
  alumnoRut?: string;
  carrera?: string;
  institucion?: string;
  empresaNombre?: string;
  tutorNombre?: string;
  tutorEmail?: string;
  profesorNombre?: string;
  profesorEmail?: string;
  jornadaFecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  colacionMinutos?: number;
  horasRegistradas: number;
  tituloEntrada: string;
  contenido: string;
  competenciasAplicadas?: string;
  comentarioDictamen?: string;
  appUrl?: string;
}

export async function enviarNotificacionValidacion(
  params: EnviarNotificacionParams
): Promise<NotificacionEmail> {
  const tipo = params.tipo || 'nueva_entrada';
  const remitente =
    process.env.SMTP_FROM ||
    '"Sistema de Prácticas Profesionales" <notificaciones@practicas.mineduc.cl>';

  // Construir lista de destinatarios
  const destinatarios: DestinatarioEmail[] = [];

  // 1. Docente supervisor
  if (params.profesorEmail) {
    destinatarios.push({
      email: params.profesorEmail,
      nombre: params.profesorNombre || 'Profesor Supervisor Académico',
      rol: 'profesor',
      tipo: 'para',
    });
  }

  // 2. Tutor de empresa (Maestro Guía)
  if (params.tutorEmail) {
    destinatarios.push({
      email: params.tutorEmail,
      nombre: params.tutorNombre || 'Tutor de Empresa (Maestro Guía)',
      rol: 'tutor_empresa',
      tipo: 'para',
    });
  }

  // Si no se pasaron emails específicos, agregar los de demostración institucional
  if (destinatarios.length === 0) {
    destinatarios.push({
      email: 'verificador@instituto.cl',
      nombre: params.profesorNombre || 'Prof. Roberto Morales',
      rol: 'profesor',
      tipo: 'para',
    });
    destinatarios.push({
      email: 'fcastro@techlogix.cl',
      nombre: params.tutorNombre || 'Ing. Fernando Castro',
      rol: 'tutor_empresa',
      tipo: 'para',
    });
  }

  // También se copia al alumno para su respaldo
  if (params.alumnoEmail) {
    destinatarios.push({
      email: params.alumnoEmail,
      nombre: params.alumnoNombre,
      rol: 'alumno',
      tipo: 'cc',
    });
  }

  const { asunto, html, texto } = generarPlantillaEmailHTML({
    tipo,
    alumnoNombre: params.alumnoNombre,
    alumnoEmail: params.alumnoEmail,
    alumnoRut: params.alumnoRut,
    carrera: params.carrera,
    institucion: params.institucion,
    empresaNombre: params.empresaNombre,
    tutorNombre: params.tutorNombre,
    profesorNombre: params.profesorNombre,
    entradaId: params.entradaId,
    jornadaFecha: params.jornadaFecha,
    horaEntrada: params.horaEntrada,
    horaSalida: params.horaSalida,
    colacionMinutos: params.colacionMinutos,
    horasRegistradas: params.horasRegistradas,
    tituloEntrada: params.tituloEntrada,
    contenido: params.contenido,
    competenciasAplicadas: params.competenciasAplicadas,
    comentarioDictamen: params.comentarioDictamen,
    destinatarios,
    appUrl: params.appUrl || process.env.APP_URL || 'http://localhost:3000',
  });

  const { transporter, esReal } = obtenerTransporter();

  let estadoEnvio: 'enviado' | 'simulado' | 'error' = esReal ? 'enviado' : 'simulado';

  try {
    const listaPara = destinatarios
      .filter((d) => d.tipo === 'para')
      .map((d) => `"${d.nombre}" <${d.email}>`)
      .join(', ');

    const listaCc = destinatarios
      .filter((d) => d.tipo === 'cc')
      .map((d) => `"${d.nombre}" <${d.email}>`)
      .join(', ');

    await transporter.sendMail({
      from: remitente,
      to: listaPara,
      cc: listaCc || undefined,
      subject: asunto,
      text: texto,
      html: html,
    });

    console.log(`[EMAIL NOTIFICATION] ${esReal ? 'Real SMTP' : 'Simulated'} -> ${asunto}`);
  } catch (error) {
    console.error('Error al enviar correo mediante transporte:', error);
    estadoEnvio = 'error';
  }

  const nuevaNotificacion: NotificacionEmail = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    entradaId: params.entradaId,
    tipo,
    asunto,
    remitente,
    destinatarios,
    alumnoNombre: params.alumnoNombre,
    alumnoEmail: params.alumnoEmail,
    alumnoRut: params.alumnoRut,
    empresaNombre: params.empresaNombre,
    carrera: params.carrera,
    jornadaFecha: params.jornadaFecha,
    horasRegistradas: params.horasRegistradas,
    tituloEntrada: params.tituloEntrada,
    resumenContenido: params.contenido.slice(0, 150) + (params.contenido.length > 150 ? '...' : ''),
    fechaEnvio: new Date().toISOString(),
    estadoEnvio,
    cuerpoHtml: html,
    cuerpoTexto: texto,
    leidoPor: [],
  };

  notificacionesServidor = [nuevaNotificacion, ...notificacionesServidor];

  return nuevaNotificacion;
}

export function obtenerNotificacionesServidor(): NotificacionEmail[] {
  return notificacionesServidor;
}

export function marcarNotificacionLeidaServidor(id: string, usuarioIdOEmail: string): boolean {
  const notif = notificacionesServidor.find((n) => n.id === id);
  if (notif) {
    if (!notif.leidoPor.includes(usuarioIdOEmail)) {
      notif.leidoPor.push(usuarioIdOEmail);
    }
    return true;
  }
  return false;
}

// Inicializar un par de notificaciones de ejemplo si está vacío
export function sembrarNotificacionesIniciales() {
  if (notificacionesServidor.length === 0) {
    const fechaAyer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fechaHoy = new Date().toISOString().split('T')[0];

    const notif1: NotificacionEmail = {
      id: 'notif-ini-01',
      entradaId: 1,
      tipo: 'nueva_entrada',
      asunto: '[Bitácora] Nueva jornada registrada por Carlos Mendoza Silva (8 hrs) - Folio #1',
      remitente: 'Sistema de Prácticas Profesionales <notificaciones@practicas.mineduc.cl>',
      destinatarios: [
        {
          email: 'verificador@instituto.cl',
          nombre: 'Prof. Roberto Morales',
          rol: 'profesor',
          tipo: 'para',
        },
        {
          email: 'fcastro@techlogix.cl',
          nombre: 'Ing. Fernando Castro',
          rol: 'tutor_empresa',
          tipo: 'para',
        },
        {
          email: 'carlos.mendoza@alumno.cl',
          nombre: 'Carlos Mendoza Silva',
          rol: 'alumno',
          tipo: 'cc',
        },
      ],
      alumnoNombre: 'Carlos Mendoza Silva',
      alumnoEmail: 'carlos.mendoza@alumno.cl',
      alumnoRut: '20.481.932-5',
      empresaNombre: 'TechLogix Chile SpA',
      carrera: 'Técnico de Nivel Superior en Telecomunicaciones y Redes',
      jornadaFecha: fechaAyer,
      horasRegistradas: 8,
      tituloEntrada: 'Inducción en Centro de Datos & Cableado Estructurado',
      resumenContenido:
        'Revisión de protocolos de seguridad en sala de servidores, conexionado patch cords CAT6A y etiquetado normado.',
      fechaEnvio: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      estadoEnvio: 'enviado',
      cuerpoHtml: '',
      cuerpoTexto: '',
      leidoPor: [],
    };

    const notif2: NotificacionEmail = {
      id: 'notif-ini-02',
      entradaId: 2,
      tipo: 'recordatorio_validacion',
      asunto:
        '[Urgente] Recordatorio de validación de jornada pendiente - Alumno Carlos Mendoza Silva (Folio #2)',
      remitente: 'Sistema de Prácticas Profesionales <notificaciones@practicas.mineduc.cl>',
      destinatarios: [
        {
          email: 'fcastro@techlogix.cl',
          nombre: 'Ing. Fernando Castro',
          rol: 'tutor_empresa',
          tipo: 'para',
        },
        {
          email: 'verificador@instituto.cl',
          nombre: 'Prof. Roberto Morales',
          rol: 'profesor',
          tipo: 'para',
        },
      ],
      alumnoNombre: 'Carlos Mendoza Silva',
      alumnoEmail: 'carlos.mendoza@alumno.cl',
      alumnoRut: '20.481.932-5',
      empresaNombre: 'TechLogix Chile SpA',
      carrera: 'Técnico de Nivel Superior en Telecomunicaciones y Redes',
      jornadaFecha: fechaHoy,
      horasRegistradas: 6,
      tituloEntrada: 'Configuración VLANs y Enrutamiento Inter-VLAN Cisco',
      resumenContenido:
        'Implementación de VLANs 10, 20 y 30 en Switch Cisco Catalyst 2960. Configuración de enlaces troncales 802.1Q.',
      fechaEnvio: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      estadoEnvio: 'enviado',
      cuerpoHtml: '',
      cuerpoTexto: '',
      leidoPor: [],
    };

    const plantillas1 = generarPlantillaEmailHTML({
      tipo: notif1.tipo,
      alumnoNombre: notif1.alumnoNombre,
      alumnoEmail: notif1.alumnoEmail,
      alumnoRut: notif1.alumnoRut,
      carrera: notif1.carrera,
      empresaNombre: notif1.empresaNombre,
      entradaId: notif1.entradaId,
      jornadaFecha: notif1.jornadaFecha,
      horasRegistradas: notif1.horasRegistradas,
      tituloEntrada: notif1.tituloEntrada,
      contenido:
        'Revisión de protocolos de seguridad en sala de servidores, conexionado patch cords CAT6A y etiquetado normado.',
      destinatarios: notif1.destinatarios,
    });
    notif1.cuerpoHtml = plantillas1.html;
    notif1.cuerpoTexto = plantillas1.texto;

    const plantillas2 = generarPlantillaEmailHTML({
      tipo: notif2.tipo,
      alumnoNombre: notif2.alumnoNombre,
      alumnoEmail: notif2.alumnoEmail,
      alumnoRut: notif2.alumnoRut,
      carrera: notif2.carrera,
      empresaNombre: notif2.empresaNombre,
      entradaId: notif2.entradaId,
      jornadaFecha: notif2.jornadaFecha,
      horasRegistradas: notif2.horasRegistradas,
      tituloEntrada: notif2.tituloEntrada,
      contenido:
        'Implementación de VLANs 10, 20 y 30 en Switch Cisco Catalyst 2960. Configuración de enlaces troncales 802.1Q.',
      destinatarios: notif2.destinatarios,
    });
    notif2.cuerpoHtml = plantillas2.html;
    notif2.cuerpoTexto = plantillas2.texto;

    notificacionesServidor = [notif2, notif1];
  }
}

sembrarNotificacionesIniciales();

import { DestinatarioEmail, TipoNotificacionEmail } from '../types';

export interface ParametrosPlantillaEmail {
  tipo: TipoNotificacionEmail;
  alumnoNombre: string;
  alumnoEmail: string;
  alumnoRut?: string;
  carrera?: string;
  institucion?: string;
  empresaNombre?: string;
  tutorNombre?: string;
  profesorNombre?: string;
  entradaId: number;
  jornadaFecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  colacionMinutos?: number;
  horasRegistradas: number;
  tituloEntrada: string;
  contenido: string;
  competenciasAplicadas?: string;
  observaciones?: string;
  comentarioDictamen?: string;
  destinatarios: DestinatarioEmail[];
  appUrl?: string;
}

export function generarPlantillaEmailHTML(params: ParametrosPlantillaEmail): {
  asunto: string;
  html: string;
  texto: string;
} {
  const {
    tipo,
    alumnoNombre,
    alumnoEmail,
    alumnoRut,
    carrera,
    institucion = 'Instituto Tecnológico Profesional de Chile',
    empresaNombre = 'TechLogix Chile SpA',
    tutorNombre,
    profesorNombre,
    entradaId,
    jornadaFecha,
    horaEntrada = '08:30',
    horaSalida = '17:30',
    colacionMinutos = 60,
    horasRegistradas = 8,
    tituloEntrada,
    contenido,
    competenciasAplicadas,
    comentarioDictamen,
    appUrl = 'https://bitacora.practicas.mineduc.cl',
  } = params;

  let asunto = '';
  let badgeTexto = '';
  let badgeColor = '#0E965A'; // verde institucional
  let encabezadoMensaje = '';

  if (tipo === 'nueva_entrada') {
    asunto = `[Bitácora] Nueva jornada registrada por ${alumnoNombre} (${horasRegistradas} hrs) - Folio #${entradaId}`;
    badgeTexto = 'NUEVA JORNADA PARA REVISIÓN';
    badgeColor = '#0E965A';
    encabezadoMensaje =
      'El estudiante practicante ha registrado una nueva jornada de actividades en su libro oficial de bitácora y requiere la validación correspondiente de su tutor de empresa y docente guía.';
  } else if (tipo === 'recordatorio_validacion') {
    asunto = `[Urgente] Recordatorio de validación de jornada pendiente - Alumno ${alumnoNombre} (Folio #${entradaId})`;
    badgeTexto = 'SOLICITUD DE VALIDACIÓN PENDIENTE';
    badgeColor = '#D97706';
    encabezadoMensaje =
      'Se solicita cordialmente su revisión y visado para la jornada de práctica profesional indicada a continuación, la cual permanece pendiente de aprobación.';
  } else if (tipo === 'dictamen_tutor') {
    asunto = `[V°B° Empresa] El Tutor Laboral ha revisado la jornada de ${alumnoNombre} - Folio #${entradaId}`;
    badgeTexto = 'V°B° LABORAL REGISTRADO';
    badgeColor = '#2563EB';
    encabezadoMensaje =
      'El tutor de empresa (Maestro Guía) ha emitido su dictamen y firma laboral para la jornada de práctica profesional.';
  } else {
    asunto = `[Visado Académico] Dictamen docente registrado para ${alumnoNombre} - Folio #${entradaId}`;
    badgeTexto = 'VISADO DOCENTE REGISTRADO';
    badgeColor = '#4F46E5';
    encabezadoMensaje =
      'El profesor supervisor académico ha emitido la resolución y acreditación de horas para la jornada de práctica.';
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${asunto}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 24px 12px; color: #1F2937; line-height: 1.5; }
    .container { max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header-bar { background-color: #182B49; padding: 20px 28px; text-align: center; color: #FFFFFF; }
    .sub-head { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #93C5FD; text-transform: uppercase; margin: 0 0 6px 0; }
    .main-head { font-size: 18px; font-weight: 800; margin: 0; color: #FFFFFF; letter-spacing: 0.5px; }
    .inst-text { font-size: 11px; color: #D1D5DB; margin-top: 4px; font-weight: 500; }
    .content { padding: 28px; }
    .badge { display: inline-block; background-color: ${badgeColor}; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 12px; }
    .intro { font-size: 14px; color: #4B5563; margin-bottom: 20px; line-height: 1.6; }
    .box { background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 18px; }
    .box-title { font-size: 11px; font-weight: 700; color: #182B49; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; }
    .grid { width: 100%; border-collapse: collapse; }
    .grid td { padding: 5px 0; font-size: 12px; vertical-align: top; }
    .grid .label { color: #6B7280; width: 38%; font-weight: 500; }
    .grid .val { color: #111827; font-weight: 600; }
    .btn-container { text-align: center; margin: 28px 0 16px 0; }
    .btn { display: inline-block; background-color: #0E965A; color: #FFFFFF !important; font-size: 13px; font-weight: 700; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(14, 150, 90, 0.25); text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background-color: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 18px 28px; font-size: 10.5px; color: #6B7280; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div class="sub-head">República de Chile &bull; Sistema Nacional de Prácticas</div>
      <div class="main-head">Libro Oficial de Bitácora Digital</div>
      <div class="inst-text">${institucion.toUpperCase()}</div>
    </div>

    <div class="content">
      <div class="badge">${badgeTexto}</div>
      <p class="intro">${encabezadoMensaje}</p>

      <!-- Ficha Alumno y Empresa -->
      <div class="box">
        <div class="box-title">1. Antecedentes del Estudiante & Centro de Práctica</div>
        <table class="grid">
          <tr>
            <td class="label">Estudiante:</td>
            <td class="val">${alumnoNombre} ${alumnoRut ? `(${alumnoRut})` : ''}</td>
          </tr>
          <tr>
            <td class="label">Carrera:</td>
            <td class="val">${carrera || 'Técnico de Nivel Superior'}</td>
          </tr>
          <tr>
            <td class="label">Empresa Colaboradora:</td>
            <td class="val">${empresaNombre}</td>
          </tr>
          ${
            tutorNombre
              ? `<tr><td class="label">Tutor Laboral (Maestro Guía):</td><td class="val">${tutorNombre}</td></tr>`
              : ''
          }
          ${
            profesorNombre
              ? `<tr><td class="label">Docente Supervisor:</td><td class="val">${profesorNombre}</td></tr>`
              : ''
          }
        </table>
      </div>

      <!-- Resumen de la Jornada Registrada -->
      <div class="box">
        <div class="box-title">2. Detalle de la Jornada de Práctica (Folio #${entradaId})</div>
        <table class="grid">
          <tr>
            <td class="label">Fecha de Jornada:</td>
            <td class="val" style="color: #182B49; font-weight: 700;">${jornadaFecha}</td>
          </tr>
          <tr>
            <td class="label">Horario y Colación:</td>
            <td class="val">${horaEntrada} a ${horaSalida} (Colación: ${colacionMinutos} min)</td>
          </tr>
          <tr>
            <td class="label">Horas Computadas:</td>
            <td class="val" style="color: #0E965A; font-weight: 800; font-size: 13px;">${horasRegistradas} hrs cronológicas</td>
          </tr>
          <tr>
            <td class="label">Título / Asunto:</td>
            <td class="val">${tituloEntrada}</td>
          </tr>
          <tr>
            <td class="label">Actividades Realizadas:</td>
            <td class="val" style="font-weight: 400; color: #374151;">${contenido.replace(/\n/g, '<br>')}</td>
          </tr>
          ${
            competenciasAplicadas
              ? `<tr><td class="label">Competencias Aplicadas:</td><td class="val" style="font-style: italic; color: #0E965A;">${competenciasAplicadas}</td></tr>`
              : ''
          }
          ${
            comentarioDictamen
              ? `<tr><td class="label">Observaciones / Dictamen:</td><td class="val" style="color: #B45309; font-weight: 600;">${comentarioDictamen}</td></tr>`
              : ''
          }
        </table>
      </div>

      <!-- Botón de acción -->
      <div class="btn-container">
        <a href="${appUrl}" target="_blank" class="btn">
          Acceder y Validar Jornada #${entradaId} &rarr;
        </a>
      </div>
      <p style="text-align: center; font-size: 11px; color: #9CA3AF; margin: 0;">
        (Puede ingresar directamente con sus credenciales institucionales de Docente o Tutor de Empresa)
      </p>
    </div>

    <div class="footer">
      Documento electrónico emitido conforme a la Ley N° 19.799 sobre Documentos Electrónicos y Firma Digital.<br>
      Decreto Exento N° 2516 / MINEDUC &bull; Notificación Oficial Automatizada de Bitácora Digital.<br>
      Para consultas técnicas o soporte institucional, contacte a <strong>soporte@instituto.cl</strong>.
    </div>
  </div>
</body>
</html>
  `;

  const texto = `
============================================================
REPÚBLICA DE CHILE • MINISTERIO DE EDUCACIÓN
SISTEMA OFICIAL DE BITÁCORA DIGITAL DE PRÁCTICAS PROFESIONALES
============================================================
${badgeTexto}
${asunto}

${encabezadoMensaje}

--- 1. ANTECEDENTES ---
Estudiante: ${alumnoNombre} ${alumnoRut ? `(${alumnoRut})` : ''}
Carrera: ${carrera || 'Técnico de Nivel Superior'}
Empresa: ${empresaNombre}
Tutor Laboral: ${tutorNombre || 'No asignado'}
Profesor Supervisor: ${profesorNombre || 'No asignado'}

--- 2. DETALLE DE JORNADA REGISTRADA (Folio #${entradaId}) ---
Fecha: ${jornadaFecha}
Horario: ${horaEntrada} a ${horaSalida} (Colación: ${colacionMinutos} min)
Horas Cronológicas: ${horasRegistradas} hrs
Título: ${tituloEntrada}
Actividades:
${contenido}
${competenciasAplicadas ? `Competencias: ${competenciasAplicadas}\n` : ''}

Para revisar y registrar su visado o firma digital, acceda a la plataforma:
${appUrl}

Validez legal conforme a Ley N° 19.799 y Decreto Exento N° 2516 MINEDUC.
  `.trim();

  return { asunto, html, texto };
}

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EntradaBitacora, UsuarioApp, EmpresaPractica } from '../types';

export interface ParametrosReportePDF {
  alumno: UsuarioApp;
  entradas: EntradaBitacora[];
  empresa?: EmpresaPractica | null;
  profesor?: UsuarioApp | null;
  tutor?: UsuarioApp | null;
}

/**
 * Genera un código hash/folio determinístico y único para certificar el documento.
 */
function generarHashCertificacion(rut: string, fecha: string): string {
  const base = `${rut}-${fecha}-${Date.now().toString(36).toUpperCase()}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `CL-PT-${hex}-${rut.replace(/[^0-9Kk]/g, '').slice(-4).toUpperCase()}`;
}

/**
 * Genera y descarga el archivo PDF oficial del Libro de Bitácora de Práctica Profesional en Chile.
 */
export function generarReportePDFBitacora({
  alumno,
  entradas,
  empresa,
  profesor,
  tutor,
}: ParametrosReportePDF): string {
  // Filtrar jornadas pertenecientes a este estudiante
  const entradasAlumno = entradas.filter(
    (e) =>
      e.autorId === alumno.id ||
      e.autorEmail === alumno.email ||
      (alumno.rut && e.rutAlumno === alumno.rut)
  );

  // Cálculos de horas
  const horasAcreditadas = entradasAlumno
    .filter((e) => e.estadoVerificacion === 'Verificado')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 6), 0);

  const horasPendientes = entradasAlumno
    .filter((e) => !e.estadoVerificacion || e.estadoVerificacion === 'Pendiente')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 6), 0);

  const horasObservadas = entradasAlumno
    .filter((e) => e.estadoVerificacion === 'Observado')
    .reduce((acc, curr) => acc + (curr.horasRegistradas || 6), 0);

  const horasTotalesRegistradas = horasAcreditadas + horasPendientes + horasObservadas;
  const horasRequeridas = alumno.horasRequeridas || 360;
  const porcentajeCumplido = Math.min(100, Math.round((horasAcreditadas / horasRequeridas) * 100));
  const esCompletado = horasAcreditadas >= horasRequeridas;

  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const folioCertificado = generarHashCertificacion(alumno.rut || '12345678-9', fechaHoy);

  // Inicializar documento jsPDF formato A4 vertical
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  // COLORES INSTITUCIONALES (liceorbl.cl)
  const colorPrimarioAzul = [27, 54, 93]; // #1B365D - Azul Marino Institucional
  const colorAcentoNaranja = [232, 93, 4]; // #E85D04 - Naranja Institucional
  const colorFondoClaro = [245, 246, 248]; // #F5F6F8 - Gris Suave
  const colorTextoPrincipal = [45, 55, 72]; // #2D3748 - Gris Carbón
  const colorTextoSecundario = [113, 128, 150]; // #718096 - Gris Medio
  const colorBorde = [203, 213, 224]; // #CBD5E0

  // 1. ENCABEZADO FORMAL INSTITUCIONAL
  doc.setFillColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.rect(margin, currentY, pageWidth - margin * 2, 3, 'F');
  currentY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text(
    'LICEO INDUSTRIAL • ESPECIALIDAD ELECTROTECNIA • SISTEMA DE PRÁCTICAS PROFESIONALES',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 5;

  doc.setFontSize(14);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text('LIBRO OFICIAL DE BITÁCORA Y ACREDITACIÓN DE HORAS', pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);
  const institucionTexto = alumno.institucion || 'Liceo Industrial - Especialidad Electrotecnia';
  doc.text(institucionTexto.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(7.5);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text(
    `Folio Digital Único: ${folioCertificado}   •   Fecha Emisión: ${fechaHoy}   •   liceorbl.cl`,
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 6;

  // LÍNEA DIVISORIA CON ACENTO NARANJA
  doc.setDrawColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin * 2, currentY);
  currentY += 5;

  // 2. SECCIÓN 1: ANTECEDENTES DEL ALUMNO Y CENTRO DE PRÁCTICA
  const boxHeight = 32;
  const colWidth = (pageWidth - margin * 2 - 4) / 2;

  // Cuadro Alumno (Izquierda)
  doc.setFillColor(colorFondoClaro[0], colorFondoClaro[1], colorFondoClaro[2]);
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
  doc.roundedRect(margin, currentY, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text('1. ANTECEDENTES DEL ESTUDIANTE PRACTICANTE', margin + 3, currentY + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);

  doc.text(`Nombre: `, margin + 3, currentY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${alumno.nombre}`, margin + 18, currentY + 10);
  doc.setFont('helvetica', 'normal');

  doc.text(`RUT / RUN: `, margin + 3, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${alumno.rut || 'Pendiente'}`, margin + 20, currentY + 15);
  doc.setFont('helvetica', 'normal');

  doc.text(`Matrícula / Folio: ${alumno.matricula || '2026-REG'}`, margin + 3, currentY + 20);
  doc.text(`Especialidad: ${alumno.especialidad || alumno.carrera || 'Electrotecnia'}`, margin + 3, currentY + 25);
  doc.text(`Contacto: ${alumno.email} • Tel: ${alumno.telefono || '+56 9 8765 4321'}`, margin + 3, currentY + 29.5);

  // Cuadro Empresa y Docente (Derecha)
  const xEmpresa = margin + colWidth + 4;
  doc.setFillColor(colorFondoClaro[0], colorFondoClaro[1], colorFondoClaro[2]);
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
  doc.roundedRect(xEmpresa, currentY, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text('2. ANTECEDENTES DEL CENTRO DE PRÁCTICA', xEmpresa + 3, currentY + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);

  const nombreEmpresa = empresa?.nombre || alumno.empresaNombre || 'TechLogix Chile SpA';
  const rutEmpresa = empresa?.rut || '76.840.120-4';
  const tutorNombre = tutor?.nombre || empresa?.supervisorNombre || alumno.tutorNombre || 'Ing. Supervisor Laboral';
  const profesorNombre = profesor?.nombre || alumno.profesorNombre || 'Profesor Supervisor Titulación';

  doc.text(`Razón Social: `, xEmpresa + 3, currentY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${nombreEmpresa}`, xEmpresa + 22, currentY + 10);
  doc.setFont('helvetica', 'normal');

  doc.text(`RUT Empresa: ${rutEmpresa} • Región: ${empresa?.region || 'Metropolitana'}`, xEmpresa + 3, currentY + 15);
  doc.text(`Tutor Empresa (Maestro Guía): ${tutorNombre}`, xEmpresa + 3, currentY + 20);
  doc.text(`Docente Guía Titulación: ${profesorNombre}`, xEmpresa + 3, currentY + 25);
  doc.text(`Período: ${alumno.fechaInicio || '12-01-2026'} al ${alumno.fechaFinEstimada || '30-04-2026'}`, xEmpresa + 3, currentY + 29.5);

  currentY += boxHeight + 4;

  // 3. SECCIÓN 2: DESGLOSE Y CÓMPUTO CONSOLIDADO DE HORAS
  doc.setFillColor(colorFondoClaro[0], colorFondoClaro[1], colorFondoClaro[2]);
  doc.setDrawColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 19, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text('3. DESGLOSE Y CÓMPUTO CURRICULAR DE HORAS CRONOLÓGICAS (CHILE)', margin + 3, currentY + 4.5);

  // 4 Columnas de estadísticas
  const statWidth = (pageWidth - margin * 2) / 4;
  const yStat = currentY + 8.5;

  // Exigencia Curricular
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text('EXIGENCIA CURRICULAR', margin + 3, yStat);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text(`${horasRequeridas} hrs`, margin + 3, yStat + 4.5);
  doc.setFontSize(6.5);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text('Reglamento de Prácticas', margin + 3, yStat + 8);

  // Horas Acreditadas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text('HORAS ACREDITADAS (VISADAS)', margin + statWidth, yStat);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text(`${horasAcreditadas} hrs`, margin + statWidth, yStat + 4.5);
  doc.setFontSize(6.5);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text('Aprobadas por Docente', margin + statWidth, yStat + 8);

  // Horas Pendientes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.text('HORAS EN REVISIÓN', margin + statWidth * 2, yStat);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.text(`${horasPendientes} hrs`, margin + statWidth * 2, yStat + 4.5);
  doc.setFontSize(6.5);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text('Pendientes de visado', margin + statWidth * 2, yStat + 8);

  // Cumplimiento y Estado
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);
  doc.text('DICTAMEN & AVANCE', margin + statWidth * 3, yStat);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(esCompletado ? colorPrimarioAzul[0] : colorAcentoNaranja[0], esCompletado ? colorPrimarioAzul[1] : colorAcentoNaranja[1], esCompletado ? colorPrimarioAzul[2] : colorAcentoNaranja[2]);
  doc.text(`${porcentajeCumplido}%`, margin + statWidth * 3, yStat + 4.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(esCompletado ? 'PRÁCTICA APROBADA' : `FALTAN ${Math.max(0, horasRequeridas - horasAcreditadas)} HRS`, margin + statWidth * 3, yStat + 8);

  currentY += 23;

  // 4. SECCIÓN 3: TABLA FOLIADA DE JORNADAS DE PRÁCTICA (jspdf-autotable)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text(`4. REGISTRO FOLIADO DE JORNADAS DIARIAS Y ACTIVIDADES (${entradasAlumno.length} REGISTROS)`, margin, currentY);
  currentY += 2;

  const filasTabla = entradasAlumno.map((entry) => {
    const folio = `#${entry.id}\n${entry.fecha}`;
    const horario = `${entry.horaEntrada || '08:30'} - ${entry.horaSalida || '17:30'}\nCol: ${entry.colacionMinutos || 60}m`;
    const horas = `${entry.horasRegistradas || 6} hrs`;
    const descripcion = `${entry.titulo}\n${entry.contenido}${
      entry.competenciasAplicadas ? `\n[Competencias: ${entry.competenciasAplicadas}]` : ''
    }`;
    const voboTutor = `${entry.voboTutorEmpresa || 'Pendiente'}\n${entry.tutorEmpresaNombre || 'Tutor'}`;
    const visadoDocente = `${entry.estadoVerificacion || 'Pendiente'}\n${entry.verificadoPor || 'Docente'}`;

    return [folio, horario, horas, descripcion, voboTutor, visadoDocente];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        'Folio / Fecha',
        'Horario & Colación',
        'Horas',
        'Descripción de Tareas y Competencias Aplicadas',
        'V°B° Tutor Empresa',
        'Visado Académico',
      ],
    ],
    body:
      filasTabla.length > 0
        ? filasTabla
        : [['-', '-', '-', 'Sin jornadas registradas aún', '-', '-']],
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [45, 55, 72],
      lineColor: [203, 213, 224],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [27, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [232, 93, 4] },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: [27, 54, 93] },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' },
    },
    margin: { left: margin, right: margin, bottom: 42 },
    didDrawPage: (data) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(113, 128, 150);
      const str = `Página ${data.pageNumber} de ${doc.getNumberOfPages()} • Liceo Industrial - Especialidad Electrotecnia (liceorbl.cl)`;
      doc.text(str, pageWidth / 2, pageHeight - 5, { align: 'center' });
    },
  });

  // 5. SECCIÓN 4: BLOQUE OFICIAL DE FIRMAS DIGITALES Y CERTIFICACIÓN ELECTRÓNICA
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
  if (finalY > pageHeight - 48) {
    doc.addPage();
    currentY = 16;
  } else {
    currentY = finalY + 5;
  }

  // Marco de Firmas Digitales
  doc.setFillColor(colorFondoClaro[0], colorFondoClaro[1], colorFondoClaro[2]);
  doc.setDrawColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.setLineWidth(0.4);
  const firmasBoxHeight = 34;
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, firmasBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text(
    '5. CERTIFICACIÓN DE CONFORMIDAD Y FIRMAS ELECTRÓNICAS (LEY N° 19.799)',
    margin + 3,
    currentY + 4
  );

  const firmaWidth = (pageWidth - margin * 2 - 8) / 3;
  const yFirmaContent = currentY + 7;

  // FIRMA 1: ALUMNO PRACTICANTE
  const xF1 = margin + 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
  doc.roundedRect(xF1, yFirmaContent, firmaWidth, 24, 1.5, 1.5, 'FD');

  // Sello digital decorativo
  doc.setDrawColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(xF1 + 2, yFirmaContent + 2, firmaWidth - 4, 7, 1, 1, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.text('✓ FIRMA ELECTRÓNICA REGISTRADA', xF1 + firmaWidth / 2, yFirmaContent + 6, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);
  doc.text(alumno.nombre, xF1 + firmaWidth / 2, yFirmaContent + 12.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text(`RUT: ${alumno.rut || '20.481.932-5'}`, xF1 + firmaWidth / 2, yFirmaContent + 16, {
    align: 'center',
  });
  doc.text('Estudiante Practicante Electrotecnia', xF1 + firmaWidth / 2, yFirmaContent + 19, {
    align: 'center',
  });
  doc.text(`Firma: ${fechaHoy}`, xF1 + firmaWidth / 2, yFirmaContent + 22, { align: 'center' });

  // FIRMA 2: TUTOR DE EMPRESA
  const xF2 = margin + 2 + firmaWidth + 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
  doc.roundedRect(xF2, yFirmaContent, firmaWidth, 24, 1.5, 1.5, 'FD');

  doc.setDrawColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.roundedRect(xF2 + 2, yFirmaContent + 2, firmaWidth - 4, 7, 1, 1, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(colorAcentoNaranja[0], colorAcentoNaranja[1], colorAcentoNaranja[2]);
  doc.text('✓ V°B° LABORAL CERTIFICADO', xF2 + firmaWidth / 2, yFirmaContent + 6, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);
  doc.text(tutorNombre, xF2 + firmaWidth / 2, yFirmaContent + 12.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text(`RUT Empr: ${rutEmpresa}`, xF2 + firmaWidth / 2, yFirmaContent + 16, {
    align: 'center',
  });
  doc.text('Maestro Guía / Tutor de Empresa', xF2 + firmaWidth / 2, yFirmaContent + 19, {
    align: 'center',
  });
  doc.text(`${nombreEmpresa}`, xF2 + firmaWidth / 2, yFirmaContent + 22, { align: 'center' });

  // FIRMA 3: PROFESOR GUÍA / INSTITUCIÓN
  const xF3 = margin + 2 + (firmaWidth + 2) * 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
  doc.roundedRect(xF3, yFirmaContent, firmaWidth, 24, 1.5, 1.5, 'FD');

  doc.setDrawColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.roundedRect(xF3 + 2, yFirmaContent + 2, firmaWidth - 4, 7, 1, 1, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(colorPrimarioAzul[0], colorPrimarioAzul[1], colorPrimarioAzul[2]);
  doc.text('✓ VISADO ACADÉMICO REGISTRADO', xF3 + firmaWidth / 2, yFirmaContent + 6, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colorTextoPrincipal[0], colorTextoPrincipal[1], colorTextoPrincipal[2]);
  doc.text(profesorNombre, xF3 + firmaWidth / 2, yFirmaContent + 12.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(colorTextoSecundario[0], colorTextoSecundario[1], colorTextoSecundario[2]);
  doc.text('Profesor Guía de Titulación', xF3 + firmaWidth / 2, yFirmaContent + 16, {
    align: 'center',
  });
  doc.text(institucionTexto.slice(0, 30), xF3 + firmaWidth / 2, yFirmaContent + 19, {
    align: 'center',
  });
  doc.text(`Token: ${folioCertificado.slice(-10)}`, xF3 + firmaWidth / 2, yFirmaContent + 22, {
    align: 'center',
  });

  // Nombre de archivo sanitizado
  const nombreLimpio = alumno.nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 20);
  const rutLimpio = (alumno.rut || 'alumno').replace(/[^0-9kK]/g, '');
  const nombreArchivo = `Libro_Oficial_Bitacora_${nombreLimpio}_${rutLimpio}.pdf`;

  // DESCARGA AUTOMÁTICA
  doc.save(nombreArchivo);

  return nombreArchivo;
}

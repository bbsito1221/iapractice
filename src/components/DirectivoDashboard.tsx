import React, { useState } from 'react';
import { UsuarioApp, EmpresaPractica, EntradaBitacora, EspecialidadTP, CursoTP } from '../types';
import {
  Shield,
  Award,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Check,
  Calendar,
  Eye,
  GraduationCap,
} from 'lucide-react';
import { LiceoLogo } from './LiceoLogo';

interface DirectivoDashboardProps {
  usuarios: UsuarioApp[];
  empresas: EmpresaPractica[];
  entradas: EntradaBitacora[];
  usuarioDirectivo: UsuarioApp;
  onAbrirLibroOficial: (alumno: UsuarioApp) => void;
  onFirmarActaDirectivo: (alumnoId: string) => void;
}

export const DirectivoDashboard: React.FC<DirectivoDashboardProps> = ({
  usuarios,
  empresas,
  entradas,
  usuarioDirectivo,
  onAbrirLibroOficial,
  onFirmarActaDirectivo,
}) => {
  const [especialidadFiltro, setEspecialidadFiltro] = useState<string>('todas');
  const [cursoFiltro, setCursoFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const estudiantes = usuarios.filter((u) => u.rol === 'alumno');
  const profesores = usuarios.filter((u) => u.rol === 'verificador');
  const tutores = usuarios.filter((u) => u.rol === 'tutor_empresa');

  // Cálculos macro institucionales ("Vista de Pájaro")
  const totalEstudiantes = estudiantes.length;
  const estudiantesCompletados = estudiantes.filter(
    (e) => (e.horasAcumuladas || 0) >= (e.horasRequeridas || 360) || e.estadoPractica === 'Completado'
  );
  const estudiantesActivos = estudiantes.filter(
    (e) => (e.horasAcumuladas || 0) < (e.horasRequeridas || 360) && e.estadoPractica !== 'Completado'
  );
  const estudiantesEnAlerta = estudiantes.filter((e) => {
    const porcentaje = ((e.horasAcumuladas || 0) / (e.horasRequeridas || 360)) * 100;
    return porcentaje < 25 && e.estadoPractica !== 'Completado';
  });

  const totalHorasValidadas = entradas
    .filter((ent) => ent.voboTutorEmpresa === 'Verificado')
    .reduce((acc, ent) => acc + (ent.horasRegistradas || 0), 0);

  const tasaTitulacionProyectada = totalEstudiantes > 0
    ? Math.round((estudiantesCompletados.length / totalEstudiantes) * 100)
    : 0;

  // Filtrado de estudiantes para tabla de auditoría y actas
  const estudiantesFiltrados = estudiantes.filter((e) => {
    const coincideEsp =
      especialidadFiltro === 'todas' || e.especialidad === especialidadFiltro;
    const coincideCurso =
      cursoFiltro === 'todos' || e.curso === cursoFiltro;
    const coincideTexto =
      !busqueda ||
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.rut && e.rut.toLowerCase().includes(busqueda.toLowerCase())) ||
      (e.empresaNombre && e.empresaNombre.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEsp && coincideCurso && coincideTexto;
  });

  // Estadísticas agrupadas por Especialidad
  const especialidadesStats: {
    nombre: EspecialidadTP;
    alumnos: number;
    completados: number;
    horasPromedio: number;
    porcentajePromedio: number;
    empresasUnicas: number;
  }[] = (['Electricidad', 'Electrónica', 'Telecomunicaciones'] as EspecialidadTP[]).map((esp) => {
    const alumnosEsp = estudiantes.filter((e) => e.especialidad === esp);
    const completadosEsp = alumnosEsp.filter(
      (e) => (e.horasAcumuladas || 0) >= (e.horasRequeridas || 360) || e.estadoPractica === 'Completado'
    );
    const sumHoras = alumnosEsp.reduce((acc, e) => acc + (e.horasAcumuladas || 0), 0);
    const sumMetas = alumnosEsp.reduce((acc, e) => acc + (e.horasRequeridas || 360), 0);
    const horasProm = alumnosEsp.length > 0 ? Math.round(sumHoras / alumnosEsp.length) : 0;
    const pctProm = sumMetas > 0 ? Math.round((sumHoras / sumMetas) * 100) : 0;
    const empresasSet = new Set(alumnosEsp.map((e) => e.empresaId).filter(Boolean));

    return {
      nombre: esp,
      alumnos: alumnosEsp.length,
      completados: completadosEsp.length,
      horasPromedio: horasProm,
      porcentajePromedio: pctProm,
      empresasUnicas: empresasSet.size,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* BANNER INSTITUCIONAL DEL EQUIPO DIRECTIVO */}
      <div className="bg-gradient-to-r from-[#1B365D] via-[#214270] to-[#142A4A] rounded-2xl p-5 sm:p-7 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E85D04] shadow-inner shrink-0">
              <Shield className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Panel de Auditoría y Dirección Institucional
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E85D04] text-white uppercase tracking-wider">
                  Supervisión Macro
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#CBD5E0] mt-1">
                Liceo Industrial &bull; Control y Validación de Prácticas Profesionales ante MINEDUC
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/80">
                <span>Director: <strong>{usuarioDirectivo.nombre}</strong></span>
                <span>&bull;</span>
                <span>RUT: <strong className="font-mono">{usuarioDirectivo.rut || '9.450.812-4'}</strong></span>
                <span>&bull;</span>
                <span className="text-[#0ECB81] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sostenedor Habilitado 2026
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-end justify-center gap-1.5 shrink-0 bg-white/10 p-3 sm:p-4 rounded-xl border border-white/15">
            <span className="text-[11px] text-[#CBD5E0] uppercase tracking-wider font-mono">
              Titulación Proyectada
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#E85D04] font-mono">
                {tasaTitulacionProyectada}%
              </span>
              <span className="text-xs text-white/80">
                ({estudiantesCompletados.length} de {totalEstudiantes} listos)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 MÉTRICAS MACRO ("VISTA DE PÁJARO") */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Estudiantes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#718096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Matrícula en Práctica</span>
            <Users className="w-5 h-5 text-[#1B365D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B365D] font-mono">
            {totalEstudiantes}
          </div>
          <p className="text-xs text-[#718096] mt-1">
            Distribuidos en 3 especialidades TP
          </p>
        </div>

        {/* Listos para Titulación */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#718096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Listos para Titular</span>
            <Award className="w-5 h-5 text-[#0ECB81]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0ECB81] font-mono">
            {estudiantesCompletados.length}
          </div>
          <p className="text-xs text-[#718096] mt-1">
            100% de horas cumplidas en empresa
          </p>
        </div>

        {/* En Proceso Activo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#718096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Ejecución Activa</span>
            <Clock className="w-5 h-5 text-[#E85D04]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E85D04] font-mono">
            {estudiantesActivos.length}
          </div>
          <p className="text-xs text-[#718096] mt-1">
            {estudiantesEnAlerta.length} alumnos con avance bajo alerta
          </p>
        </div>

        {/* Empresas en Convenio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#718096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas en Convenio</span>
            <Building2 className="w-5 h-5 text-[#1B365D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B365D] font-mono">
            {empresas.filter((e) => e.convenioVigente).length}
          </div>
          <p className="text-xs text-[#718096] mt-1">
            Convenios laborales formales vigentes
          </p>
        </div>
      </div>

      {/* DESGLOSE MACRO POR ESPECIALIDAD TÉCNICA */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#CBD5E0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
              Monitoreo Macro por Especialidad Técnica
            </h2>
            <p className="text-xs text-[#718096]">
              Indicadores comparativos de Electricidad, Electrónica y Telecomunicaciones
            </p>
          </div>
          <span className="text-xs font-bold text-[#1B365D] bg-[#F5F6F8] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
            3 Especialidades Acreditadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {especialidadesStats.map((esp) => (
            <div
              key={esp.nombre}
              className="p-4 rounded-xl border border-[#CBD5E0] bg-[#F5F6F8] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#1B365D]">{esp.nombre}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white text-[#E85D04] border border-[#CBD5E0]">
                  {esp.porcentajePromedio}% avance
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#E85D04] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, esp.porcentajePromedio)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-[#4A5568]">
                <div>
                  <span className="text-[11px] text-[#718096] block">Alumnos:</span>
                  <strong>{esp.alumnos} matriculados</strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#718096] block">Completados:</span>
                  <strong className="text-[#0ECB81]">{esp.completados} titulables</strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#718096] block">Horas prom.:</span>
                  <strong className="font-mono">{esp.horasPromedio} hrs</strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#718096] block">Empresas:</span>
                  <strong>{esp.empresasUnicas} centros</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MÓDULO DE FIRMA DE ACTAS Y CIERRE INSTITUCIONAL MINEDUC */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#CBD5E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#E85D04]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1B365D]">
                Actas Oficiales de Titulación y Cierre MINEDUC
              </h2>
            </div>
            <p className="text-xs text-[#718096] mt-0.5">
              Valide con firma electrónica de Director el cierre formal del expediente de cada alumno
            </p>
          </div>

          {/* Filtros de Especialidad y Curso Responsivos */}
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 text-xs w-full sm:w-auto">
            <select
              value={especialidadFiltro}
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#2D3748] font-bold"
            >
              <option value="todas">Todas las Especialidades</option>
              <option value="Electricidad">Electricidad</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Telecomunicaciones">Telecomunicaciones</option>
            </select>

            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-[#2D3748] font-bold"
            >
              <option value="todos">Todos los Cursos</option>
              <option value="4° Medio A">4° Medio A</option>
              <option value="4° Medio B">4° Medio B</option>
              <option value="4° Medio C">4° Medio C</option>
            </select>
          </div>
        </div>

        {/* Tabla / Lista de Estudiantes con Estado de Firma Directiva */}
        <div className="border border-[#CBD5E0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B365D] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3">Estudiante / RUT</th>
                  <th className="p-3">Especialidad &bull; Curso</th>
                  <th className="p-3">Centro de Práctica</th>
                  <th className="p-3 text-center">Horas Validadas</th>
                  <th className="p-3 text-center">Evaluación Empresa</th>
                  <th className="p-3 text-center">Acta MINEDUC</th>
                  <th className="p-3 text-right">Acciones Directivas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#718096] italic">
                      No se encontraron estudiantes para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((est) => {
                    const horasCumplidas = (est.horasAcumuladas || 0) >= (est.horasRequeridas || 360);
                    const evalLista = Boolean(est.evaluacionEmpresa?.completada);
                    const actaFirmada = Boolean(est.actaFirmadaDirectivo);

                    return (
                      <tr key={est.id} className="hover:bg-[#F5F6F8] transition-colors">
                        <td className="p-3">
                          <strong className="text-[#1B365D] block">{est.nombre}</strong>
                          <span className="font-mono text-[#718096] text-[11px]">
                            RUT: {est.rut || 'S/R'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E85D04]/10 text-[#E85D04] border border-[#E85D04]/30 inline-block mb-1">
                            {est.especialidad || 'Electricidad'}
                          </span>
                          <span className="text-[#4A5568] block text-[11px]">
                            {est.curso || '4° Medio A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[#2D3748] font-medium block">
                            {est.empresaNombre || 'Sin asignar'}
                          </span>
                          <span className="text-[#718096] text-[11px]">
                            Tutor: {est.tutorNombre || 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span
                            className={
                              horasCumplidas ? 'text-[#0ECB81]' : 'text-[#E85D04]'
                            }
                          >
                            {est.horasAcumuladas || 0} / {est.horasRequeridas || 360} hrs
                          </span>
                          <div className="w-20 bg-[#E2E8F0] h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className="bg-[#0ECB81] h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    ((est.horasAcumuladas || 0) / (est.horasRequeridas || 360)) *
                                      100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {evalLista ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                              <Check className="w-3 h-3" />
                              Nota: {est.evaluacionEmpresa?.promedioFinal != null ? est.evaluacionEmpresa.promedioFinal.toFixed(1) : 'S/N'}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F6F8] text-[#718096] border border-[#CBD5E0]">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {actaFirmada ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1B365D] text-white">
                              <Shield className="w-3 h-3 text-[#E85D04]" />
                              Firmada &bull; Folio Oficial
                            </span>
                          ) : horasCumplidas ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                              <AlertTriangle className="w-3 h-3" />
                              Lista para Firma
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#718096]">En Proceso</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botón Ver Libro Oficial */}
                            <button
                              onClick={() => onAbrirLibroOficial(est)}
                              className="px-2.5 py-1 bg-white hover:bg-[#F5F6F8] text-[#1B365D] border border-[#CBD5E0] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Consultar expediente completo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Expediente</span>
                            </button>

                            {/* Botón Firma Directiva */}
                            {!actaFirmada ? (
                              <button
                                onClick={() => onFirmarActaDirectivo(est.id)}
                                disabled={!horasCumplidas}
                                className={`px-3 py-1 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                                  horasCumplidas
                                    ? 'bg-[#1B365D] hover:bg-[#142A4A] shadow-sm'
                                    : 'bg-[#CBD5E0] text-[#718096] cursor-not-allowed'
                                }`}
                                title={
                                  horasCumplidas
                                    ? 'Firmar acta de acreditación y titulación'
                                    : 'Requiere cumplir el 100% de horas obligatorias'
                                }
                              >
                                <FileCheck className="w-3.5 h-3.5 text-[#E85D04]" />
                                <span>Firmar Acta</span>
                              </button>
                            ) : (
                              <span className="text-[#0ECB81] text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Acreditado</span>
                              </span>
                            )}
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
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { UsuarioApp, EmpresaPractica, EntradaBitacora } from '../types';
import {
  Building2,
  GraduationCap,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface AdminChartsDashboardProps {
  usuarios: UsuarioApp[];
  empresas: EmpresaPractica[];
  entradas: EntradaBitacora[];
}

const PALETA_COLORES = [
  '#1B365D', // Azul Marino Institucional
  '#E85D04', // Naranja Institucional
  '#137333', // Verde institucional
  '#2B6CB0', // Azul medio
  '#C05621', // Ámbar oscuro
  '#2C7A7B', // Teal
  '#6B46C1', // Violeta
  '#4A5568', // Gris
];

export const AdminChartsDashboard: React.FC<AdminChartsDashboardProps> = ({
  usuarios,
  empresas,
  entradas,
}) => {
  const [tipoGraficaEmpresas, setTipoGraficaEmpresas] = useState<'barras' | 'pie'>('barras');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todas');
  const [filtroEstadoCumplimiento, setFiltroEstadoCumplimiento] = useState<'todos' | 'completados' | 'en_progreso'>('todos');

  const estudiantes = useMemo(() => usuarios.filter((u) => u.rol === 'alumno'), [usuarios]);

  // 1. CÓMPUTO DE DATOS POR EMPRESA
  const datosEmpresas = useMemo(() => {
    const mapaEmpresas = new Map<
      string,
      {
        id: string;
        nombre: string;
        horasValidadas: number;
        horasPendientes: number;
        horasObservadas: number;
        horasTotales: number;
        alumnosCount: number;
      }
    >();

    empresas.forEach((emp) => {
      mapaEmpresas.set(emp.nombre, {
        id: emp.id,
        nombre: emp.nombre,
        horasValidadas: 0,
        horasPendientes: 0,
        horasObservadas: 0,
        horasTotales: 0,
        alumnosCount: estudiantes.filter((a) => a.empresaId === emp.id || a.empresaNombre === emp.nombre).length,
      });
    });

    entradas.forEach((entrada) => {
      const nombreEmpresa = entrada.empresaNombre || 'Sin Empresa Asignada';
      if (!mapaEmpresas.has(nombreEmpresa)) {
        mapaEmpresas.set(nombreEmpresa, {
          id: entrada.empresaId || 'otra',
          nombre: nombreEmpresa,
          horasValidadas: 0,
          horasPendientes: 0,
          horasObservadas: 0,
          horasTotales: 0,
          alumnosCount: 0,
        });
      }

      const info = mapaEmpresas.get(nombreEmpresa)!;
      const horas = entrada.horasRegistradas || 0;
      info.horasTotales += horas;

      if (entrada.estadoVerificacion === 'Verificado') {
        info.horasValidadas += horas;
      } else if (entrada.estadoVerificacion === 'Observado') {
        info.horasObservadas += horas;
      } else {
        info.horasPendientes += horas;
      }
    });

    return Array.from(mapaEmpresas.values()).sort((a, b) => b.horasTotales - a.horasTotales);
  }, [empresas, entradas, estudiantes]);

  // 2. CÓMPUTO DE DATOS POR ESTUDIANTE
  const datosEstudiantes = useMemo(() => {
    return estudiantes.map((est) => {
      const entradasEstudiante = entradas.filter(
        (e) =>
          e.autorId === est.id ||
          e.autorEmail === est.email ||
          (e.rutAlumno && est.rut && e.rutAlumno === est.rut)
      );

      const horasValidadas = entradasEstudiante
        .filter((e) => e.estadoVerificacion === 'Verificado')
        .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

      const horasPendientes = entradasEstudiante
        .filter((e) => e.estadoVerificacion !== 'Verificado')
        .reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);

      const meta = est.horasRequeridas || 360;
      const porcentajeCumplido = Math.min(100, Math.round((horasValidadas / meta) * 100));
      const horasFaltantes = Math.max(0, meta - horasValidadas);
      const esCompletado = horasValidadas >= meta;

      const nombreCorto = est.nombre.split(' ').slice(0, 2).join(' ');

      return {
        id: est.id,
        nombre: est.nombre,
        nombreCorto,
        rut: est.rut || 'Sin RUT',
        empresaId: est.empresaId,
        empresaNombre: est.empresaNombre || 'Sin Empresa',
        carrera: est.carrera || est.especialidad || 'Electrotecnia',
        horasValidadas,
        horasPendientes,
        meta,
        porcentajeCumplido,
        horasFaltantes,
        esCompletado,
      };
    });
  }, [estudiantes, entradas]);

  // Filtrado dinámico de estudiantes
  const estudiantesFiltrados = useMemo(() => {
    return datosEstudiantes.filter((est) => {
      if (filtroEmpresa !== 'todas' && est.empresaId !== filtroEmpresa) {
        return false;
      }
      if (filtroEstadoCumplimiento === 'completados' && !est.esCompletado) {
        return false;
      }
      if (filtroEstadoCumplimiento === 'en_progreso' && est.esCompletado) {
        return false;
      }
      return true;
    });
  }, [datosEstudiantes, filtroEmpresa, filtroEstadoCumplimiento]);

  // 3. MÉTRICAS GLOBALES
  const metricas = useMemo(() => {
    const totalHorasRequeridas = estudiantes.reduce((acc, curr) => acc + (curr.horasRequeridas || 360), 0);
    const totalHorasAcreditadas = datosEstudiantes.reduce((acc, curr) => acc + curr.horasValidadas, 0);
    const totalHorasPendientes = datosEstudiantes.reduce((acc, curr) => acc + curr.horasPendientes, 0);
    const totalHorasRegistradas = totalHorasAcreditadas + totalHorasPendientes;
    const cumplimientoGlobalPct =
      totalHorasRequeridas > 0 ? Math.round((totalHorasAcreditadas / totalHorasRequeridas) * 100) : 0;
    const estudiantesCompletados = datosEstudiantes.filter((e) => e.esCompletado).length;
    const promedioHorasPorAlumno =
      estudiantes.length > 0 ? Math.round(totalHorasAcreditadas / estudiantes.length) : 0;

    return {
      totalEstudiantes: estudiantes.length,
      totalHorasRequeridas,
      totalHorasAcreditadas,
      totalHorasPendientes,
      totalHorasRegistradas,
      cumplimientoGlobalPct,
      estudiantesCompletados,
      promedioHorasPorAlumno,
      empresasActivas: empresas.length,
    };
  }, [estudiantes, datosEstudiantes, empresas]);

  // Tooltip personalizado para gráfica de empresas
  const CustomTooltipEmpresas = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#CBD5E0] p-3.5 rounded-xl shadow-lg text-xs space-y-1.5 z-50">
          <p className="font-bold text-[#1B365D] border-b border-[#E2E8F0] pb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#E85D04]" />
            {data.nombre}
          </p>
          <div className="space-y-1 font-mono">
            <p className="text-[#137333] flex justify-between gap-4">
              <span>Horas Acreditadas (Visadas):</span>
              <strong className="font-bold">{data.horasValidadas} hrs</strong>
            </p>
            <p className="text-[#E85D04] flex justify-between gap-4">
              <span>Horas Pendientes:</span>
              <strong className="font-bold">{data.horasPendientes} hrs</strong>
            </p>
            <p className="text-[#4A5568] flex justify-between gap-4 border-t border-[#E2E8F0] pt-1">
              <span>Total Horas Registradas:</span>
              <strong className="text-[#1A202C]">{data.horasTotales} hrs</strong>
            </p>
            <p className="text-[#1B365D] flex justify-between gap-4">
              <span>Practicantes Asignados:</span>
              <strong className="font-bold">{data.alumnosCount} alumnos</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para gráfica de estudiantes
  const CustomTooltipEstudiantes = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#CBD5E0] p-3.5 rounded-xl shadow-lg text-xs space-y-2 z-50 max-w-xs">
          <div>
            <p className="font-bold text-[#1B365D] text-sm leading-tight">{data.nombre}</p>
            <p className="text-xs font-mono text-[#E85D04] font-semibold">RUT: {data.rut}</p>
          </div>
          <div className="text-xs text-[#4A5568] border-t border-[#E2E8F0] pt-1">
            <span className="block font-medium text-[#1A202C] truncate">{data.empresaNombre}</span>
            <span className="block text-[11px] text-[#718096]">{data.carrera}</span>
          </div>
          <div className="space-y-1 font-mono pt-1 border-t border-[#E2E8F0]">
            <div className="flex justify-between text-[#137333]">
              <span>Acreditadas:</span>
              <strong>{data.horasValidadas} / {data.meta} hrs</strong>
            </div>
            <div className="flex justify-between text-[#E85D04]">
              <span>Por Aprobar:</span>
              <strong>{data.horasPendientes} hrs</strong>
            </div>
            <div className="flex justify-between text-[#1B365D]">
              <span>Progreso:</span>
              <strong>{data.porcentajeCumplido}%</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* 1. CABECERA Y KPI RESUMEN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#137333]" />
            <h2 className="text-lg font-bold text-[#1B365D] tracking-tight">
              Panel de Control & Indicadores Curriculares
            </h2>
          </div>
          <p className="text-xs text-[#4A5568]">
            Visualización analítica en tiempo real de avance de prácticas del Liceo Industrial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E0] text-xs font-semibold text-[#4A5568] shadow-xs">
            Cohorte: <strong className="text-[#1B365D]">{estudiantes.length} Estudiantes</strong>
          </span>
        </div>
      </div>

      {/* Grid de KPIs Superiores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#CEEAD6] rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#4A5568] mb-1">
            <span className="text-xs uppercase tracking-wider text-[#137333] font-bold">
              Horas Acreditadas
            </span>
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#137333]">
              {metricas.totalHorasAcreditadas}
            </span>
            <span className="text-xs font-mono text-[#4A5568]">
              / {metricas.totalHorasRequeridas} hrs
            </span>
          </div>
          <div className="mt-2 w-full bg-[#F5F6F8] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
            <div
              className="bg-[#137333] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metricas.cumplimientoGlobalPct)}%` }}
            />
          </div>
          <span className="text-xs text-[#4A5568] mt-1.5 block font-medium">
            {metricas.cumplimientoGlobalPct}% del total curricular exigido
          </span>
        </div>

        <div className="bg-white border border-[#FFD8BF] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#4A5568] mb-1">
            <span className="text-xs uppercase tracking-wider text-[#E85D04] font-bold">
              Horas Por Validar
            </span>
            <Clock className="w-4 h-4 text-[#E85D04]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#E85D04]">
              {metricas.totalHorasPendientes}
            </span>
            <span className="text-xs font-mono text-[#4A5568]">hrs pendientes</span>
          </div>
          <p className="text-xs text-[#4A5568] mt-2 font-medium">
            Registradas en bitácoras pendientes de visado docente
          </p>
        </div>

        <div className="bg-white border border-[#CBD5E0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#4A5568] mb-1">
            <span className="text-xs uppercase tracking-wider text-[#1B365D] font-bold">
              Tasa de Titulación
            </span>
            <GraduationCap className="w-4 h-4 text-[#1B365D]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#1B365D]">
              {metricas.estudiantesCompletados}
            </span>
            <span className="text-xs font-mono text-[#4A5568]">
              de {metricas.totalEstudiantes} alumnos
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-2 font-medium">
            Han completado 100% de las horas requeridas
          </p>
        </div>

        <div className="bg-white border border-[#CBD5E0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#4A5568] mb-1">
            <span className="text-xs uppercase tracking-wider text-[#1A202C] font-bold">
              Centros en Convenio
            </span>
            <Building2 className="w-4 h-4 text-[#E85D04]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#1A202C]">
              {metricas.empresasActivas}
            </span>
            <span className="text-xs font-mono text-[#4A5568]">empresas activas</span>
          </div>
          <p className="text-xs text-[#4A5568] mt-2 font-medium">
            Promedio: {metricas.promedioHorasPorAlumno} hrs por practicante
          </p>
        </div>
      </div>

      {/* 2. GRÁFICA 1: DISTRIBUCIÓN DE HORAS POR EMPRESA */}
      <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#E85D04]" />
              <h3 className="font-bold text-sm sm:text-base text-[#1B365D]">
                Distribución de Horas por Centro de Práctica (Empresa)
              </h3>
            </div>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Cómputo comparativo de horas acreditadas visadas vs horas pendientes por empresa colaboradora
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-[#F5F6F8] border border-[#CBD5E0] p-0.5 rounded-lg flex items-center">
              <button
                onClick={() => setTipoGraficaEmpresas('barras')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  tipoGraficaEmpresas === 'barras'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#1B365D]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Barras</span>
              </button>
              <button
                onClick={() => setTipoGraficaEmpresas('pie')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  tipoGraficaEmpresas === 'pie'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#1B365D]'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>Distribución %</span>
              </button>
            </div>
          </div>
        </div>

        {datosEmpresas.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#4A5568] italic">
            No hay registros suficientes de horas ni empresas para generar el gráfico.
          </div>
        ) : tipoGraficaEmpresas === 'barras' ? (
          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosEmpresas}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  interval={0}
                  tickFormatter={(val: string) => (val.length > 16 ? `${val.slice(0, 15)}…` : val)}
                  stroke="#CBD5E0"
                />
                <YAxis
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  stroke="#CBD5E0"
                  tickFormatter={(val: number) => `${val}h`}
                />
                <Tooltip content={<CustomTooltipEmpresas />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="horasValidadas"
                  name="Horas Visadas (Acreditadas)"
                  fill="#1B365D"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="horasPendientes"
                  name="Horas Por Validar"
                  fill="#E85D04"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosEmpresas.filter((e) => e.horasTotales > 0)}
                    dataKey="horasTotales"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {datosEmpresas.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETA_COLORES[index % PALETA_COLORES.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipEmpresas />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda y Desglose de Porcentajes */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              <span className="text-xs font-bold text-[#1B365D] uppercase block mb-1">
                Participación por Centro de Práctica:
              </span>
              {datosEmpresas.map((emp, idx) => {
                const pct =
                  metricas.totalHorasRegistradas > 0
                    ? Math.round((emp.horasTotales / metricas.totalHorasRegistradas) * 100)
                    : 0;

                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#F5F6F8] border border-[#CBD5E0] text-xs font-medium"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[200px]">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: PALETA_COLORES[idx % PALETA_COLORES.length] }}
                      />
                      <span className="text-[#1A202C] font-semibold truncate">{emp.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#4A5568]">{emp.horasTotales} hrs</span>
                      <span className="text-[#E85D04] font-bold w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. GRÁFICA 2: PROGRESO DE CUMPLIMIENTO DE HORAS DE ESTUDIANTES */}
      <div className="bg-white rounded-2xl border border-[#CBD5E0] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#1B365D]" />
              <h3 className="font-bold text-sm sm:text-base text-[#1B365D]">
                Progreso de Cumplimiento de Horas por Estudiante
              </h3>
            </div>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Monitoreo del avance hacia la meta de titulación (exigencia curricular de 360 horas)
            </p>
          </div>

          {/* Filtros para la gráfica de estudiantes */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Empresa */}
            <div className="flex items-center gap-1.5 bg-[#F5F6F8] border border-[#CBD5E0] px-2.5 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-[#4A5568]" />
              <select
                value={filtroEmpresa}
                onChange={(e) => setFiltroEmpresa(e.target.value)}
                className="bg-transparent text-[#1A202C] focus:outline-hidden text-xs cursor-pointer font-medium"
              >
                <option value="todas">Todos los centros</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-1 bg-[#F5F6F8] border border-[#CBD5E0] p-1 rounded-xl text-xs">
              <button
                onClick={() => setFiltroEstadoCumplimiento('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  filtroEstadoCumplimiento === 'todos'
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#1B365D]'
                }`}
              >
                Todos ({datosEstudiantes.length})
              </button>
              <button
                onClick={() => setFiltroEstadoCumplimiento('completados')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  filtroEstadoCumplimiento === 'completados'
                    ? 'bg-[#137333] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#137333]'
                }`}
              >
                Completados
              </button>
              <button
                onClick={() => setFiltroEstadoCumplimiento('en_progreso')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  filtroEstadoCumplimiento === 'en_progreso'
                    ? 'bg-[#E85D04] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#E85D04]'
                }`}
              >
                En Progreso
              </button>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras por Estudiante */}
        {estudiantesFiltrados.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#4A5568] italic">
            No hay estudiantes que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="w-full h-80 sm:h-96 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={estudiantesFiltrados}
                margin={{ top: 15, right: 20, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="nombreCorto"
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                  stroke="#CBD5E0"
                />
                <YAxis
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  stroke="#CBD5E0"
                  tickFormatter={(val: number) => `${val}h`}
                  domain={[0, (dataMax: number) => Math.max(380, dataMax + 20)]}
                />
                <Tooltip content={<CustomTooltipEstudiantes />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="horasValidadas"
                  name="Horas Visadas (Acreditadas)"
                  fill="#1B365D"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="horasPendientes"
                  name="Horas Por Validar"
                  fill="#E85D04"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabla Detallada de Progreso de Estudiantes */}
        <div className="pt-3 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#1B365D] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#E85D04]" />
              Matriz de Acreditación Curricular Individual
            </h4>
            <span className="text-xs text-[#4A5568] font-medium">
              Mostrando {estudiantesFiltrados.length} estudiantes
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#CBD5E0]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] border-b border-[#CBD5E0] text-[#1B365D] font-bold">
                <tr>
                  <th className="p-3">Estudiante & RUT</th>
                  <th className="p-3">Centro de Práctica</th>
                  <th className="p-3 text-center">Horas Acreditadas</th>
                  <th className="p-3 text-center">Por Validar</th>
                  <th className="p-3 text-center">Meta Exigida</th>
                  <th className="p-3">Porcentaje de Avance</th>
                  <th className="p-3 text-center">Dictamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1A202C]">
                {estudiantesFiltrados.map((est) => {
                  return (
                    <tr key={est.id} className="hover:bg-[#F5F6F8] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-[#1A202C]">{est.nombre}</div>
                        <div className="text-xs font-mono text-[#E85D04] font-semibold">{est.rut}</div>
                      </td>
                      <td className="p-3 max-w-[180px]">
                        <div className="truncate text-[#1A202C] font-semibold">{est.empresaNombre}</div>
                        <div className="text-[11px] text-[#4A5568] truncate">{est.carrera}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#137333]">
                        {est.horasValidadas} hrs
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-[#E85D04]">
                        {est.horasPendientes > 0 ? `+${est.horasPendientes} hrs` : '0'}
                      </td>
                      <td className="p-3 text-center font-mono text-[#4A5568]">
                        {est.meta} hrs
                      </td>
                      <td className="p-3 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-[#4A5568]">{est.horasValidadas}/{est.meta}</span>
                          <span
                            className={
                              est.esCompletado
                                ? 'text-[#137333] font-bold'
                                : est.porcentajeCumplido >= 50
                                ? 'text-[#E85D04] font-bold'
                                : 'text-[#C5221F] font-bold'
                            }
                          >
                            {est.porcentajeCumplido}%
                          </span>
                        </div>
                        <div className="w-full bg-[#F5F6F8] rounded-full h-2 overflow-hidden border border-[#CBD5E0]">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              est.esCompletado
                                ? 'bg-[#137333]'
                                : est.porcentajeCumplido >= 50
                                ? 'bg-[#E85D04]'
                                : 'bg-[#C5221F]'
                            }`}
                            style={{ width: `${Math.min(100, est.porcentajeCumplido)}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {est.esCompletado ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cumplido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#E85D04] border border-[#FFD8BF]">
                            <Clock className="w-3.5 h-3.5" />
                            {est.horasFaltantes}h restantes
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

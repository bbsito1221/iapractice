import React, { useState } from 'react';
import { UsuarioApp, EvaluacionDesempenoLaboral } from '../types';
import { Award, CheckCircle2, Star, X, Building2, User, AlertCircle, Save } from 'lucide-react';
import { LiceoLogo } from './LiceoLogo';
import { handleInputFocusScroll } from '../utils/keyboardHelper';

interface EvaluacionLaboralModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumno: UsuarioApp;
  tutorActual: UsuarioApp;
  onGuardarEvaluacion: (alumnoId: string, evaluacion: EvaluacionDesempenoLaboral) => void;
}

export const EvaluacionLaboralModal: React.FC<EvaluacionLaboralModalProps> = ({
  isOpen,
  onClose,
  alumno,
  tutorActual,
  onGuardarEvaluacion,
}) => {
  const evalExistente = alumno.evaluacionEmpresa;

  const [puntualidad, setPuntualidad] = useState<number>(evalExistente?.puntualidadAsistencia || 7.0);
  const [seguridad, setSeguridad] = useState<number>(evalExistente?.cumplimientoNormasSeguridad || 6.8);
  const [calidadTecnica, setCalidadTecnica] = useState<number>(evalExistente?.calidadTrabajoTecnico || 6.5);
  const [iniciativa, setIniciativa] = useState<number>(evalExistente?.iniciativaAdaptabilidad || 6.7);
  const [trabajoEquipo, setTrabajoEquipo] = useState<number>(evalExistente?.trabajoEquipoRelaciones || 7.0);
  const [observaciones, setObservaciones] = useState<string>(evalExistente?.observacionesFinales || '');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  if (!isOpen) return null;

  const promedioCalculado = Number(
    ((puntualidad + seguridad + calidadTecnica + iniciativa + trabajoEquipo) / 5).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluacionFinal: EvaluacionDesempenoLaboral = {
      puntualidadAsistencia: puntualidad,
      cumplimientoNormasSeguridad: seguridad,
      calidadTrabajoTecnico: calidadTecnica,
      iniciativaAdaptabilidad: iniciativa,
      trabajoEquipoRelaciones: trabajoEquipo,
      promedioFinal: promedioCalculado,
      observacionesFinales: observaciones,
      fechaEvaluacion: new Date().toISOString().split('T')[0],
      tutorFirmaNombre: tutorActual.nombre,
      completada: true,
    };

    onGuardarEvaluacion(alumno.id, evaluacionFinal);
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
      onClose();
    }, 1200);
  };

  const getEscalaLabel = (nota: number) => {
    if (nota >= 6.5) return 'Excelente / Sobresaliente';
    if (nota >= 5.5) return 'Muy Bueno / Cumple con distinción';
    if (nota >= 4.5) return 'Aceptable / Cumple lo requerido';
    if (nota >= 4.0) return 'Mínimo de Aprobación';
    return 'Insuficiente / Requiere Refuerzo';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#CBD5E0] overflow-hidden flex flex-col my-auto max-h-[92dvh] sm:max-h-[90vh]">
        {/* Cabecera de Evaluación Laboral */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#CBD5E0] bg-[#1B365D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E85D04]">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Pauta de Evaluación Laboral
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E85D04] text-white uppercase tracking-wider">
                  Maestro Guía
                </span>
              </div>
              <p className="text-xs text-white/80">
                Pauta reglamentaria de desempeño en la empresa para proceso de titulación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Datos del Practicante y Centro de Práctica */}
        <div className="p-4 sm:p-5 bg-[#F5F6F8] border-b border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-[#1B365D] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#718096] block text-[11px]">Estudiante Practicante:</span>
              <strong className="text-[#1B365D] text-sm">{alumno.nombre}</strong>
              <div className="text-[#4A5568] mt-0.5">
                RUT: <span className="font-mono font-semibold">{alumno.rut || 'S/R'}</span> &bull; {alumno.curso || '4° Medio'}
              </div>
              <div className="text-[#E85D04] font-semibold mt-0.5">
                Especialidad: {alumno.especialidad || 'Electricidad'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-[#E85D04] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#718096] block text-[11px]">Centro de Práctica:</span>
              <strong className="text-[#2D3748] text-sm">{alumno.empresaNombre || tutorActual.empresaNombre || 'Empresa Colaboradora'}</strong>
              <div className="text-[#4A5568] mt-0.5">
                Evaluador: <span className="font-semibold">{tutorActual.nombre}</span>
              </div>
              <div className="text-[#718096] mt-0.5">
                Horas acreditadas: <strong className="text-[#1B365D] font-mono">{alumno.horasAcumuladas || 0} / {alumno.horasRequeridas || 360} hrs</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Evaluación por Criterios */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {guardadoExitoso && (
            <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Pauta de evaluación laboral guardada y firmada exitosamente!</span>
            </div>
          )}

          <div className="text-[#4A5568] text-xs leading-relaxed bg-[#FFF7ED] p-3 rounded-xl border border-[#FFEDD5]">
            <strong className="text-[#C2410C]">Instrucciones para el Maestro Guía:</strong> Califique el desempeño real observado en la faena en una escala tradicional de <strong>1.0 (Muy Deficiente)</strong> a <strong>7.0 (Excelente)</strong>. Esta nota incide directamente en el informe final de titulación del estudiante.
          </div>

          {/* Criterio 1: Puntualidad y Asistencia */}
          <div className="p-3.5 rounded-xl border border-[#CBD5E0] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B365D] text-xs">
                1. Asistencia, Puntualidad y Cumplimiento de Horarios
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-[#E85D04] px-2 py-0.5 rounded bg-[#FFF7ED] border border-[#FFEDD5]">
                  {puntualidad.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#718096]">
              Cumplimiento estricto del horario de entrada, salida, colación y continuidad en los turnos asignados.
            </p>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.1"
              value={puntualidad}
              onChange={(e) => setPuntualidad(parseFloat(e.target.value))}
              className="w-full accent-[#E85D04] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#718096] font-mono">
              <span>1.0</span>
              <span className="font-bold text-[#1B365D]">{getEscalaLabel(puntualidad)}</span>
              <span>7.0</span>
            </div>
          </div>

          {/* Criterio 2: Seguridad y Prevención de Riesgos */}
          <div className="p-3.5 rounded-xl border border-[#CBD5E0] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B365D] text-xs">
                2. Cumplimiento de Normas de Seguridad y Uso de EPP
              </label>
              <span className="text-sm font-black font-mono text-[#E85D04] px-2 py-0.5 rounded bg-[#FFF7ED] border border-[#FFEDD5]">
                {seguridad.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-[#718096]">
              Uso correcto de elementos de protección personal, respeto por protocolos de prevención y faena segura.
            </p>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.1"
              value={seguridad}
              onChange={(e) => setSeguridad(parseFloat(e.target.value))}
              className="w-full accent-[#E85D04] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#718096] font-mono">
              <span>1.0</span>
              <span className="font-bold text-[#1B365D]">{getEscalaLabel(seguridad)}</span>
              <span>7.0</span>
            </div>
          </div>

          {/* Criterio 3: Calidad Técnica */}
          <div className="p-3.5 rounded-xl border border-[#CBD5E0] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B365D] text-xs">
                3. Calidad del Trabajo Técnico y Habilidades Prácticas
              </label>
              <span className="text-sm font-black font-mono text-[#E85D04] px-2 py-0.5 rounded bg-[#FFF7ED] border border-[#FFEDD5]">
                {calidadTecnica.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-[#718096]">
              Precisión técnica en el manejo de herramientas, montaje, cableado, diagnóstico y resolución de problemas según su especialidad.
            </p>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.1"
              value={calidadTecnica}
              onChange={(e) => setCalidadTecnica(parseFloat(e.target.value))}
              className="w-full accent-[#E85D04] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#718096] font-mono">
              <span>1.0</span>
              <span className="font-bold text-[#1B365D]">{getEscalaLabel(calidadTecnica)}</span>
              <span>7.0</span>
            </div>
          </div>

          {/* Criterio 4: Iniciativa y Adaptabilidad */}
          <div className="p-3.5 rounded-xl border border-[#CBD5E0] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B365D] text-xs">
                4. Iniciativa, Proactividad y Disposición a Aprender
              </label>
              <span className="text-sm font-black font-mono text-[#E85D04] px-2 py-0.5 rounded bg-[#FFF7ED] border border-[#FFEDD5]">
                {iniciativa.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-[#718096]">
              Autonomía progresiva, interés por adquirir nuevas destrezas y actitud proactiva frente a desafíos laborales.
            </p>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.1"
              value={iniciativa}
              onChange={(e) => setIniciativa(parseFloat(e.target.value))}
              className="w-full accent-[#E85D04] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#718096] font-mono">
              <span>1.0</span>
              <span className="font-bold text-[#1B365D]">{getEscalaLabel(iniciativa)}</span>
              <span>7.0</span>
            </div>
          </div>

          {/* Criterio 5: Trabajo en Equipo */}
          <div className="p-3.5 rounded-xl border border-[#CBD5E0] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B365D] text-xs">
                5. Trabajo en Equipo y Relaciones Interpersonales
              </label>
              <span className="text-sm font-black font-mono text-[#E85D04] px-2 py-0.5 rounded bg-[#FFF7ED] border border-[#FFEDD5]">
                {trabajoEquipo.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-[#718096]">
              Comunicación con superiores y compañeros de faena, respeto jerárquico y colaboración solidaria.
            </p>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.1"
              value={trabajoEquipo}
              onChange={(e) => setTrabajoEquipo(parseFloat(e.target.value))}
              className="w-full accent-[#E85D04] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#718096] font-mono">
              <span>1.0</span>
              <span className="font-bold text-[#1B365D]">{getEscalaLabel(trabajoEquipo)}</span>
              <span>7.0</span>
            </div>
          </div>

          {/* Promedio Final Destacado */}
          <div className="p-4 rounded-xl bg-[#1B365D] text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs text-white/80 block uppercase tracking-wider font-mono">
                Nota Final de Evaluación de Práctica
              </span>
              <span className="text-sm font-semibold text-white">
                {getEscalaLabel(promedioCalculado)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-[#E85D04]">
                {promedioCalculado.toFixed(1)}
              </span>
              <span className="text-[11px] text-white/70 block">Escala 1.0 - 7.0</span>
            </div>
          </div>

          {/* Observaciones Generales del Tutor */}
          <div>
            <label className="block text-xs font-bold text-[#2D3748] mb-1.5">
              Observaciones Cualitativas y Juicio del Maestro Guía
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onFocus={handleInputFocusScroll}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Describa el comportamiento general, fortalezas técnicas demostradas y recomendaciones para la titulación del practicante..."
              className="w-full p-3 bg-[#F5F6F8] border border-[#CBD5E0] rounded-xl text-base sm:text-xs text-[#2D3748] focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/15"
            />
          </div>

          {/* Pie con Firma */}
          <div className="p-3 bg-[#F5F6F8] rounded-xl border border-[#CBD5E0] text-[11px] text-[#718096] flex items-center justify-between">
            <div>
              <span>Firma y Visado Electrónico:</span>
              <strong className="text-[#1B365D] ml-1">{tutorActual.nombre}</strong>
            </div>
            <span className="font-mono">Fecha: {new Date().toLocaleDateString('es-CL')}</span>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-[#CBD5E0] text-[#4A5568] hover:bg-[#F5F6F8] rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E85D04] hover:bg-[#D04F00] text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#E85D04]/25 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Certificar Evaluación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

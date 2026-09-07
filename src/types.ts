export type EstadoEntrada = 'Completado' | 'En progreso' | 'Pendiente' | 'Bloqueado';

export interface EntradaBitacora {
  id: number;
  titulo: string;
  categoria: string;
  fecha: string;
  contenido: string;
  tags: string[];
  estado: EstadoEntrada;
  creadoEn: string;
}

export interface FlaskFile {
  nombre: string;
  ruta: string;
  lenguaje: 'python' | 'html' | 'css' | 'javascript' | 'markdown' | 'text';
  contenido: string;
  descripcion: string;
}

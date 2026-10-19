export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  capacidad: number;
  precioNoche: number;
  descripcion: string | null;
  estado: 'disponible' | 'ocupada' | 'pendiente_limpieza';
}
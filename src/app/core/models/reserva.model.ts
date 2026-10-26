export interface Cliente {
  id?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  correo?: string | null;
}

export interface Reserva {
  id?: number;
  codigo: string;
  cliente: Cliente;
  habitacion: import('./habitacion.model').Habitacion;
  cantidadHuespedes: number;
  fechaEntrada: string;
  fechaSalida: string;
  total: number;
  estado: string;
  estadoPago: string;
  fechaCreacion?: string;
}

export interface ReservaRequest {
  habitacionId: number;
  cantidadHuespedes: number;
  fechaEntrada: string;
  fechaSalida: string;
}

export interface ReservaResponse {
  codigo: string;
  estado: string;
  total: number;
}
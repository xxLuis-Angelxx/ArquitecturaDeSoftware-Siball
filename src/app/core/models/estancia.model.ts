import { Reserva } from './reserva.model';

export interface Estancia {
  id: number;
  reserva: Reserva;
  fechaCheckin: string;
  fechaCheckout: string | null;
  estado: 'en_curso' | 'cerrada';
}

export interface CheckinRequest {
  codigoReserva: string;
}
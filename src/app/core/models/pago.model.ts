export interface Pago {
  id: number;
  reserva: {
    id: number;
    codigo: string;
    total: number;
    estadoPago: string;
  };
  monto: number;
  metodo: string;
  referencia: string | null;
  fechaPago: string;
}

export interface PagoRequest {
  codigoReserva: string;
  monto: number;
  metodo: string;
  referencia?: string;
}

export interface PagoResponse {
  pagoId: number;
  comprobante: string;
  monto: number;
  saldoPendiente: number;
  estadoPago: string;
}
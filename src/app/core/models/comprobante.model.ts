export interface Comprobante {
  id: number;
  numero: string;
  monto: number;
  fechaEmision: string;
  pago?: {
    id: number;
    monto?: number;
    metodo?: string;
    referencia?: string | null;
    fechaPago?: string;
    reserva?: {
      codigo?: string;
      cliente?: {
        nombres?: string;
        apellidos?: string;
      };
    };
  };
}
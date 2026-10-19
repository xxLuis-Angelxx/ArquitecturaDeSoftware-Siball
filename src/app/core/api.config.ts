export const API_CONFIG = {
  baseUrl: 'http://localhost:8080/api',

  endpoints: {
    habitaciones: '/habitaciones',
    reservas: '/reservas',
    estancias: '/estancias',
    pagos: '/pagos',
    comprobantes: '/comprobantes'
  }
} as const;
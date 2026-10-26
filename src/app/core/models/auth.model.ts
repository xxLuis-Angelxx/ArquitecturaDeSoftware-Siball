export interface UsuarioAutenticado {
  id: number;
  correo: string;
  rol: string;
  nombres: string | null;
  apellidos: string | null;
}

export interface AuthResponse {
  token: string;
  tipoToken: string;
  expiraEnSegundos: number;
  usuario: UsuarioAutenticado;
}

export interface RegistroRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo: string;
  password: string;
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Habitacion } from '../models/habitacion.model';
import { API_CONFIG } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private readonly http = inject(HttpClient);
  private readonly url = API_CONFIG.baseUrl + API_CONFIG.endpoints.habitaciones;

  listar(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.url);
  }

  buscarPorId(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.url}/${id}`);
  }

  buscarDisponibles(
    fechaEntrada: string,
    fechaSalida: string
  ): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.url}/disponibles`, {
      params: { fechaEntrada, fechaSalida }
    });
  }

  crear(habitacion: Partial<Habitacion>): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.url, habitacion);
  }

  finalizarLimpieza(id: number): Observable<Habitacion> {
    return this.http.patch<Habitacion>(`${this.url}/${id}/limpieza`, {});
  }
}
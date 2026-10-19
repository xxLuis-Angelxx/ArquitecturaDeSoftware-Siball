import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../api.config';
import { Comprobante } from '../models/comprobante.model';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private readonly url =
    `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.comprobantes}`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(this.url);
  }

  buscarPorId(id: number): Observable<Comprobante> {
    return this.http.get<Comprobante>(`${this.url}/${id}`);
  }
}
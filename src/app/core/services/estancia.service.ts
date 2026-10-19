import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Estancia, CheckinRequest } from '../models/estancia.model';
import { API_CONFIG } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class EstanciaService {
  private readonly http = inject(HttpClient);
  private readonly url = API_CONFIG.baseUrl + API_CONFIG.endpoints.estancias;

  checkin(request: CheckinRequest): Observable<Estancia> {
    return this.http.post<Estancia>(
      `${this.url}/checkin`,
      request
    );
  }

  listar(estado?: string): Observable<Estancia[]> {
    let params = new HttpParams();

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<Estancia[]>(this.url, { params });
  }

  checkout(id: number): Observable<Estancia> {
    return this.http.post<Estancia>(
      `${this.url}/${id}/checkout`,
      {}
    );
  }
}
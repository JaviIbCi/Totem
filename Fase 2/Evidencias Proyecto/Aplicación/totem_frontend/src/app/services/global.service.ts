// src/app/services/log.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private apiUrl = 'https://backend.v2.totemvespucio.cl/api/totem';  // URL base de tu API
  private apiKey = '8AwrL1kYhlxmZYciXe5hjgnMqpcqCC';  // Tu API key

  constructor(private http: HttpClient) { }

  // Método para añadir un log de clic
  addClickLog(component: string, selection: string, log_category_details: string): Observable<any> {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey)
                                     .set('Content-Type', 'application/json');
    const body = { component, selection, log_category_details };
    return this.http.post(`${this.apiUrl}/logs/click`, body, { headers });
  }

  // Método para añadir un log de búsqueda
  addSearchLog(component: string, search_term: string, log_category_details: string): Observable<any> {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey)
                                     .set('Content-Type', 'application/json');
    const body = { component, search_term, log_category_details };
    return this.http.post(`${this.apiUrl}/logs/search`, body, { headers });
  }

}

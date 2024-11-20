import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformationService {

  private apiUrl = 'https://backend.v2.totemvespucio.cl/api/totem';  // URL base de tu API
  private apiKey = '8AwrL1kYhlxmZYciXe5hjgnMqpcqCC';  // Reemplaza con tu API key

  constructor(private http: HttpClient) {}

  // Obtener todas las páginas de información
  getAllInformationPages(): Observable<any> {
    const headers = new HttpHeaders().set('X-API-KEY', this.apiKey);
    return this.http.get(`${this.apiUrl}/information`, { headers });
  }

  // Obtener una página de información por nombre
  getInformationPageByName(name: string): Observable<any> {
    const headers = new HttpHeaders().set('X-API-KEY', this.apiKey);
    return this.http.get(`${this.apiUrl}/information/${name}`, { headers });
  }
}

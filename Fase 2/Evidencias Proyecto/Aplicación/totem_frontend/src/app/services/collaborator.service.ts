import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorService {
  private apiUrl = 'https://backend.v2.totemvespucio.cl/api/totem';  // URL del backend
  private apiKey = '8AwrL1kYhlxmZYciXe5hjgnMqpcqCC';  // API key del tótem

  constructor(private http: HttpClient) {}

  // Obtener todos los colaboradores
  getCollaborators(): Observable<any> {
    const headers = new HttpHeaders().set('X-API-KEY', this.apiKey);
    return this.http.get(`${this.apiUrl}/collaborators`, { headers });
  }

  // Obtener todas las categorías de colaboradores
  getCollaboratorCategories(): Observable<any> {
    const headers = new HttpHeaders().set('X-API-KEY', this.apiKey);
    return this.http.get(`${this.apiUrl}/collaborator-categories`, { headers });
  }
}

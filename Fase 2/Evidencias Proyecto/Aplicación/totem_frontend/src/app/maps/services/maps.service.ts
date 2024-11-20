// maps.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapsService {

  private apiUrl = 'https://backend.v2.totemvespucio.cl/api/totem';
  private apiKey = '8AwrL1kYhlxmZYciXe5hjgnMqpcqCC';

  constructor(private http: HttpClient) { }

  // Obtener todos los mapas
  getAllMaps(): Observable<any> {
    const headers = new HttpHeaders().set('X-API-KEY', this.apiKey);
    return this.http.get(`${this.apiUrl}/maps`, { headers });
  }

  // Obtener todos los puntos de interés
  getAllPointsOfInterest(): Observable<any> {
    const headers = new HttpHeaders().set('X-API-KEY', this.apiKey);
    return this.http.get(`${this.apiUrl}/points-of-interest`, { headers });
  }
}

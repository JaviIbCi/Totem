import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

  /**
   * Obtiene un mapa específico por su ID.
   * @param id ID del mapa.
   */
  getMapById(id: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.get<any>(`${this.apiUrl}maps/maps/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.getMapById(id));
      })
    );
  }

   /**
   * Obtiene un mapa específico por su ID.
   * @param id ID del mapa.
   */
   getInformationsCategorie(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.get<any>(`${this.apiUrl}informations/informations`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.getInformationsCategorie());
      })
    );
  }

  /**
   * Sube o actualiza la imagen de un mapa.
   * @param id ID del mapa.
   * @param file Archivo de imagen.
   */
  uploadMapImage(id: number, file: File): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
      // No es necesario establecer 'Content-Type' al usar FormData
    });

    const formData: FormData = new FormData();
    formData.append('map_image', file);

    return this.http.put<any>(`${this.apiUrl}maps/image/maps/${id}`, formData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.uploadMapImage(id, file));
      })
    );
  }

  /**
   * Obtiene todos los íconos de puntos de interés.
   */
  getAllPointIcons(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.get<any>(`${this.apiUrl}maps/point-icons`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.getAllPointIcons());
      })
    );
  }

  /**
   * Obtiene todos los puntos de interés.
   */
  getAllPointsOfInterest(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.get<any>(`${this.apiUrl}maps/points`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.getAllPointsOfInterest());
      })
    );
  }

  /**
   * Crea un nuevo punto de interés.
   * @param data Datos del punto de interés.
   */
  createPointOfInterest(data: any): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.post<any>(`${this.apiUrl}maps/points`, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        return this.renewService.handleTokenError(error, () => this.createPointOfInterest(data));
      })
    );
  }

  /**
   * Actualiza un punto de interés existente.
   * @param id ID del punto de interés.
   * @param data Datos actualizados del punto de interés.
   */
  updatePointOfInterest(id: number, data: any): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.put<any>(`${this.apiUrl}maps/points/${id}`, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return this.renewService.handleTokenError(error, () => this.updatePointOfInterest(id, data));
      })
    );
  }

  /**
   * Elimina un punto de interés.
   * @param id ID del punto de interés.
   */
  deletePointOfInterest(id: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = this.getHeaders(accessToken);

    return this.http.delete<any>(`${this.apiUrl}maps/points/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.deletePointOfInterest(id));
      })
    );
  }

  /**
   * Función auxiliar para crear los encabezados HTTP con el token de autorización.
   * @param token Token de acceso.
   */
  private getHeaders(token: string | null): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}

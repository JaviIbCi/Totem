import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';

@Injectable({
  providedIn: 'root'
})
export class InformationService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}


  getAllinformations(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get<any>(`${this.apiUrl}informations/informations`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.getAllinformations());
      })
    );
  }









  
}

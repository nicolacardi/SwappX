import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError, take, tap } from 'rxjs/operators';
import { _UT_Parametro } from '../_models/_UT_Parametro';

@Injectable({
  providedIn: 'root'
})

export class ParametriService {

  constructor(private http: HttpClient) { }

  
  load(): Observable<_UT_Parametro[]>{
    return this.http.get<_UT_Parametro[]>(environment.apiBaseUrl+'_UT_Parametri');
    //http://213.215.231.4/swappX/api/_UT_Parametri
  }

  loadParametro(parName: string): Observable<_UT_Parametro>{
    return this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/GetByParName/'+parName);
    //http://213.215.231.4/swappX/api/_UT_Parametri/GetByParName/AnnoCorrente
  }
 
}

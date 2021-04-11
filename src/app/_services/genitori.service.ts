import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class GenitoriService {

  constructor(private http: HttpClient) { }

  loadGenitori(): Observable<ALU_Genitore[]>{
    //console.log("sto caricando i dati");
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori');
  }

  // loadAlunniWithAlunni(): Observable<ALU_Genitore[]>{
  //   return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Alunni/GetAllWithParents');
  // }

  //per filtro e paginazione server side
  findGenitori(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Genitore[]>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori', {
      params: new HttpParams()
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
    });
  }
}

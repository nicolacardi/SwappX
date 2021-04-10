import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlunniService {

  constructor(private http: HttpClient) { }

  loadAlunni(): Observable<ALU_Alunno[]>{
    console.log("sto caricando gli alunni");
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni');
  }

  loadAlunniWithParents(): Observable<ALU_Alunno[]>{
    console.log("sto caricando gli alunni");
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/GetAllWithParents');
  }


  //per filtro e paginazione server side
  findAlunni(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni', {
      params: new HttpParams()
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
    });
  }


}

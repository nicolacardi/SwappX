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

  loadGenitori(idAlunno?: any): Observable<ALU_Genitore[]>{
    //console.log("loadGenitori");
    if (idAlunno == null || idAlunno == ""){
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori');
    } else {
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/GetAllByAlunno/'+idAlunno);
    }

  }

  loadGenitoriWithChildren(): Observable<ALU_Genitore[]>{
    //console.log("loadGenitoriWithChildren");
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/GetAllWithChildren');
  }

  loadAlunno(id: any): Observable<ALU_Genitore>{
    //console.log("sto caricando l'alunno");
    return this.http.get<ALU_Genitore>(environment.apiBaseUrl+'ALU_Genitori/'+id);
  }
  
  //per filtro e paginazione server side
  findAlunni(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Genitore[]>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori', {
      params: new HttpParams()
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
    });
  }
}

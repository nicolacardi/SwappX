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
    //console.log("loadAlunni");
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni');
  }

  loadAlunniWithParents(): Observable<ALU_Alunno[]>{
    //console.log("loadAlunniWithParents");
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/GetAllWithParents');
  }

  loadAlunno(id: any): Observable<ALU_Alunno>{
    //console.log("loadAlunno");
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/'+id);
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

  putAlunno(formData: any){
    console.log ("sto per chiamare la put", environment.apiBaseUrl  + 'ALU_Alunni/' + formData.id , formData);
    return this.http.put( environment.apiBaseUrl  + 'ALU_Alunni/' + formData.id , formData);    
  }

  postAlunno(formData: any){
    formData.id = 0;
    console.log ("Sto per chiamare la post", environment.apiBaseUrl  + 'ALU_Alunni/', formData);
    return this.http.post( environment.apiBaseUrl  + 'ALU_Alunni' , formData);  
  }

  deleteAlunno(id: number){
    console.log ("sto per chiamare la delete", environment.apiBaseUrl  + 'ALU_Alunni/' + id);
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Alunni/' + id);    
  }


}

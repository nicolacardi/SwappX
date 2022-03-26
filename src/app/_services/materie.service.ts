import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { environment } from 'src/environments/environment';
import { MAT_Materia } from '../_models/MAT_Materia';

@Injectable({
  providedIn: 'root'
})
export class MaterieService {

  constructor(private http: HttpClient) { }


  //***************************************************************MANCA TUTTO SULL'EF??? */

  list(): Observable<MAT_Materia[]>{
    return this.http.get<MAT_Materia[]>(environment.apiBaseUrl+'MAT_Materie');
    //http://213.215.231.4/swappX/api/MAT_Materie
  }

  listOrario(): Observable<MAT_Materia[]>{
    return this.http.get<MAT_Materia[]>(environment.apiBaseUrl+'MAT_Materie');
    //http://213.215.231.4/swappX/api/MAT_Materie/ListOrario
  }



  get(id: any): Observable<MAT_Materia>{
    return this.http.get<MAT_Materia>(environment.apiBaseUrl+'MAT_Materie/'+id);
    //http://213.215.231.4/swappX/api/MAT_Materie/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'MAT_Materie/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'MAT_Materie' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'MAT_Materie/' + id);    
  }



}

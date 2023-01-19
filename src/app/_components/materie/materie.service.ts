import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MAT_Materia } from '../../_models/MAT_Materia';

@Injectable({
  providedIn: 'root'
})
export class MaterieService {

  constructor(private http: HttpClient) { }

  list(): Observable<MAT_Materia[]>{
    return this.http.get<MAT_Materia[]>(environment.apiBaseUrl+'MAT_Materie');
    //http://213.215.231.4/swappX/api/MAT_Materie
  }

  listByClasseSezioneAnno(materiaID: any): Observable<MAT_Materia[]>{
    return this.http.get<MAT_Materia[]>(environment.apiBaseUrl+'MAT_Materie/ListByClasseSezioneAnno/'+materiaID);
    //http://213.215.231.4/swappX/api/MAT_Materie/ListByClasseSezioneAnno/2
    //TODO ATTENZIONE WS ERRATO: NON USA il classesezioneannoID!!! Fatto: alla prossima publish funziona
  }

  listByClasseSezioneAnnoANDDocente(materiaID: any, docenteID: any): Observable<MAT_Materia[]>{
    return this.http.get<MAT_Materia[]>(environment.apiBaseUrl+'MAT_Materie/ListByClasseSezioneAnnoAndDocente/'+materiaID+'/'+docenteID);
    //http://213.215.231.4/swappX/api/MAT_Materie/ListByClasseSezioneAnnoAndDocente/48/1005
  }

  get(materiaID: any): Observable<MAT_Materia>{
    return this.http.get<MAT_Materia>(environment.apiBaseUrl+'MAT_Materie/'+materiaID);
    //http://213.215.231.4/swappX/api/MAT_Materie/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'MAT_Materie/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    console.log ("formData", formData);
    return this.http.post( environment.apiBaseUrl  + 'MAT_Materie' , formData);  
  }

  delete(materiaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'MAT_Materie/' + materiaID);    
  }



}

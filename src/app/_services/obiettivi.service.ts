import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MAT_Obiettivo } from '../_models/MAT_Obiettivo';

@Injectable({
  providedIn: 'root'
})
export class ObiettiviService {

  constructor(private http: HttpClient) { }

  list(): Observable<MAT_Obiettivo[]>{
    return this.http.get<MAT_Obiettivo[]>(environment.apiBaseUrl+'MAT_Materie');
    //http://213.215.231.4/swappX/api/MAT_Obiettivo
  }

  listByClasse(classeID: number): Observable<MAT_Obiettivo[]>{
    return this.http.get<MAT_Obiettivo[]>(environment.apiBaseUrl+'MAT_Obiettivi/listByClasse/'+classeID);
    //http://213.215.231.4/swappX/api/MAT_Obiettivi/listByClasse/16
  }

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<MAT_Obiettivo[]>{
    return this.http.get<MAT_Obiettivo[]>(environment.apiBaseUrl+'MAT_Obiettivi/listByClasse/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/MAT_Obiettivi/listByClasse/16
  }

  listByMaterialAndClasse(materiaID: number, classeID: number): Observable<MAT_Obiettivo[]>{
    return this.http.get<MAT_Obiettivo[]>(environment.apiBaseUrl+'MAT_Obiettivi/ListByMateriaAndClasse/'+materiaID+'/'+classeID);
    //http://213.215.231.4/swappX/api/MAT_Obiettivi/ListByMaterialAndClasse/4/1
  }

  listByMaterialAndClasseSezioneAnno(materiaID: number, classeSezioneAnnoID: number): Observable<MAT_Obiettivo[]>{
    return this.http.get<MAT_Obiettivo[]>(environment.apiBaseUrl+'MAT_Obiettivi/ListByMateriaAndClasseSezioneAnno/'+materiaID+'/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/MAT_Obiettivi/ListByMaterialAndClasse/4/16
  }

  get(obiettivoID: any): Observable<MAT_Obiettivo>{
    return this.http.get<MAT_Obiettivo>(environment.apiBaseUrl+'MAT_Obiettivi/'+obiettivoID);
    //http://213.215.231.4/swappX/api/MAT_Obiettivi/2
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'MAT_Obiettivi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'MAT_Obiettivi' , formData);  
  }

  delete(obiettivoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'MAT_Obiettivi/' + obiettivoID);    
  }
}

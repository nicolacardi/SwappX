import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';


import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup, CLS_ClasseSezioneAnno_Sum } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { IscrizioniAddComponent } from './iscrizioni-add/iscrizioni-add.component';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniAnniService {

  constructor(private http: HttpClient) { }

  get(id: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/1
  } 

  //Sostituita dalla successiva, con parametro idDocente null oppure 0
  listByAnnoGroupByClasse(annoScolasticoID: any): Observable<CLS_ClasseSezioneAnnoGroup[]>{
    return this.http.get<CLS_ClasseSezioneAnnoGroup[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnnoGroupByClasse/'+annoScolasticoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnnoGroupByClasse/1
  }
  listByAnnoDocenteGroupByClasse(annoScolasticoID: any, idDocente: any): Observable<CLS_ClasseSezioneAnnoGroup[]>{
    return this.http.get<CLS_ClasseSezioneAnnoGroup[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnnoDocenteGroupByClasse/'+annoScolasticoID+"/"+idDocente);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnnoDocenteGroupByClasse/1/3
  }

  getWithClasseSezioneAnno(id: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/GetWithClasseSezioneanno/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/GetwithClasseSezioneanno/1
  } 
  
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + id);    
  }



}

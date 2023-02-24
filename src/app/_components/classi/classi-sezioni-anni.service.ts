import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniAnniService {
  pipe(arg0: void): Observable<CLS_ClasseSezioneAnno[]> {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) { }

  get(classeSezioneAnnoID: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/1
  } 

  listByAnno(annoID: any): Observable<CLS_ClasseSezioneAnno[]>{
    return this.http.get<CLS_ClasseSezioneAnno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnno/'+annoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnno/1
  }

  //Sostituita dalla successiva, con parametro docenteID null oppure 0
  listByAnnoGroupByClasse(annoID: any): Observable<CLS_ClasseSezioneAnnoGroup[]>{
    return this.http.get<CLS_ClasseSezioneAnnoGroup[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnnoGroupByClasse/'+annoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnnoGroupByClasse/1
  }
  
  listByAnnoDocenteGroupByClasse(annoID: any, docenteID: any): Observable<CLS_ClasseSezioneAnnoGroup[]>{
    return this.http.get<CLS_ClasseSezioneAnnoGroup[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnnoDocenteGroupByClasse/'+annoID+"/"+docenteID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnnoDocenteGroupByClasse/2/0
  }

  getWithClasseSezioneAnno(classeSezioneAnnoID: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/GetWithClasseSezioneanno/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/GetwithClasseSezioneanno/1
  } 
  
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni' , formData);  
  }

  delete(classeSezioneAnnoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + classeSezioneAnnoID);    
  }
}

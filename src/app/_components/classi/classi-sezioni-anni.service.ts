import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';


import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnno_Query, CLS_ClasseSezioneAnno_Sum } from 'src/app/_models/CLS_ClasseSezioneAnno';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniAnniService {

  constructor(private http: HttpClient) { }


  //*********NON USATA***********
  loadClassi(): Observable<CLS_ClasseSezioneAnno[]>{
    return this.http.get<CLS_ClasseSezioneAnno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListWithClasseSezioneAnno');
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListWithClasseSezioneAnno
  }

  // loadClassiByAnnoScolastico(idAnnoScolastico: any): Observable<CLS_ClasseSezioneAnno[]>{
  //   return this.http.get<CLS_ClasseSezioneAnno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnno/'+idAnnoScolastico);
  //   //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnno/1
  // }
  loadClassiByAnnoScolastico(idAnnoScolastico: any): Observable<CLS_ClasseSezioneAnno_Query[]>{
    return this.http.get<CLS_ClasseSezioneAnno_Query[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnnoGroup/'+idAnnoScolastico);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnnoGroup/1
  }

  //NON USATA (restituisce l'oggetto con parametri base)
  loadClasseSimple(id: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/1
  } 

  loadClasse(id: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/getWithClasseSezioneanno/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/getwithClasseSezioneanno/1
  } 

  
  loadSummary(idAnnoScolastico: any): Observable<CLS_ClasseSezioneAnno_Query[]>{
    return this.http.get<CLS_ClasseSezioneAnno_Query[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListByAnnoQuery/'+idAnnoScolastico);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListByAnnoQuery/1
  }
  
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;

    //console.log("DEBUG: POST classi-sezioni-anni.service ", formData );

    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + id);    
  }

  postAlunnoInClasse(formData: any) {
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni' , formData);  
  }

}

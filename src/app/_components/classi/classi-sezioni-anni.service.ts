import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';


import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnno_Sum } from 'src/app/_models/CLS_ClasseSezioneAnno';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniAnniService {

  constructor(private http: HttpClient) { }

  loadClassiByAlunno(idAlunno: number): any {
    //restituisce tutte le classiSezioniAnni di un certo Alunno
    return this.http.get( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/GetByAlunno/' + idAlunno);  
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/GetByAlunno/3
  }


  loadClassi(): Observable<CLS_ClasseSezioneAnno[]>{
    return this.http.get<CLS_ClasseSezioneAnno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/GetAllWithClasseSezioneAndAnno');
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/GetAllWithClasseSezioneAndAnno
  }

  loadClassiByAnnoScolastico(idAnnoScolastico: any): Observable<CLS_ClasseSezioneAnno[]>{
    return this.http.get<CLS_ClasseSezioneAnno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/GetAllByAnno/'+idAnnoScolastico);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/GetAllByAnno/1
  }

  loadClasse(id: any): Observable<CLS_ClasseSezioneAnno>{
    return  this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/1
  } 

  loadSummary(): Observable<CLS_ClasseSezioneAnno_Sum[]>{
    return this.http.get<CLS_ClasseSezioneAnno_Sum[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/ListSummary/');
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/ListSummary
  }

  putClasse(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + formData.id , formData);    
  }

  postClasse(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni' , formData);  
  }

  deleteClasse(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnni/' + id);    
  }

  postAlunnoInClasse(formData: any) {
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni' , formData);  
  }

}

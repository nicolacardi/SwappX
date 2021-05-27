import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

import { CLS_ClasseSezione } from 'src/app/_models/CLS_ClasseSezione';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniAnniService {

  constructor(private http: HttpClient) { }

  loadClassi(): Observable<CLS_ClasseSezioneAnno[]>{
    return this.http.get<CLS_ClasseSezioneAnno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/GetAllWithClasseSezioneAndAnno');
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnni/GetAllWithClasseSezioneAndAnno
  }

  loadClasse(id: any): Observable<CLS_ClasseSezioneAnno>{
    return this.http.get<CLS_ClasseSezioneAnno>(environment.apiBaseUrl+'CLS_ClassiSezioniAnni/'+id);
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


}

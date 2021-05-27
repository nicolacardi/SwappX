import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

import { CLS_ClasseSezione } from 'src/app/_models/CLS_ClasseSezione';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniService {

  constructor(private http: HttpClient) { }

  loadClassi(): Observable<CLS_ClasseSezione[]>{
    //console.log("loadClasse");
    return this.http.get<CLS_ClasseSezione[]>(environment.apiBaseUrl+'CLS_ClassiSezioni/GetAllWithClasse');
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioni/GetAllWithClasse
  }

  loadClasse(id: any): Observable<CLS_ClasseSezione>{
    //console.log("loadAlunno");
    return this.http.get<CLS_ClasseSezione>(environment.apiBaseUrl+'CLS_ClassiSezioni/'+id);
  } 

  putClasse(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiSezioni/' + formData.id , formData);    
  }

  postClasse(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioni' , formData);  
  }

  deleteClasse(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioni/' + id);    
  }


}

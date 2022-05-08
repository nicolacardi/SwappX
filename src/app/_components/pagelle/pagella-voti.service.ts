import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_PagellaVoto, DOC_TipoGiudizio } from 'src/app/_models/DOC_PagellaVoto';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PagellaVotiService {

  constructor(private http: HttpClient) { }

  listByAnnoClassePagella(annoID: number, classeID: number, pagellaID: number): Observable<DOC_PagellaVoto[]>{
    return this.http.get<DOC_PagellaVoto[]>(environment.apiBaseUrl+'DOC_PagellaVoti/ListByAnnoClassePagella/'+annoID+'/'+classeID+'/'+pagellaID);   
    //http://213.215.231.4/swappX/api/DOC_PagellaVoti/ListByAnnoClassePagella/2/1/2
  }
  
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'DOC_PagellaVoti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    delete formData.id;
    return this.http.post( environment.apiBaseUrl  + 'DOC_PagellaVoti' , formData);  
  }

  listTipiGiudizio(): Observable<DOC_TipoGiudizio[]>{
    return this.http.get<DOC_TipoGiudizio[]>(environment.apiBaseUrl+'DOC_TipiGiudizio/');   
    //http://213.215.231.4/swappX/api/DOC_TipiGiudizio
  }
}

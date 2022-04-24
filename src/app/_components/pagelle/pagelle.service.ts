import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagelleService {

  constructor(private http: HttpClient) { }

  
  listByIscrizione(iscrizioneID: number): Observable<DOC_Pagella[]>{
    return this.http.get<DOC_Pagella[]>(environment.apiBaseUrl+'DOC_Pagelle/ListByIscrizione/'+iscrizioneID);   
    //http://213.215.231.4/swappX/api/DOC_Pagelle/ListByIscrizione/285
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'DOC_Pagella/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    delete formData.id;
    return this.http.post( environment.apiBaseUrl  + 'DOC_Pagella' , formData);  
  }



}

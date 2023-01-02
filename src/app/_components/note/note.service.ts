import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DOC_Nota } from 'src/app/_models/DOC_Nota';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient) { }


  listByIscrizione(iscrizioneID: number): Observable<DOC_Nota[]>{
    return this.http.get<DOC_Nota[]>(environment.apiBaseUrl+'DOC_Note/ListByIscrizione/'+iscrizioneID);   
    //http://213.215.231.4/swappX/api/DOC_Note/ListByIscrizione/285
  }

  
  get(notaID: any): Observable<DOC_Nota>{
    return this.http.get<DOC_Nota>(environment.apiBaseUrl+'DOC_Note/'+notaID);
    //http://213.215.231.4/swappX/api/DOC_Note/1
  }

  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'DOC_Note/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'DOC_Note' , formData);  
  }

  delete(notaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'DOC_Note/' + notaID);    
  }
}

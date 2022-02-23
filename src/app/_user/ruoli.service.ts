import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Ruolo } from './Users';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RuoliService {

  constructor(private http: HttpClient) { }

  list(): Observable<Ruolo[]>{
    return this.http.get<Ruolo[]>(environment.apiBaseUrl+'_UT_Ruoli');
    //http://213.215.231.4/swappX/api/_UT_Ruoli
  }

  get(idMessage: any): Observable<Ruolo>{
    return this.http.get<Ruolo>(environment.apiBaseUrl+'_UT_Ruoli/'+idMessage);
    //http://213.215.231.4/swappX/api/_UT_Ruoli/5
  }
 
  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + '_UT_Ruoli/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + '_UT_Ruoli' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + '_UT_Ruoli/' + id);    
  }
}

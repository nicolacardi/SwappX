import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';

@Injectable({
  providedIn: 'root'
})

export class PagamentiService {

  constructor(private http: HttpClient) { }

  load(): Observable<PAG_Pagamento[]>{
    return this.http.get<PAG_Pagamento[]>(environment.apiBaseUrl+'PAG_Pagamenti');
    //http://213.215.231.4/swappX/api/PAG_Pagamenti
  }

  loadByID(idPagamento: any): Observable<PAG_Pagamento>{
    return this.http.get<PAG_Pagamento>(environment.apiBaseUrl+'PAG_Pagamenti/'+idPagamento);
    //http://213.215.231.4/swappX/api/PAG_Pagamenti/5
  }

  put(formData: any): Observable <any>{
    console.log("form.value", formData);
    return this.http.put(environment.apiBaseUrl  + 'PAG_Pagamenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'PAG_Pagamenti' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_Pagamenti/' + id);    
  }
}

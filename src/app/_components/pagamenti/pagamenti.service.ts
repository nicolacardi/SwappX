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

  list(): Observable<PAG_Pagamento[]>{
    return this.http.get<PAG_Pagamento[]>(environment.apiBaseUrl+'PAG_Pagamenti');
    //http://213.215.231.4/swappX/api/PAG_Pagamenti
  }

  get(idPagamento: any): Observable<PAG_Pagamento>{
    return this.http.get<PAG_Pagamento>(environment.apiBaseUrl+'PAG_Pagamenti/'+idPagamento);
    //http://213.215.231.4/swappX/api/PAG_Pagamenti/5
  }

  listByAnno(idAnno: number): Observable<PAG_Pagamento[]>{
    return this.http.get<PAG_Pagamento[]>(environment.apiBaseUrl+'PAG_Pagamenti/ListByAnno?idAnno='+idAnno);
    //http://213.215.231.4/swappX/api/PAG_Pagamenti/ListByAnno?idAnno=1
  }

  listByAlunnoAnno(idAlunno: number, idAnno: number): Observable<PAG_Pagamento[]>{
    return this.http.get<PAG_Pagamento[]>(environment.apiBaseUrl+'PAG_Pagamenti/ListByAlunnoAnno?idAlunno='+idAlunno+'&idAnno='+idAnno);
    //http://213.215.231.4/swappX/api/PAG_Pagamenti/ListByAlunnoAnno?idAlunno=3&idAnno=1
  }

  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'PAG_Pagamenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    console.log("pagamenti.service.ts post() : formData", formData);
    return this.http.post(environment.apiBaseUrl  + 'PAG_Pagamenti' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_Pagamenti/' + id);    
  }

//**************** METODI NON USATI ******************/
  // filterPagamenti(searchstring: string): Observable<PAG_Pagamento[]>{
    
  //   console.log("pagamenti.service.ts - filterPagamenti - searchstring:", searchstring);
    
  //   if (searchstring != null && (typeof searchstring === 'string')) {
  //     return this.http.get<PAG_Pagamento[]>(environment.apiBaseUrl+'PAG_Pagamenti')
  //           .pipe (
  //           map(val=>val.filter(val=>(val.tipoPagamento.descrizione.toLowerCase() + ' ' + val.Causale.descrizione.toLowerCase()).includes(searchstring.toLowerCase()))),
  //     );
  //       } else {
  //     return of()
  //     }
  // }

}

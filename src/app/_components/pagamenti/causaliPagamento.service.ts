import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';

@Injectable({
  providedIn: 'root'
})

export class CausaliPagamentoService {

  constructor(private http: HttpClient) { }

  load(): Observable<PAG_CausalePagamento[]>{
    return this.http.get<PAG_CausalePagamento[]>(environment.apiBaseUrl+'PAG_CausaliPagamento');
  }

  loadByID(idCausalePagamento: any): Observable<PAG_CausalePagamento>{  
    return this.http.get<PAG_CausalePagamento>(environment.apiBaseUrl+'PAG_CausaliPagamento/'+idCausalePagamento);
  }
  
  filter(searchstring: string): Observable<PAG_CausalePagamento[]>{

    return this.http.get<PAG_CausalePagamento[]>(environment.apiBaseUrl+'PAG_CausaliPagamento')
      .pipe (
        map(val=> val.filter(val=>val.descrizione.toLowerCase().includes(searchstring))),
      );
  }
}

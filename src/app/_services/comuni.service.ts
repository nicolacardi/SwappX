import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { _UT_Comuni } from '../_models/_UT_Comuni';

@Injectable({
  providedIn: 'root'
})
export class ComuniService {

  constructor(private http: HttpClient) { }

  loadComuni(): Observable<_UT_Comuni[]>{
    //console.log("sto caricando i dati");
    return this.http.get<_UT_Comuni[]>(environment.apiBaseUrl+'_UT_Comuni');
  }

  filterComuni(search: string): Observable<_UT_Comuni[]>{

    return this.http.get<_UT_Comuni[]>(environment.apiBaseUrl+'_UT_Comuni');
              
  }


}

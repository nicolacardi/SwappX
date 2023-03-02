import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';

//models
import { TEM_BloccoCella }                       from 'src/app/_models/TEM_BloccoCella';

@Injectable({
  providedIn: 'root'
})
export class BlocchiCelleService {

  constructor(private http: HttpClient) { }


  list(): Observable<TEM_BloccoCella[]>{
    return this.http.get<TEM_BloccoCella[]>(environment.apiBaseUrl+'TEM_BlocchiCelle');
    //http://213.215.231.4/swappX/api/TEM_BlocchiCelle
  }

  listByBlocco(BloccoID: any): Observable<TEM_BloccoCella[]>{
    return this.http.get<TEM_BloccoCella[]>(environment.apiBaseUrl+'TEM_BlocchiCelle/ListByBlocco/'+BloccoID);
    //http://213.215.231.4/swappX/api/TEM_BlocchiCelle/2
  }

  listCelleSxRow(BloccoID: any, Row: number, Col: number): Observable<TEM_BloccoCella[]>{
    return this.http.get<TEM_BloccoCella[]>(environment.apiBaseUrl+'TEM_BlocchiCelle/ListCelleSxRow/'+BloccoID+'/'+Row+'/'+Col);
    //http://213.215.231.4/swappX/api/TEM_BlocchiCelle/2
  }

  get(BloccoCellaID: any): Observable<TEM_BloccoCella>{
    return this.http.get<TEM_BloccoCella>(environment.apiBaseUrl+'TEM_BlocchiCelle/'+BloccoCellaID);
    //http://213.215.231.4/swappX/api/TEM_BlocchiCelle/73
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TEM_BlocchiCelle/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'TEM_BlocchiCelle' , formData);  
  }

  delete(BloccoCellaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TEM_BlocchiCelle/' + BloccoCellaID);    
  }
}

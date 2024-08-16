import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';

//models
import { TEM_BloccoTesto }                       from 'src/app/_models/TEM_BloccoTesto';

@Injectable({
  providedIn: 'root'
})
export class BlocchiTestiService {

  constructor(private http: HttpClient) { }


  list(): Observable<TEM_BloccoTesto[]>{
    return this.http.get<TEM_BloccoTesto[]>(environment.apiBaseUrl+'TEM_BlocchiTesti');
    //http://213.215.231.4/swappX/api/TEM_BlocchiTesti
  }

  get(BloccoTestoID: any): Observable<TEM_BloccoTesto>{
    return this.http.get<TEM_BloccoTesto>(environment.apiBaseUrl+'TEM_BlocchiTesti/'+BloccoTestoID);
    //http://213.215.231.4/swappX/api/TEM_BlocchiTesti/73
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TEM_BlocchiTesti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'TEM_BlocchiTesti' , formData);  
  }

  deleteByBlocco(bloccoID: any): Observable<any>{
    return this.http.delete(environment.apiBaseUrl+'TEM_BlocchiTesti/deleteByBlocco/'+bloccoID);   
    //http://213.215.231.4/swappX/api/TEM_BlocchiTesti/deleteByBlocco/40
  }

  delete(BloccoTestoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TEM_BlocchiTesti/' + BloccoTestoID);    
  }
}

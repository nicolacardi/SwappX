import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

import { environment }                          from 'src/environments/environment';
import { TEM_Pagina }                           from 'src/app/_models/TEM_Pagina';

@Injectable({
  providedIn: 'root'
})
export class PagineService {

  constructor(private http: HttpClient) { }


  list(): Observable<TEM_Pagina[]>{
    return this.http.get<TEM_Pagina[]>(environment.apiBaseUrl+'TEM_Pagine');
    //http://213.215.231.4/swappX/api/TEM_Pagine
  }

  listByTemplate (TemplateID: any){
  return this.http.get<TEM_Pagina[]>(environment.apiBaseUrl+'TEM_Pagine/ListByTemplate/'+TemplateID);
  //http://213.215.231.4/swappX/api/TEM_Pagine/ListByTemplate/1
  }

  get(PaginaID: any): Observable<TEM_Pagina>{
    return this.http.get<TEM_Pagina>(environment.apiBaseUrl+'TEM_Pagine/'+PaginaID);
    //http://213.215.231.4/swappX/api/TEM_Pagine/2
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TEM_Pagine/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'TEM_Pagine' , formData);  
  }

  delete(TemplateID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TEM_Pagine/' + TemplateID);    
  }
}

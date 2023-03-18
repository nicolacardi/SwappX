import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';

@Injectable({
  providedIn: 'root'
})
export class BlocchiService {

  constructor(private http: HttpClient) { }


  list(): Observable<TEM_Blocco[]>{
    return this.http.get<TEM_Blocco[]>(environment.apiBaseUrl+'TEM_Blocchi');
    //http://213.215.231.4/swappX/api/TEM_Blocchi
  }

  listByPagina (PaginaID: any){
  return this.http.get<TEM_Blocco[]>(environment.apiBaseUrl+'TEM_Blocchi/ListByPagina/'+PaginaID);
  //http://213.215.231.4/swappX/api/TEM_Blocchi/ListByPagina/1
  }

  listByTemplate (TemplateID: any){
    return this.http.get<TEM_Blocco[]>(environment.apiBaseUrl+'TEM_Blocchi/listByTemplate/'+TemplateID);
    //http://213.215.231.4/swappX/api/TEM_Blocchi/listByTemplate/1
    }

  get(BloccoID: any): Observable<TEM_Blocco>{
    return this.http.get<TEM_Blocco>(environment.apiBaseUrl+'TEM_Blocchi/'+BloccoID);
    //http://213.215.231.4/swappX/api/TEM_Blocchi/25
    //TODO la get butta fuori bloccotestoID e bloccofotoID null anche quando non lo sono!
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TEM_Blocchi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'TEM_Blocchi' , formData);  
  }

  delete(BloccoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TEM_Blocchi/' + BloccoID);    
  }
}

import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';

//models
import { TEM_BloccoFoto }                       from 'src/app/_models/TEM_BloccoFoto';

@Injectable({
  providedIn: 'root'
})
export class BlocchiFotoService {

  constructor(private http: HttpClient) { }


  list(): Observable<TEM_BloccoFoto[]>{
    return this.http.get<TEM_BloccoFoto[]>(environment.apiBaseUrl+'TEM_BlocchiFoto');
    //http://213.215.231.4/swappX/api/TEM_BlocchiFoto
  }

  get(BloccoFotoID: any): Observable<TEM_BloccoFoto>{
    return this.http.get<TEM_BloccoFoto>(environment.apiBaseUrl+'TEM_BlocchiFoto/'+BloccoFotoID);
    //http://213.215.231.4/swappX/api/TEM_BlocchiFoto/73
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TEM_BlocchiFoto/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'TEM_BlocchiFoto' , formData);  
  }

  delete(BloccoFotoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TEM_BlocchiFoto/' + BloccoFotoID);    
  }
}

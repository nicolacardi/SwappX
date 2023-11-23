import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

import { environment }                          from 'src/environments/environment';
import { TEM_Template }                         from 'src/app/_models/TEM_Template';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {

  constructor(private http: HttpClient) { }


  list(): Observable<TEM_Template[]>{
    return this.http.get<TEM_Template[]>(environment.apiBaseUrl+'TEM_Templates');
    //http://213.215.231.4/swappX/api/TEM_Templates
  }

  get(TemplateID: any): Observable<TEM_Template>{
    return this.http.get<TEM_Template>(environment.apiBaseUrl+'TEM_Templates/'+TemplateID);
    //http://213.215.231.4/swappX/api/TEM_Templates/1
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TEM_Templates/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'TEM_Templates' , formData);  
  }

  delete(TemplateID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TEM_Templates/' + TemplateID);    
  }
}

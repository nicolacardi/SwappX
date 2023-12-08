//#region ----- IMPORTS ------------------------

import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//classes
import { CLS_RisorsaClasse }                    from '../../../_models/CLS_RisorsaClasse';

//#endregion

@Injectable({
  providedIn: 'root'
})
export class RisorseClassiService {

  constructor(private http: HttpClient) { }
  
  get(risorsaClasseID: any): Observable<CLS_RisorsaClasse>{
    return this.http.get<CLS_RisorsaClasse>(environment.apiBaseUrl+'CLS_RisorseClassi/'+risorsaClasseID);
    //http://213.215.231.4/swappX/api/CLS_RisorseClassi/2
  }

  list(): Observable<CLS_RisorsaClasse[]>{
    return this.http.get<CLS_RisorsaClasse[]>(environment.apiBaseUrl+'CLS_RisorseClassi');
    //http://213.215.231.4/swappX/api/CLS_RisorseClassi
  }

  put(par: CLS_RisorsaClasse): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_RisorseClassi/' + par.id , par);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_RisorseClassi' , formData);  
  }

  delete(risorsaClasseID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_RisorseClassi/' + risorsaClasseID);    
  }



}

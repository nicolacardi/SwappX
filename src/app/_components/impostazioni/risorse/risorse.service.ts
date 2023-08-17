import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';
import { _UT_Risorsa }                             from 'src/app/_models/_UT_Risorsa';

@Injectable({
  providedIn: 'root'
})

export class RisorseService {

  constructor(private http: HttpClient) { }

  
  get(risorsaID: any): Observable<_UT_Risorsa>{
    return this.http.get<_UT_Risorsa>(environment.apiBaseUrl+'_UT_Risorse/'+risorsaID);
    //http://213.215.231.4/swappX/api/_UT_Risorse/1
  }

  getLight(risorsaID: any): Observable<_UT_Risorsa>{
    return this.http.get<_UT_Risorsa>(environment.apiBaseUrl+'_UT_Risorse/GetLight/'+risorsaID);
    //http://213.215.231.4/swappX/api/_UT_Risorse/GetLight/1
  }

  list(): Observable<_UT_Risorsa[]>{
    return this.http.get<_UT_Risorsa[]>(environment.apiBaseUrl+'_UT_Risorse');
    //http://213.215.231.4/swappX/api/_UT_Risorse
  }
 
  put(fil: _UT_Risorsa): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_Risorse/' + fil.id , fil);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_Risorse' , formData);  
  }

  delete(risorsaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_Risorse/' + risorsaID);    
  }

}

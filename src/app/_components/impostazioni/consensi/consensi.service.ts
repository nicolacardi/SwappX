//#region ----- IMPORTS ------------------------

import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//classes
import { _UT_Consenso }                         from '../../../_models/_UT_Consenso';
//#endregion
@Injectable({
  providedIn: 'root'
})
export class ConsensiService {

  constructor(private http: HttpClient) { }

  list(): Observable<_UT_Consenso[]>{
    return this.http.get<_UT_Consenso[]>(environment.apiBaseUrl+'_UT_Consensi');
    //http://213.215.231.4/swappX/api/_UT_Consensi
  }

  updateSeq(seqInitial: number, seqFinal: number): Observable <any>{
    console.log(seqInitial, seqFinal);
    return this.http.put(environment.apiBaseUrl+'_UT_Consensi/UpdateSeq/'+seqInitial+'/'+seqFinal, seqInitial);
    //http://213.215.231.4/swappX/api/_UT_Consensi/UpdateSeq/1/2
  }

  renumberSeq() {
    const url = `${environment.apiBaseUrl}_UT_Consensi/RenumberSeq`;
    return this.http.put(url, null);
  }

  get(consensoID: any): Observable<_UT_Consenso>{
    return this.http.get<_UT_Consenso>(environment.apiBaseUrl+'_UT_Consensi/'+consensoID);
    //http://213.215.231.4/swappX/api/_UT_Consensi/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_Consensi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_Consensi' , formData);  
  }

  delete(materiaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_Consensi/' + materiaID);    
  }



}

//#region ----- IMPORTS ------------------------

import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//models
import { CLS_IscrizioneConsenso } from 'src/app/_models/CLS_IscrizioneConsenso';


//#endregion
@Injectable({
  providedIn: 'root'
})
export class IscrizioneConsensiService {

  constructor(private http: HttpClient) { }

  list(): Observable<CLS_IscrizioneConsenso[]>{
    return this.http.get<CLS_IscrizioneConsenso[]>(environment.apiBaseUrl+'CLS_IscrizioneConsensi');
    //http://213.215.231.4/swappX/api/CLS_IscrizioneConsensi
  }

  get(iscrizioneConsensoID: any): Observable<CLS_IscrizioneConsenso>{
    return this.http.get<CLS_IscrizioneConsenso>(environment.apiBaseUrl+'CLS_IscrizioneConsensi/'+iscrizioneConsensoID);
    //http://213.215.231.4/swappX/api/CLS_IscrizioneConsensi/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_IscrizioneConsensi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_IscrizioneConsensi' , formData);  
  }

  deleteByIscrizione (iscrizioneID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'CLS_IscrizioneConsensi/DeleteByIscrizione/'+iscrizioneID);
    //http://213.215.231.4/swappX/api/CLS_IscrizioneConsensi/DeleteByIscrizione/4
  }

  delete(materiaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_IscrizioneConsensi/' + materiaID);    
  }



}

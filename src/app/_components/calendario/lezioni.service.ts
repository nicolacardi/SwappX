import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Utility } from '../utilities/utility.component';

@Injectable({
  providedIn: 'root'
})
export class LezioniService {

  constructor(private http: HttpClient) { }


  list(): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni');   //NON FUNZIONA
    //http://213.215.231.4/swappX/api/CAL_Lezioni
  }

  listByClasseSezioneAnno(idClasseSezioneAnno: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByClasseSezioneAnno/'+idClasseSezioneAnno);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/ListByClasseSezioneAnno/16
  }

  listByDocenteAndOraOverlap(idLezione: number, idDocente: number, dtCalendario: string, h_Ini: string, h_End: string): Observable<CAL_Lezione[]>{
    let strQuery = environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteAndOraOverlap?idLezione= '+ idLezione + '&idDocente=' + idDocente + '&dtCalendario=' + dtCalendario + '&strH_INI=' + Utility.URL_FormatHour(h_Ini) + '&strH_END=' + Utility.URL_FormatHour( h_End);
    //console.log (strQuery);
    return this.http.get<CAL_Lezione[]>(strQuery);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocenteAndOraOverlap?idDocente=3&dtCalendario=2022-03-14&strH_INI=08%3A00%3A00&strH_END=09%3A00%3A00
  }

  get(id: any): Observable<CAL_Lezione>{

    return this.http.get<CAL_Lezione>(environment.apiBaseUrl+'CAL_Lezioni/'+id);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/4
  }

  toggleEpoca (idLezione: number) {
    return this.http.get( environment.apiBaseUrl  + 'CAL_Lezioni/ToggleEpoca/' + idLezione);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/4

  }

  copyByClasseSezioneAnnoToDate (idClasseSezioneAnno: number, dtFromStart: any, dtFromEnd: any, dtToStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/CopyByClasseSezioneAnnoToDate?IDClasseSezioneAnno=' + idClasseSezioneAnno + '&dtFromStart=' + dtFromStart + '&dtFromEnd=' + dtFromEnd + '&dtToStart=' + dtToStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/CopyByClasseSezioneAnnoAndDate?IDClasseSezioneAnno=16&dtFromStart=2022-03-14&dtFromEnd=2022-03-19&dtToStart=2022-03-21
  }

  copyToDate (dtFromStart: any, dtFromEnd: any, dtToStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/copyToDate?dtFromStart=' + dtFromStart + '&dtFromEnd=' + dtFromEnd + '&dtToStart=' + dtToStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/copyToDate?dtFromStart=2022-03-14&dtFromEnd=2022-03-19&dtToStart=2022-03-21
  }

  copyByClasseSezioneAnnoUntilDate (idClasseSezioneAnno: number, dtFromStart: any, dtFromEnd: any, dtUntilStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/copyByClasseSezioneAnnoUntilDate?IDClasseSezioneAnno=' + idClasseSezioneAnno + '&dtFromStart=' + dtFromStart + '&dtFromEnd=' + dtFromEnd + '&dtUntilStart=' + dtUntilStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/copyByClasseSezioneAnnoUntilDate?IDClasseSezioneAnno=16&dtFromStart=2022-03-14&dtFromEnd=2022-03-19&dtUntilStart=2022-03-21
  }


  put(formData: any): Observable <any>{

    //formData.h_Ini = formData.start.substring(11,16)+":00";
    //formData.h_End = formData.end.substring(11,16)+":00";


    return this.http.put( environment.apiBaseUrl  + 'CAL_Lezioni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;

    //formData.h_Ini = formData.start.substring(11,16)+":00";
    //formData.h_End = formData.end.substring(11,16)+":00";

    console.log ("post formData", formData);
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/' + id);    
  }

  deleteByClasseSezioneAnnoAndDate (idClasseSezioneAnno: number, dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/DeleteByClasseSezioneAnnoAndDate?IDClasseSezioneAnno=' + idClasseSezioneAnno + '&dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }

  deleteByDate (dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/DeleteByDate?dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }



}

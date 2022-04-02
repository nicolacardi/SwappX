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

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByClasseSezioneAnno/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/ListByClasseSezioneAnno/16
  }

  listByDocente(docenteID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByDocente/'+ docenteID);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocente/3
  }

  listByDocenteClasseSezioneAnno(docenteID: number, classeSezioneAnnoID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteClasseSezioneAnno/'+ docenteID + '/' + classeSezioneAnnoID);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocenteClasseSezioneAnno/3/16
  }

  listByDocenteAndOraOverlap(lezioneID: number, docenteID: number, dtCalendario: string, h_Ini: string, h_End: string): Observable<CAL_Lezione[]>{
    let strQuery = environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteAndOraOverlap/'+ lezioneID + '/' + docenteID + '/' + dtCalendario + '/' + Utility.URL_FormatHour(h_Ini) + '/' + Utility.URL_FormatHour( h_End);
    //console.log (strQuery);
    return this.http.get<CAL_Lezione[]>(strQuery);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocenteAndOraOverlap/160/3/2022-03-16/11%3A00%3A00/12%3A00%3A00
  }

  get(lezioneID: any): Observable<CAL_Lezione>{

    return this.http.get<CAL_Lezione>(environment.apiBaseUrl+'CAL_Lezioni/'+lezioneID);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/4
  }

  toggleEpoca (idLezione: number) {
    return this.http.get( environment.apiBaseUrl  + 'CAL_Lezioni/ToggleEpoca/' + idLezione);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/4

  }

  copyByClasseSezioneAnnoToDate (classeSezioneAnnoID: number, dtFromStart: any, dtFromEnd: any, dtToStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/CopyByClasseSezioneAnnoToDate?classeSezioneAnnoID=' + classeSezioneAnnoID + '&dtFromStart=' + dtFromStart + '&dtFromEnd=' + dtFromEnd + '&dtToStart=' + dtToStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/CopyByClasseSezioneAnnoAndDate?classeSezioneAnnoID=16&dtFromStart=2022-03-14&dtFromEnd=2022-03-19&dtToStart=2022-03-21
  }

  copyToDate (dtFromStart: any, dtFromEnd: any, dtToStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/CopyToDate?dtFromStart=' + dtFromStart + '&dtFromEnd=' + dtFromEnd + '&dtToStart=' + dtToStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/CopyToDate?dtFromStart=2022-03-14&dtFromEnd=2022-03-19&dtToStart=2022-03-21
  }

  copyByClasseSezioneAnnoUntilDate (classeSezioneAnnoID: number, dtFromStart: any, dtFromEnd: any, dtUntilStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/copyByClasseSezioneAnnoUntilDate?classeSezioneAnnoID=' + classeSezioneAnnoID + '&dtFromStart=' + dtFromStart + '&dtFromEnd=' + dtFromEnd + '&dtUntilStart=' + dtUntilStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/copyByClasseSezioneAnnoUntilDate?classeSezioneAnnoID=16&dtFromStart=2022-03-14&dtFromEnd=2022-03-19&dtUntilStart=2022-03-21
  }

  propagaEpocaByClasseSezioneAnnoUntilDate (classeSezioneAnnoID: number, dtFromStart: any, dtUntilEnd: any) {
    console.log ("parametri passati alla propagaEpocaByClasseSezioneAnnoUntilDate", classeSezioneAnnoID, dtFromStart, dtUntilEnd);
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/propagaEpocaByClasseSezioneAnnoUntilDate?ClasseSezioneAnnoID=' + classeSezioneAnnoID + '&dtFromStart=' + dtFromStart + '&dtUntilEnd=' + dtUntilEnd, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/propagaEpocaByClasseSezioneAnnoUntilDate?classeSezioneAnnoID=16&dtFromStart=2022-03-28&dtUntilEnd=2022-04-01
  }


  put(formData: any): Observable <any>{

    //formData.h_Ini = formData.start.substring(11,16)+":00";
    //formData.h_End = formData.end.substring(11,16)+":00";

    //console.log ("lezioni.service - put - formData", formData);
    return this.http.put( environment.apiBaseUrl  + 'CAL_Lezioni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;

    //formData.h_Ini = formData.start.substring(11,16)+":00";
    //formData.h_End = formData.end.substring(11,16)+":00";

    //console.log ("post formData", formData);
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni' , formData);  
  }

  delete(lezioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/' + lezioneID);    
  }

  deleteByClasseSezioneAnnoAndDate (classeSezioneAnnoID: number, dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/DeleteByClasseSezioneAnnoAndDate?classeSezioneAnnoID=' + classeSezioneAnnoID + '&dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }

  deleteByDate (dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/DeleteByDate?dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }



}

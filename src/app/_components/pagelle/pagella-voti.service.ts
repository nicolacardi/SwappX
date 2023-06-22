import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { DOC_PagellaVoto, DOC_TipoGiudizio } from 'src/app/_models/DOC_PagellaVoto';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PagellaVotiService {

  constructor(private http: HttpClient) { }

  listByAnnoClassePagella(annoID: number, classeID: number, pagellaID: number): Observable<DOC_PagellaVoto[]>{
    return this.http.get<DOC_PagellaVoto[]>(environment.apiBaseUrl+'DOC_PagellaVoti/ListByAnnoClassePagella/'+annoID+'/'+classeID+'/'+pagellaID);   
    //http://213.215.231.4/swappX/api/DOC_PagellaVoti/ListByAnnoClassePagella/2/1/33
  }

  listByCSAMateria(classeSezioneAnnoID: number, materiaID: number): Observable<CLS_Iscrizione[]>{

    return this.http.get<CLS_Iscrizione[]>(environment.apiBaseUrl+'DOC_PagellaVoti/ListByCSAMateria/'+classeSezioneAnnoID+'/'+materiaID);
    // .pipe (
    //        map(val=> val.filter(val=>(val.periodo == periodo || val.periodo == 0)))
    // );   
    //http://213.215.231.4/swappX/api/DOC_PagellaVoti/ListByCSAMateria/18/1002
  }
  
  put(formData: any): Observable <any>{
    //console.log ("pagellavoto.put", formData);
    return this.http.put( environment.apiBaseUrl  + 'DOC_PagellaVoti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    //console.log ("pagellavoto.post", formData);

    delete formData.id;
    if(formData.voto == null) formData.voto = 0;
    //if(formData.tipoGiudizioID == null) formData.tipoGiudizioID = 1;
    return this.http.post( environment.apiBaseUrl  + 'DOC_PagellaVoti' , formData);  
  }

  listTipiGiudizio(): Observable<DOC_TipoGiudizio[]>{
    return this.http.get<DOC_TipoGiudizio[]>(environment.apiBaseUrl+'DOC_TipiGiudizio/');   
    //http://213.215.231.4/swappX/api/DOC_TipiGiudizio
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_PagellaVotoObiettivo } from 'src/app/_models/DOC_PagellaVotoObiettivo';
import { DOC_TipoLivelloObiettivo } from 'src/app/_models/DOC_TipoLivelloObiettivo';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagellaVotoObiettiviService {

  constructor(private http: HttpClient) { }

  ListByPagellaMateriaClasseSezioneAnno(pagellaVotoID: number, materiaID: number, classeSezioneAnnoID: number): Observable<DOC_PagellaVotoObiettivo[]>{

    return this.http.get<DOC_PagellaVotoObiettivo[]>(environment.apiBaseUrl+'DOC_PagellaVotoObiettivi/ListByPagellaMateriaClasseSezioneAnno/'+pagellaVotoID+'/'+materiaID+'/'+classeSezioneAnnoID);   
    //http://213.215.231.4/swappX/api/DOC_PagellaVotoObiettivi/ListByPagellaMateriaClasseSezioneAnno/54/4/16
  }
  
  put(formData: any): Observable <any>{
    console.log ("formdata", formData );
    return this.http.put( environment.apiBaseUrl  + 'DOC_PagellaVotoObiettivi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    delete formData.id;
    return this.http.post( environment.apiBaseUrl  + 'DOC_PagellaVotoObiettivi' , formData);  
  }

  listTipiLivelliObiettivo(): Observable<DOC_TipoLivelloObiettivo[]>{
    return this.http.get<DOC_TipoLivelloObiettivo[]>(environment.apiBaseUrl+'DOC_TipiLivelloObiettivo/');   
    //http://213.215.231.4/swappX/api/DOC_TipiLivelloObiettivo
  }
}

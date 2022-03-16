import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


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

  get(id: any): Observable<CAL_Lezione>{
    return this.http.get<CAL_Lezione>(environment.apiBaseUrl+'CAL_Lezioni/'+id);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/4
  }

  impostaEpoca (idLezione: number) {
    let formData = {
      id: idLezione
    }
    return this.http.put( environment.apiBaseUrl  + 'CAL_Lezioni/ImpostaEpoca/' + idLezione, formData);
  }

  copyAllEventsFromDateToDate (dtCopyFrom: any, dtCopyTo: any) {
    return this.http.get( environment.apiBaseUrl  + 'CAL_Lezioni/' + dtCopyFrom +'/' +dtCopyTo);   //cos'è questa? una get?
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_Lezioni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/' + id);    
  }



}

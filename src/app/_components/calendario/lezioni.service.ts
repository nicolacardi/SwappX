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
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni');
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

}

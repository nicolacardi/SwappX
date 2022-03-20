import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { environment } from 'src/environments/environment';
import { Utility } from '../utilities/utility.component';

@Injectable({
  providedIn: 'root'
})
export class DocentiService {

  constructor(private http: HttpClient) { }


  //***************************************************************MANCA TUTTO SULL'EF??? */

  list(): Observable<PER_Docente[]>{
    return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti');
    //http://213.215.231.4/swappX/api/PER_Docenti
  }


  listSupplentiDisponibili(idLezione: number, idDocente: number, dtCalendario: string, h_Ini: string, h_End: string) : Observable<PER_Docente[]>{
    return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti/ListSupplentiDisponibili?idLezione=' + idLezione + '&idDocente=' + idDocente + '&dtCalendario=' + Utility.UT_FormatDate(dtCalendario) + '&strH_INI=' + Utility.URL_FormatHour(h_Ini) + '&strH_END=' + Utility.URL_FormatHour( h_End));
    //http://213.215.231.4/SwappX/api/PER_Docenti/ListSupplentiDisponibili?idDocente=3&dtCalendario=2022-03-16&strH_INI=11%3A06%3A00&strH_END=12%3A06%3A00
  }

  filterDocenti(searchstring: string): Observable<PER_Docente[]>{

    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti')
            .pipe (
            map(val=>val.filter(val=>(val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
        } else {
      return of()
      }

    //Quando si fa clic su uno dei valori nella dropdown, searchstring non è più una stringa ma un object ( a causa forse di [value] = "element" in filtri.component.html),
    //quindi non si può più fare searchstring.toLowerCase(), istruzione che si è resa necessaria per cercare in maniera case insensitive
    //dunque, fino a una soluzione migliore, qui testiamo se searchstring sia un object (non una stringa) e in quel caso si restituisce un observable vuoto.
    // if (typeof searchstring === 'string') {
    //   return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
    //     .pipe (
    //       map(val=> val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()) )),
    //     );
    // } else {
    //   return of();
    // }
  }

  get(id: any): Observable<PER_Docente>{
    return this.http.get<PER_Docente>(environment.apiBaseUrl+'PER_Docenti/'+id);
    //http://213.215.231.4/swappX/api/PER_Docenti/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_Docenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_Docenti' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Docenti/' + id);    
  }



}

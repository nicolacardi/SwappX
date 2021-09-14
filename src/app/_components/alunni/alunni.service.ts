import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map} from 'rxjs/operators';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Injectable({
  providedIn: 'root'
})

export class AlunniService {

  constructor(private http: HttpClient) { }

  load(): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni');
    //http://213.215.231.4/swappX/api/ALU_Alunni
  }

  loadByGenitore(idGenitore: any): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/GetAllByGenitore/'+idGenitore);
    //http://213.215.231.4/swappX/api/ALU_Alunni/GetAllByGenitore/3
  }

  loadByClasse(idClasse: any): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/GetAllByClasse/'+idClasse);
  }

  loadWithParents(): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/GetAllWithParents');
  }

  loadAlunno(id: any): Observable<ALU_Alunno>{
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/'+id);
  }

  loadAlunnoWithParents(id: any): Observable<ALU_Alunno>{
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/GetWithParents/'+id);
  }

  //per filtro e paginazione server side (NON USATO)
  findAlunni(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni', {
      params: new HttpParams()
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
    });
  }

  put(formData: any): Observable <any>{
    console.log("formData", formData);
    return this.http.put( environment.apiBaseUrl  + 'ALU_Alunni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'ALU_Alunni' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Alunni/' + id);    
  }

  filterAlunni(searchstring: string): Observable<ALU_Alunno[]>{
    //console.log("alunni.service.ts - filterAlunni - searchstring:", searchstring);
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
            .pipe (
            map(val=>val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
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

  filterAlunniExact(searchstring: string): Observable<boolean>{
    //restituisce un observable di true se il valore ha un match esatto altrimenti false
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
            .pipe (
            map(val=>val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase())===(searchstring.toLowerCase())).length !==0
            ),
      );
        } else {
      return of()
      }
  }

  filterAlunniAnnoSenzaClasse(searchstring: string, idAnno: number): Observable<ALU_Alunno[]>{
    //console.log("alunni.service.ts - filterAlunni - searchstring:", searchstring);
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'CLS_ClassiSezioniAnniAlunni/GetByAnnoNoClasse/'+idAnno)
      //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/GetByAnnoNoClasse/2
        .pipe (
        map(val=>val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
    } else {
      return of()
    }
  }

  //Recupera l'id da nome cognome  
  findIdAlunno(searchstring: string) : Observable<any>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
      .pipe(
        map(val => val.find(val => (val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase())== searchstring.toLowerCase())),
      )
  }


}

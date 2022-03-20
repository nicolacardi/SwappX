import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { filter, map} from 'rxjs/operators';

import { ALU_Alunno} from 'src/app/_models/ALU_Alunno';
import { ALU_GenitoreAlunno } from 'src/app/_models/ALU_GenitoreAlunno';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';

@Injectable({
  providedIn: 'root'
})

export class AlunniService {

  constructor(private http: HttpClient) { }

  list(): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni');
    //http://213.215.231.4/swappX/api/ALU_Alunni
  }
  
  listByGenitore(idGenitore: any): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/ListByGenitore/'+idGenitore);
    //http://213.215.231.4/swappX/api/ALU_Alunni/ListByGenitore/3
  }

  listByClasseSezioneAnno(idClasse: any): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/ListByClasseSezioneAnno/'+idClasse);
    //http://213.215.231.4/swappX/api/ALU_Alunni/ListByClasseSezioneAnno/3
  }

  listWithParents(): Observable<ALU_Alunno[]>{
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/ListWithParents');
      //http://213.215.231.4/swappX/api/ALU_Alunni/ListWithParents
  }

  get(id: any): Observable<ALU_Alunno>{
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/'+id);
    //http://213.215.231.4/swappX/api/ALU_Alunni/3
  }

  getWithParents(id: any): Observable<ALU_Alunno>{
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/GetWithParents/'+id);
  }



  put(formData: any): Observable <any>{
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

  listByAnnoNoClasse(searchstring: string, idAnno: number): Observable<ALU_Alunno[]>{
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'CLS_Iscrizioni/ListByAnnoNoClasse/'+idAnno)
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAnnoNoClasse/2
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

  hasFratelloMaggiore(alunnoID: number): Observable<boolean> {
    
    return this.http.get<boolean>( environment.apiBaseUrl  + 'ALU_Alunni/HasFratelloMaggiore/'+alunnoID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/HasFratelloMaggiore/3 
  }


//#region -- GenitoreAlunno


  listByGenitoreAlunno (genitoreID: number, alunnoID: number): Observable <any>{
    return this.http.get( environment.apiBaseUrl  + 'ALU_GenitoriAlunni/ListByGenitoreAlunno?idAlunno='+alunnoID+'&idGenitore='+genitoreID);
    //http://213.215.231.4/swappX/api/ALU_GenitoriAlunni/ListByGenitoreAlunno?idAlunno=3&idGenitore=4
  }

  postGenitoreAlunno (genitoreID: number, alunnoID: number): Observable <any>{
    const parentela = <ALU_GenitoreAlunno>{};
    parentela.id = 0;
    parentela.alunnoID = alunnoID;
    parentela.genitoreID = genitoreID;
    return this.http.post( environment.apiBaseUrl  + 'ALU_GenitoriAlunni/' , parentela);
  }

  deleteByGenitoreAlunno (genitoreID: number, alunnoID: number) {
    //console.log ("genitoreID:", genitoreID, "alunnoID:", alunnoID)
    return this.http.delete( environment.apiBaseUrl  + 'ALU_GenitoriAlunni/DeleteByGenitoreAlunno?idAlunno='+alunnoID+'&idGenitore='+genitoreID);
    //http://213.215.231.4/swappX/api/ALU_GenitoriAlunni/DeleteByGenitoreAlunno?idAlunno=3&idGenitore=4
  }

//#endregion
 

}



  // //per filtro e paginazione server side (NON USATO)
  // findAlunni(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Alunno[]>{
  //   return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni', {
  //     params: new HttpParams()
  //               .set('filter', filter)
  //               .set('sortOrder', sortOrder)
  //               .set('pageNumber', pageNumber.toString())
  //               .set('pageSize', pageSize.toString())
  //   });
  // }

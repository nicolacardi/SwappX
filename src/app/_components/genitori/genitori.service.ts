import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class GenitoriService {

  constructor(private http: HttpClient) { }

  load(): Observable<ALU_Genitore[]>{
  //loadGenitori(idAlunno?: any): Observable<ALU_Genitore[]>{
    //if (idAlunno == null || idAlunno == "")
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori');
    //else 
    //  return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/GetAllByAlunno/'+idAlunno);
  }

  loadByAlunno(idAlunno: any): Observable<ALU_Genitore[]>{
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/GetAllByAlunno/'+idAlunno);
  }

  loadWithChildren(): Observable<ALU_Genitore[]>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/GetAllWithChildren');
  }

  loadGenitore(id: any): Observable<ALU_Genitore>{
    return this.http.get<ALU_Genitore>(environment.apiBaseUrl+'ALU_Genitori/'+id);
  }
  
  //per filtro e paginazione server side (NON USATO)
  findGenitori(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Genitore[]>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori', {
      params: new HttpParams()
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
    });
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'ALU_Genitori/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'ALU_Genitori' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Genitori/' + id);    
  }

  filterGenitori(searchstring: string): Observable<ALU_Genitore[]>{
    console.log("genitori.service.ts - filtergenitori - searchstring:", searchstring);
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori')
            .pipe (
            map(val=>val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
        } else {
      return of()
      }
  }

  findIdGenitore(searchstring: string) : Observable<any>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori')
      .pipe(
        map(val => val.find(val => (val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase())== searchstring.toLowerCase())),
      )
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError, take, tap } from 'rxjs/operators';
import { ASC_AnnoScolastico } from '../_models/ASC_AnnoScolastico';

@Injectable({
  providedIn: 'root'
})

export class AnniScolasticiService {

  constructor(private http: HttpClient) { }


  loadAnnoScolastico(id: any): Observable<ASC_AnnoScolastico>{
    return this.http.get<ASC_AnnoScolastico>(environment.apiBaseUrl+'ASC_Anni/'+id);
  }

  filterAnniScolastici(searchstring: string): Observable<ASC_AnnoScolastico[]>{
    console.log("anni-scolastici.service.ts - filterAnniScolastici - searchstring:", searchstring);
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ASC_AnnoScolastico[]>(environment.apiBaseUrl+'ASC_Anni')
            .pipe (
            map(val=>val.filter(val=>(val.annoscolastico.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
        } else {
      return of()
      }
  }

  findIdAnnoScolastico(searchstring: string) : Observable<any>{
    return this.http.get<ASC_AnnoScolastico[]>(environment.apiBaseUrl+'ASC_Anni')
      .pipe(
        map(val => val.find(val => (val.annoscolastico.toLowerCase())== searchstring.toLowerCase())),
      )
  }
}

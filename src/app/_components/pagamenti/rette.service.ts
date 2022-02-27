import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PAG_Retta, PAG_RettePagamenti_Sum } from 'src/app/_models/PAG_Retta';



@Injectable({
  providedIn: 'root'
})

export class RetteService {

  constructor(private http: HttpClient) { }

  list(): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette');
    //http://213.215.231.4/swappX/api/PAG_Rette
  }

  listByAnno(idAnno: number): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette/ListByAnno?idAnno='+idAnno);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListByAnno?idAnno=1
  }

  listByAlunnoAnno(idAlunno: number, idAnno: number): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette/ListByAlunnoAnno?idAlunno='+idAlunno+"&idAnno="+idAnno);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListByAlunnoAnno?idAlunno=3&idAnno=1
  }

  get(idRetta: any): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/'+idRetta);
    //http://213.215.231.4/swappX/api/PAG_Rette/5
  }

  getByAlunnoAnnoMese(idAlunno: number, idAnno: number, meseRetta: number): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/GetByAlunnoAnnoMese?idAlunno='+idAlunno+'&idAnno='+idAnno+'&meseRetta='+meseRetta);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetByAlunnoAnnoMese?idAlunno=3&idAnno=1&meseRetta=9
  }

  listRettePagamenti_Sum(idAnnoScolastico: any): Observable<PAG_RettePagamenti_Sum[]>{
    return this.http.get<PAG_RettePagamenti_Sum[]>(environment.apiBaseUrl+'PAG_Rette/ListRettePagamenti_Sum/'+idAnnoScolastico);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListRettePagamenti_Sum/2
  }

  put(obj: PAG_Retta): Observable <any>{
    //console.log("rette.service.ts - put - formData=", obj, obj.id);
    return this.http.put(environment.apiBaseUrl  + 'PAG_Rette/' + obj.id , obj);    
  }

  post(obj: PAG_Retta): Observable <any>{
    obj.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'PAG_Rette' , obj);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_Rette/' + id);    
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';



@Injectable({
  providedIn: 'root'
})

export class RetteService {

  constructor(private http: HttpClient) { }

  load(): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette');
    //http://213.215.231.4/swappX/api/PAG_Rette
  }

  loadByID(idRetta: any): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/'+idRetta);
    //http://213.215.231.4/swappX/api/PAG_Rette/5
  }

  loadByAlunnoAnno(idAlunno: number, idAnno: number): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette/GetAllByAlunnoAnno?idAlunno='+idAlunno+"&idAnno="+idAnno);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetAllByAlunnoAnno?idAlunno=3&idAnno=1
  }

  loadByAlunnoAnnoMese(idAlunno: number, idAnno: number, meseRetta: number): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/GetByAlunnoAnnoMese?idAlunno='+idAlunno+'&idAnno='+idAnno+'&meseRetta='+meseRetta);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetByAlunnoAnnoMese?idAlunno=3&idAnno=1&meseRetta=9
  }

  put(obj: PAG_Retta): Observable <any>{
    //console.log("rette.service.ts - put - formData=", obj, obj.id);
    return this.http.put(environment.apiBaseUrl  + 'PAG_Rette/' + obj.id , obj);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'PAG_Rette' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_Rette/' + id);    
  }
}

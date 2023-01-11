import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CAL_Presenza } from 'src/app/_models/CAL_Presenza';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PresenzeService {

  constructor(private http: HttpClient) { }
  
  list(): Observable<CAL_Presenza[]>{
    return this.http.get<CAL_Presenza[]>(environment.apiBaseUrl+'CAL_Presenze');
    //http://213.215.231.4/swappX/api/CAL_Presenze
  }

  listByLezione(lezioneID: number): Observable<CAL_Presenza[]>{
    return this.http.get<CAL_Presenza[]>(environment.apiBaseUrl+'CAL_Presenze/ListByLezione/'+lezioneID);
    //http://213.215.231.4/swappX/api/CAL_Presenze/ListByLezione/975
  }


  get(presenzaID: any): Observable<CAL_Presenza>{
    return this.http.get<CAL_Presenza>(environment.apiBaseUrl+'CAL_Presenze/'+presenzaID);
    //http://213.215.231.4/swappX/api/CAL_Presenze/3
  }
  
  post(presenza: CAL_Presenza): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CAL_Presenze' , presenza);  
  }
  
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_Presenze/' + formData.id , formData);    
  }

  delete(presenzaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Presenze/' + presenzaID); 
  }
      
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersoneService {

  constructor(private http: HttpClient) { }


  list(): Observable<PER_Persona[]>{
    return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'PER_Persone');
    //http://213.215.231.4/swappX/api/PER_Persone
  }

  get(personaID: any): Observable<PER_Persona>{
    return this.http.get<PER_Persona>(environment.apiBaseUrl+'PER_Persone/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Persone/3
  }


  put(formData: any): Observable <any>{
    console.log ("formData", formData);
    return this.http.put( environment.apiBaseUrl  + 'PER_Persone/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_Persone' , formData);  
  }

  delete(personaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Persone/' + personaID);    
  }
}

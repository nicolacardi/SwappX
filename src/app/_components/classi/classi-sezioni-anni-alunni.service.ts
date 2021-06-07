import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassiSezioniAnniAlunniService {

  constructor(private http: HttpClient) { }

  postClasseSezioneAnnoAlunno(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni' , formData);  
  }

}

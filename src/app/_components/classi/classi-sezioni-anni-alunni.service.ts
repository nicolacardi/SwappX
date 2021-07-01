import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassiSezioniAnniAlunniService {

  constructor(private http: HttpClient) { }



  postClasseSezioneAnnoAlunno(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni' , formData);  
  }

  deleteClasseSezioneAnnoAlunno(ClasseSezioneAnnoID: number, idAlunno: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/DeleteByAnnoAndClasse/'+ClasseSezioneAnnoID+'/'+idAlunno);  
  }

      //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/DeleteByAnnoAndClasse/{pClasseSezioneAnnoID}/{pAlunnoID}




      
}

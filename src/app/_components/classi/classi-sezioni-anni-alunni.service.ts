import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassiSezioniAnniAlunniService {

  constructor(private http: HttpClient) { }



  getByAlunnoAndClasseSezioneAnno(idClasseSezioneAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+idClasseSezioneAnno);  
      //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=1
  }

  getByAlunnoAndAnno(idAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/GetAllByAlunnoAndAnno?idAlunno='+idAlunno+'&idAnno='+idAnno);  
      //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/GetAllByAlunnoAndAnno?idAlunno=3&idAnno=1
  }



  postClasseSezioneAnnoAlunno(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni' , formData);  
  }

  deleteClasseSezioneAnnoAlunno(ClasseSezioneAnnoID: number, idAlunno: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+ClasseSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=243

  }

      




      
}

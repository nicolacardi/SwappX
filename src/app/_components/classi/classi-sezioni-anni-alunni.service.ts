import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassiSezioniAnniAlunniService {

  constructor(private http: HttpClient) { }



  getClasseSezioneAnnoAlunnoByAlunnoAndClasseSezioneAnno(idClasseSezioneAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+idClasseSezioneAnno);  
      //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=1
  }



  postClasseSezioneAnnoAlunno(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni' , formData);  
  }

  deleteClasseSezioneAnnoAlunno(ClasseSezioneAnnoID: number, idAlunno: number): Observable <any>{
    console.log("provo a cancellare dove ClasseSezioneAnnoID :"+ClasseSezioneAnnoID+" e idAlunno:"+idAlunno );
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiSezioniAnniAlunni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+ClasseSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioniAnniAlunni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=243

  }

      




      
}

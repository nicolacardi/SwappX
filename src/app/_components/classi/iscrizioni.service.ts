import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IscrizioniService {

  constructor(private http: HttpClient) { }

  listByAnno(idAnno: number): Observable <any> {
    //return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno='+idClasseSezioneAnno);  
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByAnno/'+idAnno); 
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAnno/1
  }

  listByClasseSezioneAnno(idClasseSezioneAnno: number): Observable <any> {
    //return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno='+idClasseSezioneAnno);  
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno/'+idClasseSezioneAnno); 
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno=5
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByClasseSezioneAnno/1
  }

  getByAlunnoAndClasseSezioneAnno(idClasseSezioneAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+idClasseSezioneAnno);  
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=1
  }

  getByAlunnoAndAnno(idAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetAllByAlunnoAndAnno?idAlunno='+idAlunno+'&idAnno='+idAnno);  
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetAllByAlunnoAndAnno?idAlunno=3&idAnno=1
  }

  post(formData: any): Observable <any>{

    formData.id = 0;
    formData.statoID = 1;
    //formData.dtIns= "01/01/2022";

    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni' , formData);  
  }
  
  //bisogna passare alla post un formData
  //updateStato (id: number, codiceStato: number) {
  updateStato(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni/UpdateStato?id='+formData.id+'&CodiceStato='+formData.codiceStato, formData);
  }
  //http://213.215.231.4/swappX/api/CLS_Iscrizioni/UpdateStato?id=5&CodiceStato=20

  deleteByClasseAlunno(ClasseSezioneAnnoID: number, idAlunno: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+ClasseSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=243
  }

  
  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/' + id); 
  }
      




      
}

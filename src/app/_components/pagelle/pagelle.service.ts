import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagelleService {

  constructor(private http: HttpClient) { }

  listByClasseSezioneAnno(idClasseSezioneAnno: number): Observable <any> {
    //return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno='+idClasseSezioneAnno);  
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno/'+idClasseSezioneAnno); 
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno=5
  }
  
  listByAnno(idAnno: number): Observable <any> {
    //return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno='+idClasseSezioneAnno);  
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByAnno/'+idAnno); 
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAnno/1
  }

  listByAlunno(idAlunno: number): any {
    //restituisce tutte le classiSezioniAnni di un certo Alunno
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByAlunno/' + idAlunno);  
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAlunno/3
  }

  getByAlunnoAndClasseSezioneAnno(idClasseSezioneAnno: number, idAlunno: number): Observable <CLS_Iscrizione> {
    return this.http.get <CLS_Iscrizione>( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+idClasseSezioneAnno);  
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=1
  }

  getByAlunnoAndAnno(idAnno: number, idAlunno: number): Observable <CLS_Iscrizione> {
    return this.http.get <CLS_Iscrizione>( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetByAlunnoAndAnno?idAlunno='+idAlunno+'&idAnno='+idAnno);  
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetByAlunnoAndAnno?idAlunno=3&idAnno=2
  }

  post(formData: any): Observable <any>{

    formData.id = 0;
    formData.statoID = 1;
    //formData.dtIns= "01/01/2022";
    //console.log ("formData post Iscrizioni", formData);
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni' , formData);  
  }
  
  //bisogna passare alla post un formData
  //updateStato (id: number, codiceStato: number) {
  updateStato(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni/UpdateStato?id='+formData.id+'&CodiceStato='+formData.codiceStato, formData);
  }
  //http://213.215.231.4/swappX/api/CLS_Iscrizioni/UpdateStato?id=5&CodiceStato=20

  deleteByAlunnoAndClasseSezioneAnno(ClasseSezioneAnnoID: number, idAlunno: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+ClasseSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=243
  }

  delete(id: number): Observable <any>{
    console.log ("iscrizioni.delete", id);
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/' + id); 
  }
      
}

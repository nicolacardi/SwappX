import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_File } from 'src/app/_models/DOC_File';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class FilesService {

  constructor(private http: HttpClient) { }

  get(fileID: number): Observable<DOC_File>{
    return this.http.get<DOC_File>(environment.apiBaseUrl+'DOC_Files/'+fileID);   
    //http://213.215.231.4/swappX/api/DOC_File/285
  }
 
  getByDocAndTipo(docID: any, tipoDoc: string): Observable<DOC_File>{
    return this.http.get<DOC_File>(environment.apiBaseUrl+'DOC_Files/GetByDocAndTipo/'+docID+"/"+tipoDoc);   
    //http://213.215.231.4/swappX/api/DOC_Files/getByDocAndTipo/1/Pagella
  }
  
  put(formData: any): Observable <any>{
    //console.log ("sto per spedire in put:", formData);
    formData.estensione = "cic";
    return this.http.put( environment.apiBaseUrl  + 'DOC_Files/' + formData.id , formData);    
  }

  post(formData: any): Observable <DOC_File>{
    delete formData.id;
    return this.http.post<DOC_File>( environment.apiBaseUrl  + 'DOC_Files' , formData);  
  }
}
 
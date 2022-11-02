import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable , ReplaySubject} from 'rxjs';
import { concatMap, map, switchMap, tap } from 'rxjs/operators';
import jsPDF from 'jspdf';

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



  saveFilePagella(rpt :jsPDF, objPagellaID: number):boolean{
   
    //Preparazione Blob con il contenuto base64 del pdf e salvataggio su DB
    let blobPDF = new Blob([rpt.output('blob')],{type: 'application/pdf'});
    
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(blobPDF);
    reader.onload = (x) => result.next(btoa(x.target!.result!.toString()));
    
    let formDataFile!:                                DOC_File;
    formDataFile = {
      tipoDoc:         "Pagella",
      docID:           objPagellaID,
      estensione:       "pdf"
    };
    
    result.pipe (
      tap(val=> formDataFile.fileBase64 = val),
      
      //ora cerca se esiste già un record nei file...
      concatMap(() => this.getByDocAndTipo(objPagellaID, "pagella")),

      //a seconda del risultato fa una post o una put
      switchMap(res => {
        if (res == null) {
          //console.log ("non ha trovato=> esegue una post")
          return this.post(formDataFile)
        } else {
          //console.log ("ha trovato=> valorizza l'id e esegue una put")
          formDataFile.id = res.id
          return this.put(formDataFile)
        }
      }),
    ).subscribe(
      res => { return true} ,
      err => { return false}
    );
  return true;

    //return result;
  }
}
 
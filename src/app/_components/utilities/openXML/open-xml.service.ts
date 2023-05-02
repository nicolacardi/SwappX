import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { environment, tagDocument } from 'src/environments/environment';
  

@Injectable({
  providedIn: 'root'
})
export class OpenXMLService {

  constructor(private http: HttpClient) { }


  downloadFile(): void {

    // this.http.get(environment.apiBaseUrl+'openXML/DownloadOutputFile', { responseType: 'blob' })

      this.http.post(environment.apiBaseUrl+'openXML/CreaDocumento',tagDocument, { responseType: 'blob' })
      .subscribe((response:any) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        saveAs(blob, 'output.docx');
      });

    //http://213.215.231.4/swappX/api/openXML/CreaDocumento
  }


}




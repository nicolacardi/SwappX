import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OpenXMLService {

  constructor(private http: HttpClient) { }


  downloadFile(): void {
    this.http.get(environment.apiBaseUrl+'openXML/DownloadOutputFile', { responseType: 'blob' })
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        saveAs(blob, 'output.docx');
      });

    //http://213.215.231.4/swappX/api/openXML/DownloadOutputFile
  }


}

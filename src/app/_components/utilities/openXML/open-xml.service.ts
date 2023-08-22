import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { saveAs }                               from 'file-saver';
import { environment }                          from 'src/environments/environment';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';
  

@Injectable({
  providedIn: 'root'
})
export class OpenXMLService {

  constructor(private http: HttpClient) { }



  downloadFile(tagDocument: RPT_TagDocument, nomeFile: string): void {
      //questo service richiede 
      //- un tagDocument, ossia un oggetto complesso di tipo RPT_TagDocument che a sua volta contiene
          //  -il templateName 
          //  -una serie di TagFields {tagName+tagValue}
          //  -eventualmente una tagTable a sua volta oggetto complesso
      //- un nomeFile con cui salvare il risultato
      //scarica il file risultante

      this.http.post(environment.apiBaseUrl+'RPT_openXML/CreaDocumento',tagDocument, { responseType: 'blob' })
      .subscribe((response:any) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        saveAs(blob, nomeFile);
      });

    //http://213.215.231.4/swappX/api/RPT_openXML/CreaDocumento
  }

}




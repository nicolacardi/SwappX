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



  
  createAndDownloadFile(tagDocument: RPT_TagDocument, nomeFile: string): void {
    //questa routine consente di RICEVERE il file...forse andrebbe fatta una routine che lo crea (e se ne occupa il WS di salvarlo) E uno che lo scarica
    // console.log ("open-xml.service - downloadFile - tagDocument", tagDocument);
      //questo service richiede 
      //- un tagDocument, ossia un oggetto complesso di tipo RPT_TagDocument che a sua volta contiene
          //  -il templateName 
          //  -una serie di TagFields {tagName+tagValue}
          //  -eventualmente una tagTable a sua volta oggetto complesso
      //- un nomeFile con cui salvare il risultato
      //scarica il file risultante

      this.http.post(environment.apiBaseUrl+'RPT_openXML/CreateDocument',tagDocument, { responseType: 'blob' })
      .subscribe((response:any) => {
        //il service restituisce un Blob che qui di seguito viene scaricato
        const blob = new Blob([response], { type: 'application/octet-stream' });
        saveAs(blob, nomeFile);
      });

    //http://213.215.231.4/swappX/api/RPT_openXML/CreateDocument
  }

}




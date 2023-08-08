//#region ----- IMPORTS ------------------------
import { HttpClient, HttpEventType }                           from '@angular/common/http';
import { Component }                            from '@angular/core';
import { Subscription, finalize } from 'rxjs';

//#endregion

@Component({
  selector: 'app-fileuploads',
  templateUrl: './fileuploads.component.html',
  styleUrls: ['../impostazioni.component.css']
})
export class FileuploadsComponent {
//#region ----- Variabili ----------------------
    fileName = '';
    requiredFileType!:                          string;
    uploadProgress!:                            number;
    uploadSub!:                                 Subscription;
//#endregion

//#region ----- Constructor --------------------
    constructor(private http: HttpClient) {}
//#endregion

onFileSelected(event: any){

  console.log (event.target);
  const file:File = event.target.files[0];

  if (file) {
      this.fileName = file.name;
      const formData = new FormData();          //crea un form
      formData.append("thumbnail", file);       //ci attacca il file
      console.log (formData);
      const upload$ = this.http.post("/api/thumbnail-upload", formData, {
        reportProgress: true,
        observe: 'events'
    })
      .pipe(
        finalize(() => this.reset())
    );

    this.uploadSub = upload$.subscribe(event => {
      if (event.type == HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * (event.loaded / event.total!));
      }
    })
  }
}

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = 0;
    //this.uploadSub = null;
  }
}
//#region ----- IMPORTS ------------------------
import { HttpClient, HttpEventType }                           from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild }                    from '@angular/core';
import { get } from 'http';
import { Subscription, finalize } from 'rxjs';

//components
import { DialogOkComponent }                    from '../../../_components/utilities/dialog-ok/dialog-ok.component';
import { PhotocropComponent }                   from '../../../_components/utilities/photocrop/photocrop.component';
import { SnackbarComponent }                    from '../../../_components/utilities/snackbar/snackbar.component';
import { Utility }                              from '../../../_components/utilities/utility.component';
//import { PersonaFormComponent }                 from '../../_components/persone/persona-form/persona-form.component';

//services
import { EventEmitterService }                  from 'src/app/_services/event-emitter.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { UserService }                          from 'src/app/_user/user.service';
//import { PersoneService }                       from '../../_components/persone/persone.service';

//models
//import { _UT_UserFoto }                         from 'src/app/_models/_UT_UserFoto';
//import { User }

//#endregion

@Component({
  selector: 'app-fileuploads',
  templateUrl: './fileuploads.component.html',
  styleUrls: ['../impostazioni.component.css']
})

export class FileuploadsComponent implements OnInit {

//#region ----- Variabili ----------------------
  logoScuolaHtml!: string;

  fileLogoScuola!: string;
  fileLogoEmail!: string;
  fileTimbro!: string;
    

  requiredFileType!:                          string;
  uploadProgress!:                            number;
  uploadSub!:                                 Subscription;

  imgFile!:                                     string;
  foto!:                                        string;
  //fotoObj!:                                     _UT_UserFoto
  //form! :                                       UntypedFormGroup;

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;

//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialog:                             MatDialog,
              private eventEmitterService:                EventEmitterService,
              private _snackBar:                          MatSnackBar) { 

   

    
  }
//#endregion


  ngOnInit(): void {

  //TODO: caricare i loghi da WS

  }

  onFileSelected(tmp:any, name : any){

  }
  onImageChange(e: any) {
    
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile = reader.result as string;

        Utility.compressImage( this.imgFile, 200, 200)
              .then(compressed => this.immagineDOM.nativeElement.src = compressed);
      };
    }
  }

  cropImage(e: any) {
  
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

      const dialogRef = this._dialog.open(PhotocropComponent, {
        width: '270px',
        height: '400px',
        data: {file: e.target.files}
      });
    }
  }

  save(){

  /*
    let formData = {
      userID:     this.currUser.userID,   
      UserName:   this.form.controls.username.value,
      Email:      this.form.controls.email.value,
      Password:   "",
      PersonaID:  this.currUser.personaID
      //FullName:   this.form.controls.fullname.value,
    };

    if(this.immagineDOM != undefined){
      this.fotoObj.userID = this.currUser.userID;
      this.fotoObj.foto = this.immagineDOM.nativeElement.src;

      this.svcUser.save(this.fotoObj).subscribe( () => {
          this.eventEmitterService.onAccountSaveProfile();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo salvato', panelClass: ['green-snackbar']});
        }
      );
    }
    */
  }
}
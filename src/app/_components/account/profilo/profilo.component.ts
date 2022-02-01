import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { PhotocropComponent } from '../../utilities/photocrop/photocrop.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { Utility } from '../../utilities/utility.component';

//services
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
import { UserService } from 'src/app/_user/user.service';

//models
import { _UT_UserFoto } from 'src/app/_models/_UT_UserFoto';
import { User } from 'src/app/_user/Users';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['../account.component.css']
})

export class ProfiloComponent implements OnInit {
  imgFile!:         string;
  foto!:            string;
  fotoObj!:         _UT_UserFoto
  form! :           FormGroup;
  formPsw! :           FormGroup;
  public currUser!: User;

  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;
  @ViewChild('canvasDOM', {static: false}) canvasDOM!: ElementRef;

  constructor(
    private fb:                   FormBuilder, 
    private svcUser:              UserService,
    public _dialog:               MatDialog,
    private router:               Router,
    private eventEmitterService:  EventEmitterService,
    private _snackBar:            MatSnackBar
) { 

    this.form = this.fb.group({
      file:           ['' , [Validators.required]],
      username:       [{value:'' , disabled: true}, [Validators.required]],
      email:          [''],
      fullname:       ['' , [Validators.required]],
    });
  }

  ngOnInit(): void {

    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;
    this.form.controls.username.setValue(this.currUser.username);
    this.form.controls.email.setValue(this.currUser.email);
    this.form.controls.fullname.setValue(this.currUser.fullname);
    
    this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
      val=> {
        if(val){
          this.imgFile = val.foto; 
          this.fotoObj = val;
        }
      }
    );
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
                  .then(compressed => {
                    this.immagineDOM.nativeElement.src = compressed
                  });
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

    var formData = {
      userID:     this.currUser.userID,   
      UserName:   this.form.controls.username.value,
      Email:      this.form.controls.email.value,
      FullName:   this.form.controls.fullname.value,
    };

    this.svcUser.put(formData).subscribe(
      ()=> {
        this.currUser.username = this.form.controls.username.value;
        this.currUser.email =this.form.controls.email.value;
        this.currUser.fullname = this.form.controls.fullname.value;

        localStorage.setItem('currentUser', JSON.stringify(this.currUser));
      },
      err => {
        console.log("ERRORE this.svcUser.put", formData);
      }
    );

    if(this.immagineDOM != undefined){
      this.fotoObj.userID = this.currUser.userID;
      this.fotoObj.foto = this.immagineDOM.nativeElement.src;

      this.svcUser.saveUserFoto(this.fotoObj)
      .subscribe(() => {
          this.eventEmitterService.onAccountSaveProfile();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo salvato', panelClass: ['green-snackbar']});
        }
      );
    }
  }
}
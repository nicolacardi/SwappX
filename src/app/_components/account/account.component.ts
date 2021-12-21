import { templateJitUrl } from '@angular/compiler';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { _UT_UserFoto } from 'src/app/_models/_UT_UserFoto';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';
import { DialogOkComponent } from '../utilities/dialog-ok/dialog-ok.component';
import { PhotocropComponent } from '../utilities/photocrop/photocrop.component';
import { Utility } from '../utilities/utility.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  imgFile!:         string;
  foto!:            string;
  fotoObj!:         _UT_UserFoto
  form! :           FormGroup;
  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;
  @ViewChild('canvasDOM', {static: false}) canvasDOM!: ElementRef;

  
  public currUser!: User;
  constructor(private fb:         FormBuilder, 
              private svcUser:    UserService,
              public _dialog:     MatDialog,
              private router:           Router,
    ) { 


    this.form = this.fb.group({
      file:           ['' , [Validators.required]],
      username:       [{value:'' , disabled: true}, [Validators.required]],
      fullname:       ['' , [Validators.required]],
      password:       [''],
      newPassword:    [''],
      repeatPassword: ['']
    });
  }

  ngOnInit(): void {
    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;
    this.form.controls.username.setValue(this.currUser.username);
    this.form.controls.fullname.setValue(this.currUser.fullname);
    this.svcUser.getUserFoto(this.currUser.userID).subscribe(val=> {this.imgFile = val.foto; this.fotoObj = val;});
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


  saveProfile(){
    //this.fotoObj.foto = this.imgFile;
    this.fotoObj.foto = this.immagineDOM.nativeElement.src;
    this.svcUser.putUserFoto(this.fotoObj).subscribe();


  }




}
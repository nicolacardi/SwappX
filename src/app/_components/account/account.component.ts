import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  form! :                     FormGroup;
  selectedFile!:              File;
  imgFile!: string;
  imgFileResized!: string;

  constructor(  private fb:                           FormBuilder, 
                private http: HttpClient
    )
    {

      this.form = this.fb.group({
        id:                         [null],
        nome:                       ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        cognome:                    ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        password:                   [''],
        newPassword:                [''],
        repeatNewPassword:          [''],

        name:                       ['', [Validators.required]],
        file:                       ['', [Validators.required]],
        imgSrc:                     ['', [Validators.required]]

      });
   }

  ngOnInit(): void {
  }




  get uf(){
    return this.form.controls;
  }


  onImageChange(e: any) {
    const reader = new FileReader();
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile = reader.result as string;
        console.log (this.imgFile);
        this.form.patchValue({
          imgSrc: reader.result  //mette in imgSrc, un campo del form, l'immagine, non tanto il percorso!
        });
   


        // var canvas = document.createElement("canvas");

        // // var canvas = document.getElementById("canvas");
        // var ctx = canvas.getContext("2d");

        // // Actual resizing
        // ctx!.drawImage(e.target.files, 0, 0, 300, 300);

        // // Show resized image in preview element
        // var dataurl = canvas.toDataURL(e.target.files.type);
        // this.imgFileResized = dataurl;
      };
    }
  }
   
  upload(){
    console.log(this.form.value);
    this.http.post('http://localhost:4200/file-upload.php', this.form.value)
      .subscribe(response => {
        alert('Image has been uploaded.');
      })
  }


}

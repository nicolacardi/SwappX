import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { _UT_UserFoto } from 'src/app/_models/_UT_UserFoto';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';

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
  public currUser!: User;
  constructor(private http:     HttpClient,
              private fb:       FormBuilder, 
              private svcUser:  UserService
    ) { 


    
    this.form = this.fb.group({
      name:           ['', [Validators.required]],
      file:           ['', [Validators.required]],
      imgSrc:         [this.foto, [Validators.required]]
    });
  }

  ngOnInit(): void {
    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;

    this.svcUser.getUserFoto(this.currUser.userID).subscribe(val=> {this.imgFile = val.foto; this.fotoObj = val;});
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
        this.form.patchValue({
          imgSrc: reader.result
        });

        this.fotoObj.foto = this.imgFile;
        this.svcUser.putUserFoto(this.fotoObj).subscribe();

   
      };

    }
  }
   
  // upload(){
  //   console.log(this.form.value);
  //   this.http.post('http://localhost:8888/file-upload.php', this.form.value)
  //     .subscribe(response => {
  //       alert('Image has been uploaded.');
  //     })
  // }



}

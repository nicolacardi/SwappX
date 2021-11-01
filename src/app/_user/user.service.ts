import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup} from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../_models/Users';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  private BehaviourSubjectLoggedIn = new BehaviorSubject<boolean>(false);
  obsLoggedIn = this.BehaviourSubjectLoggedIn.asObservable();

  private BehaviourSubjectcurrentUser : BehaviorSubject<User>;
  public obscurrentUser: Observable<User>;
  
  public currUser! : User;

  readonly BaseURI = environment.apiBaseUrl;
  
      
  constructor(private fb: FormBuilder, private http: HttpClient) { 

    //The BehaviorSubject holds the value that needs to be shared with other components
    this.BehaviourSubjectcurrentUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    this.obscurrentUser = this.BehaviourSubjectcurrentUser.asObservable();
  }

  formModel = this.fb.group(
      {
        UserName: ['', Validators.required],
        Email: ['', Validators.email],
        FullName: [''],
        Passwords: this.fb.group({
          Password: ['', [Validators.required, Validators.minLength(4)]],
          ConfirmPassword: ['', Validators.required]
        },
      {
       validator: this.comparePasswords
      }
    ) 
  });

  
  //Login(userName: string, userPwd: string) {
  Login(formData: any) {
    return this.http.post<User>(this.BaseURI  +'ApplicationUser/Login', formData )
      .pipe(map(user => {
        if (user && user.token) {

          user.isLoggedIn = true;

          // store user details in local storage to keep user logged in
          localStorage.setItem('token', user.token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.BehaviourSubjectcurrentUser.next(user);
        }     
      return user;
    }));
  }

  Logout(){
    //console.log("DEBUG: User.service/Logout");
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    const logOutUser = <User>{};
    logOutUser.isLoggedIn = false;
    this.BehaviourSubjectcurrentUser.next(logOutUser);
  }

  Register()
  {
    var body = {
      UserName: this.formModel.value.UserName,
      Email: this.formModel.value.Email,
      FullName: this.formModel.value.FullName,
      Password: this.formModel.value.Passwords.Password
    };
    //return  this.http.post(this.BaseURI +'/ApplicationUser/Register', body );
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/Register', body );
  }

  public get currentUserValue(): User {
    return this.BehaviourSubjectcurrentUser.value;
  }


  fakeLogin() {
    this.BehaviourSubjectLoggedIn.next(true);
  }
  
  list(): Observable<User[]>{
    return this.http.get<User[]>(environment.apiBaseUrl+'ApplicationUser');
  }
 

  stringJson: any;
  stringObject: any;
  public  getUser() : User {
  //public  getUser() {

    var tmp = localStorage.getItem('currentUser');
    this.stringJson = JSON.stringify(tmp);
    this.stringObject = JSON.parse(this.stringJson);

    return this.stringObject;

  }


//AS: VERIFICARE
  getUserProfile(appUser: string){
    //AS: sostituito da auth.interceptor
    //var tokenHeader = new HttpHeaders({'Authorization':'Bearer '+ localStorage.getItem('token')});
    //return tokenHeader;

    //return this.http.get(this.BaseURI + '/UserProfile', {headers: tokenHeader});
    //headers : req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token)'))

    //auth.interceptor
    //return this.http.get(environment.apiBaseURI + '/UserProfile', );
    //return this.http.get(this.BaseURI  + '/UserProfile', );
    
    //var localUser = localStorage.getItem('appUser');

    //console.log("DEBUG -getUserProfile:" + this.BaseURI  + '/ApplicationUser/'+ localUser );
    //return this.http.get(this.BaseURI  + '/ApplicationUser/' + this.formModel.value.UserName, );
    return this.http.get(this.BaseURI  + '/ApplicationUser/' + appUser, );

  }

  changeLoggedIn(val: boolean) {
    this.BehaviourSubjectLoggedIn.next(val);    
  }

  //AS: custom validator
  comparePasswords(fb: FormGroup )
  {
    let confirmPasswordCtrl = fb.get('ConfirmPassword');
    //passwordMismatch
    //comfirmPasswordCtrl.errors{passwordMismatch:true};
    
    /* TODO: ERRORI DA CAPIRE
    if(confirmPasswordCtrl!.errors == null|| 'passwordMismatch' in confirmPasswordCtrl!.errors){
      if( fb.get('Password').value !=  confirmPasswordCtrl.value )
        confirmPasswordCtrl.setErrors({passwordMismatch:true});
      else
        confirmPasswordCtrl.setErrors(null);
    }
    */
  }
}

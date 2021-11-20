import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup} from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { catchError, map, timeout } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User, UserRole } from './Users';
import { _UT_Parametro } from '../_models/_UT_Parametro';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  readonly BaseURI = environment.apiBaseUrl;

  private BehaviourSubjectcurrentUser : BehaviorSubject<User>;      //holds the value that needs to be shared with other components
  public obscurrentUser: Observable<User>;
  public currUser! : User;

  constructor(private fb: FormBuilder, private http: HttpClient) { 
    this.BehaviourSubjectcurrentUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    this.obscurrentUser = this.BehaviourSubjectcurrentUser.asObservable();
  }

  public get currentUserValue(): User {
    return this.BehaviourSubjectcurrentUser.value;
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

    let httpPost$ = this.http.post<User>(this.BaseURI  +'ApplicationUser/Login', formData )
      .pipe(timeout(8000))  
      .pipe(map(user => {
        if (user && user.token) {
          user.isLoggedIn = true;
          user.role= UserRole.Admin;        //Debug Role

          // store user details in local storage to keep user logged in
          localStorage.setItem('token', user.token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.BehaviourSubjectcurrentUser.next(user);
        }
        return user;    //AS: ATTENZIONE, SENZA QUESTA RIGA NON VA
      }));


    let httpParam1$ =  this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/GetByParName/AnnoCorrente');
    let httpParam$ =  this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/GetByParName/AnnoCorrente')
      //.pipe(timeout(8000))  
      .pipe(map( par => {

        //sessionStorage.setItem();
        localStorage.setItem(par.parName, par.parValue);
        return par;   //AS: ATTENZIONE, SENZA QUESTA RIGA NON VA
      }));

    return forkJoin([ httpPost$ ,httpParam$  ]);
  }

  Logout(){
    
    //Pulizia cookies
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('AnnoCorrente');

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
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/Register', body );
  }


  fakeLogin() {
    //this.BehaviourSubjectLoggedIn.next(true);
  }
  
  list(): Observable<User[]>{
    return this.http.get<User[]>(environment.apiBaseUrl+'ApplicationUser');
  }
 
  public  getUser() : User {

    var stringJson: any;
    var stringObject: any;
    var tmp = localStorage.getItem('currentUser');

    stringJson = JSON.stringify(tmp);
    stringObject = JSON.parse(stringJson);

    return stringObject;
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

  /*
  changeLoggedIn(val: boolean) {
    this.BehaviourSubjectLoggedIn.next(val);    
  }
*/

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

import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup} from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { catchError, map, timeout } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User, UserRole } from './Users';
import { _UT_Parametro } from '../_models/_UT_Parametro';
import { _UT_UserFoto } from '../_models/_UT_UserFoto';
import { ParametriService } from '../_services/parametri.service';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  readonly BaseURI = environment.apiBaseUrl;

  private BehaviourSubjectcurrentUser : BehaviorSubject<User>;      //holds the value that needs to be shared with other components
  public obscurrentUser: Observable<User>;
  //public currUser! : User;

  constructor(
    private fb:             FormBuilder,
    private http:           HttpClient,
    private svcParametri:   ParametriService
    ) { 
    this.BehaviourSubjectcurrentUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    this.obscurrentUser = this.BehaviourSubjectcurrentUser.asObservable();
  }

  public get currentUser(): User {
    return this.BehaviourSubjectcurrentUser.value;
  }

  formModel = this.fb.group(
      {
        UserName:   ['', Validators.required],
        Email:      ['', Validators.email],
        FullName:   [''],
        Passwords: this.fb.group({
          Password:         ['', [Validators.required, Validators.minLength(4)]],
          ConfirmPassword:  ['', Validators.required]
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
          
          //TEMP
          //user.role= UserRole.Admin;        //Debug Role

          // store user details in local storage to keep user logged in
          localStorage.setItem('token', user.token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.BehaviourSubjectcurrentUser.next(user);
        }
        return user;
      }));

    //let httpParam$ =  this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/GetByParName/AnnoCorrente')
    let httpParam$ = this.svcParametri.getByParName('AnnoCorrente')
      .pipe(map( par => {
        //sessionStorage.setItem();
        //localStorage.setItem(par.parName, par.parValue);
        localStorage.setItem(par.parName, JSON.stringify(par));
        return par;
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
    let body = {
      UserName:   this.formModel.value.UserName,
      Email:      this.formModel.value.Email,
      FullName:   this.formModel.value.FullName,
      Password:   this.formModel.value.Passwords.Password
    };
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/Register', body );
  }

  get(userID: string): Observable<User>{
    return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/' + userID);
    //http://213.215.231.4/swappX/api/ApplicationUser/b19efc9f-5502-4396-b076-45e6c3d9ef21
  }

  getByUsername(userName: string): Observable<User>{
    return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByUsername' + userName);
    //http://213.215.231.4/swappX/api/ApplicationUser/GetByUsername/a
  }


  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl +'ApplicationUser/'+ formData.userID, formData );
  }

  post(formData: any): Observable <any>{
    console.log (formData);
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/Register', formData );
  }


  ChangePassword(formData: any): Observable <any>{
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/ChangePassword?userID=' + formData.userID + "&currPassword=" + formData.currPassword + "&newPassword=" + formData.newPassword,formData);
    //https://213.215.231.4/swappX/api/ApplicationUser/ChangePassword?userID=75b01815-1282-4459-bbf5-61bc877a9100&currPassword=1234&newPassword=12345
  }

  ResetPassword(userID: string, Password: string): Observable <any>{
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/ResetPassword?userID=' + userID + "&newPassword=" + Password, null);
    //https://213.215.231.4/swappX/api/ApplicationUser/ResetPassword?userID=75b01815-1282-4459-bbf5-61bc877a9100&Password=12345
  }
  
  list(): Observable<User[]>{
    return this.http.get<User[]>(environment.apiBaseUrl+'ApplicationUser');
    //http://213.215.231.4/swappX/api/ApplicationUser
  }

  //questo metodo si chiama getFotoByUserID e non getByUserID come il metodo relativo nel WS perchè lo abbiamo messo nel service user e non in un service Foto
  getFotoByUserID(userID: string): Observable<_UT_UserFoto>{
    return this.http.get<_UT_UserFoto>(environment.apiBaseUrl+'_UT_UsersFoto/GetByUserID/' + userID);
    //http://213.215.231.4/swappX/api/_UT_UsersFoto/GetByUserID/75b01815-1282-4459-bbf5-61bc877a9100
  }
 
  save(formData: any): Observable<any>{    
    if(formData.id == null || formData.id <= 0)
      return this.http.post(environment.apiBaseUrl+'_UT_UsersFoto', formData);
    else
      return this.http.put(environment.apiBaseUrl+'_UT_UsersFoto/' + formData.id, formData);
  }
 
 



//AS: VERIFICARE
  getUserProfile(appUser: string){
    //AS: sostituito da auth.interceptor
    //let tokenHeader = new HttpHeaders({'Authorization':'Bearer '+ localStorage.getItem('token')});
    //return tokenHeader;

    //return this.http.get(this.BaseURI + '/UserProfile', {headers: tokenHeader});
    //headers : req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token)'))

    //auth.interceptor
    //return this.http.get(environment.apiBaseURI + '/UserProfile', );
    //return this.http.get(this.BaseURI  + '/UserProfile', );
    
    //let localUser = localStorage.getItem('appUser');

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


  delete(userID: string): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ApplicationUser/' + userID);    
  }
}



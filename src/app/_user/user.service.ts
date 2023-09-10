import { Injectable }                           from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup} from '@angular/forms';
import { HttpClient }                           from "@angular/common/http";
import { tap, timeout }                         from 'rxjs/operators';
import { BehaviorSubject, Observable }          from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';
import { User }                                 from './Users';

//services
import { PersoneService }                       from '../_components/persone/persone.service';

//classes
import { _UT_Parametro }                        from '../_models/_UT_Parametro';
import { _UT_UserFoto }                         from '../_models/_UT_UserFoto';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  readonly BaseURI = environment.apiBaseUrl;

  private BehaviourSubjectcurrentUser :         BehaviorSubject<User>;      
  public BehaviourSubjectlistRoles :            BehaviorSubject<string[]>;      


  public obscurrentUser:                        Observable<User>;

  constructor(private fb:                                 UntypedFormBuilder,
              private http:                               HttpClient,
              private svcPersona:                         PersoneService)   { 
                
    this.BehaviourSubjectcurrentUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    this.BehaviourSubjectlistRoles = new BehaviorSubject<string[]>([]);

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
      }) 
  });


  getUserRoles(personaID: number){
    //estrae lstruoli e la inserisce nel BehaviourSubjectlistRoles
    this.svcPersona.listRoles(personaID)
    .subscribe(
      lstruoli=> {
        this.BehaviourSubjectlistRoles.next(lstruoli);
      }
    )
  }


  //Login(userName: string, userPwd: string) {
  Login(formData: any) {

    let obsLoginPersona$ = this.http.post<User>(this.BaseURI  +'ApplicationUser/Login', formData )
      .pipe(timeout(6000))  //è il timeout oltre il quale viene dato l'errore
      .pipe(
        tap(
          user => {
            if (user && user.token) {
              //user.isLoggedIn = true;
              user.personaID = user.persona!.id;
              user.fullname = user.persona!.nome + " " + user.persona!.cognome;
              //user.tipoPersonaID = user.persona!.tipoPersonaID;
              //user.TipoPersona = user.persona!.tipoPersona;
              localStorage.setItem('token', user.token!);
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.BehaviourSubjectcurrentUser.next(user);
            }
            else{
              //Passerà mai di qua ?
              this.Logout();
            }

          }
        ),
        // concatMap( user =>   ( 
        //   this.svcPersona.get(user.personaID)
        //     .pipe(
        //       tap(val => {
        //         if (user && user.token) {
        //           user.isLoggedIn = true;
                      
        //           //Dati di PER_Persona
        //           user.personaID = val.id;
        //           user.fullname = val.nome + " " + val.cognome;
        //           user.tipoPersonaID = val.tipoPersonaID;
        //           user.TipoPersona = val.tipoPersona;
        //           localStorage.setItem('token', user.token!);
        //           localStorage.setItem('currentUser', JSON.stringify(user));
                  
        //           this.BehaviourSubjectcurrentUser.next(user);
        //         }
        //         else{
        //           //Passerà mai di qua ?
        //           this.Logout();
        //         }
        //       }),
        //     )
        // )
      //),

      );


    /*
    this.svcParametri.getByParName('AnnoCorrente')
      .pipe(map( par => {
        //sessionStorage.setItem();
        localStorage.setItem(par.parName, JSON.stringify(par));
        return par;
      })
    ).subscribe();
    */
    return obsLoginPersona$;

    //return forkJoin([ httpPost$ ,httpParam$  ]);      //Concatenazione di due observable, in qs modo se ne fa la subscribe in un colpo solo
  }

  Logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('AnnoCorrente');

    // const logOutUser = <User>{};
    // logOutUser.isLoggedIn = false;
    // console.log ("logOutUser", logOutUser);
    // this.BehaviourSubjectcurrentUser.next(logOutUser);

  }

  Register() { //non viene mai usata

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

  getByUsernameAndTmpPassword(userName: string, tmpPassword: string): Observable<User>{
    return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByUsernameAndTmpPassword/' + userName + '/'+ tmpPassword);
    //http://213.215.231.4/swappX/api/ApplicationUser/GetByUsernameAndTmpPassword/a/ciccione
  }

  getByUsername(userName: string): Observable<User>{
    return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByUsername' + userName);
    //http://213.215.231.4/swappX/api/ApplicationUser/GetByUsername/a
  }

  getByPersonaID(personaID: number): Observable<User>{
    return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByPersonaID/' + personaID);
    //http://213.215.231.4/swappX/api/ApplicationUser/GetByPersonaID/19
  }

  getByMailAddress(mailAddress: string): Observable<User>{
    return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByMailAddress/' + mailAddress);
    //http://213.215.231.4/swappX/api/ApplicationUser/GetByMailAddress/nicola.cardi@gmail.com
  }

  put(formData: any): Observable <any>{
    console.log(formData);
    return this.http.put(environment.apiBaseUrl +'ApplicationUser/'+ formData.userID, formData );
  }

  post(formData: any): Observable <any>{
    //console.log (formData);
    return  this.http.post(environment.apiBaseUrl +'ApplicationUser/Register', formData );
  }
  
  delete(userID: string): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ApplicationUser/' + userID);    
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

    if(formData.id == null || formData.id <= 0){
      return this.http.post(environment.apiBaseUrl+'_UT_UsersFoto', formData);
    }
    else {
      return this.http.put(environment.apiBaseUrl+'_UT_UsersFoto/' + formData.id, formData);
    }
  }
 
 
/*
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
*/
  /*
  changeLoggedIn(val: boolean) {
    this.BehaviourSubjectLoggedIn.next(val);    
  }
*/


  //AS: custom validator
  comparePasswords(fb: UntypedFormGroup )
  {
    let confirmPasswordCtrl = fb.get('ConfirmPassword');
    //passwordMismatch
    //comfirmPasswordCtrl.errors{passwordMismatch:true};
    
    // TODO: ERRORI DA CAPIRE
    //if(confirmPasswordCtrl!.errors == null|| 'passwordMismatch' in confirmPasswordCtrl!.errors){
    //  if( fb.get('Password').value !=  confirmPasswordCtrl.value )
    //    confirmPasswordCtrl.setErrors({passwordMismatch:true});
    //  else
    //    confirmPasswordCtrl.setErrors(null);
    //}
    
  }
 


  
}



import { Injectable } from '@angular/core';
import { CanActivate,  ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';

import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor( private router:        Router, 
               private uService:      UserService,
               private _snackBar:     MatSnackBar ) {
  }

  // check if route is restricted by role
  canActivate( route:  ActivatedRouteSnapshot, state: RouterStateSnapshot):  boolean  {

    const currentUser = this.uService.currentUser;
    if (currentUser) {
      
 /*      
      console.log("Auth Guard | TipoPersona", currentUser.TipoPersona);
      console.log("DEBUG: route.data.roles - ");
      console.log(route.data);
      console.log("DEBUG: - currentUser ");
      console.log(currentUser);
 */
      
//BELLA MERDA N°2: adesso il controllo lo faccio con la descrizione del TipoPersona ... no beissimo...
      //if (route.data.roles && route.data.roles.indexOf(currentUser.ruoloID) === -1) {
      if (route.data.roles && route.data.roles.indexOf(currentUser.TipoPersona?.descrizione) === -1) {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Utente non autorizzato', panelClass: ['red-snackbar']
          });

          this.router.navigate(['/home']);
          return false;
      }
      return true;       // authorised so return true
    }

    //Not logged: redirect to Login 
    this.router.navigate(['user/login']);  
    return false;

    //versione con localStorage
    /*
    if(localStorage.getItem('token') != null){
      this.uService.changeLoggedIn(true);
      return true; 
    }
    else{
      //Not logged: redirect to Login        
      this.router.navigate(['user/login']);  
      this.uService.changeLoggedIn(false);
      return false;
    }
    */
  }

  /*
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
  */
}


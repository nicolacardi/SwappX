import { Injectable } from '@angular/core';
import { CanActivate,  ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';

import { UserService } from '../user.service';
import { firstValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard {

   private lstroles!: string[];
  constructor( private router:        Router, 
               private uService:      UserService,
               private _snackBar:     MatSnackBar ) {
  }

  //AUTHGUARD SERVE AD AUTORIZZARE O MENO L'ACCESSO ALLE PAGINE IN BASE A QUALCHE CONDIZIONE, AD ESEMPIO NEL NS CASO AL RUOLO

  async canActivate( route:  ActivatedRouteSnapshot, state: RouterStateSnapshot):  Promise<boolean>  {

    const currentUser = this.uService.currentUser;

    console.log("Auth.guard - canActivate - route.data [da app-routing]- ", route.data);


    //PESCANDO IL TIPOPERSONA (OLD)
    // if (currentUser) {
    //   console.log("Auth.guard - canActivate - currentUser ", currentUser);
    //   if (route.data.roles && route.data.roles.indexOf(currentUser.TipoPersona?.descrizione) === -1) {
    //     // if (route.data.roles && !route.data.roles.some((role: string) => this.lstroles.includes(role))) {
    //       this._snackBar.openFromComponent(SnackbarComponent, {
    //         data: 'Utente non autorizzato', panelClass: ['red-snackbar']
    //       });
    //       this.router.navigate(['/home']);
    //       return false;
    //   }
    //   return true;
    // }

    //PRIMO TENTATIVO DI CONFRONTARE LSTROLES CON ROUTE.DATA: INTERROGO IL BEHAVIOURSUBJECT E LO ASPETTO
    await firstValueFrom( this.uService.BehaviourSubjectlistRoles.pipe(tap(lstroles => {this.lstroles = lstroles})));

    if (currentUser) {
      console.log("Auth.guard - canActivate - this.lstroles ", this.lstroles);
      if (route.data && route.data.roles && !route.data.roles.some((role: string) => this.lstroles.includes(role))) {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Utente non autorizzato', panelClass: ['red-snackbar']
          });
          this.router.navigate(['/home']);
          console.log("return false");
          return false;
      }
      console.log("return true");
      return true;
      
    }

    //SECONDO TENTATIVO DI CONFRONTARE LSTROLES CON ROUTE.DATA: INTERROGO IL BEHAVIOURSUBJECT IN DIRETTA
    //NON FUNZIONA PERCHE' "INTANTO" VA AVANTI E QUINDI VA A NOTLOGGED IN
    // if (currentUser) {
    //   this.uService.BehaviourSubjectlistRoles.subscribe(lstroles => {
    //     console.log ("Auth.guard - canActivate - lstroles [da BS]", lstroles);
    //     if (route.data && route.data.roles && !route.data.roles.some((role: string) => lstroles.includes(role))) {
    //         this._snackBar.openFromComponent(SnackbarComponent, {
    //           data: 'Utente non autorizzato', panelClass: ['red-snackbar']
    //         });
    //         this.router.navigate(['/home']);
    //         console.log("return false");
    //         return false;
    //     }
    //     console.log("return true");
    //     return true;
    //   });
    // }


    console.log("Not logged: redirect to Login ");
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


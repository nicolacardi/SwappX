import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators'; 
import { Router }                               from '@angular/router';
import { User } from '../Users';
import { UserService } from '../user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private router: Router,
                private svcUser: UserService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        //console.log("test auth", req);
        if(localStorage.getItem('token') != null ){
            //console.log("c'è il token");

            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
                    //.set('Access-Control-Allow-Origin', '*')
                    //.set('Access-Control-Allow-Credentials', 'true')
            });
           
            return next.handle(clonedReq).pipe(
                tap({
                        next: res=> {},
                        error: err=> {
                            if(err.status == 401){
                                localStorage.removeItem('token');
                                       this.svcUser.Logout(); //01/09/23 TEST NICK             
                                this.router.navigateByUrl('/user/login');


                            }
                        }
                    }
                )
            )
        } else {
            //console.log("MANCA il token");

            return next.handle(req.clone());
        }
    }
}
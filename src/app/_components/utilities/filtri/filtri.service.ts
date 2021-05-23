import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
export class FiltriService {


    private AlunnoSubject = new BehaviorSubject<number>(0);
    AlunnoObs$: Observable<number> = this.AlunnoSubject.asObservable();
    
    passAlunno(data: number) {
        this.AlunnoSubject.next(data);
    }

    getAlunno () {
        return this.AlunnoObs$;
    }

    private GenitoreSubject = new BehaviorSubject<number>(0);
    GenitoreObs$: Observable<number> = this.GenitoreSubject.asObservable();
    
    passGenitore(data: number) {
        this.GenitoreSubject.next(data);
    }

    getGenitore () {
        return this.GenitoreObs$;
    }

}
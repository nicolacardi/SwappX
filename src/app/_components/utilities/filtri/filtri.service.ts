import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";
import { ALU_Alunno, ALU_test } from "src/app/_models/ALU_Alunno";

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


    // private AlunnoObjSubject = new BehaviorSubject<ALU_Alunno>();
    // AlunnoObjObs$: Observable<ALU_Alunno> = this.AlunnoObjSubject.asObservable();

    // passAlunnoObj(data: ALU_Alunno) {
    //     this.AlunnoObjSubject.next(data);
    // }

    // getAlunnoObj() {
    //     return this.AlunnoObjObs$;
    // }

}
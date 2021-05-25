import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";
import { ALU_Alunno } from "src/app/_models/ALU_Alunno";

@Injectable({
    providedIn: 'root'
  })
export class FiltriService {

    private pageSubject = new BehaviorSubject<string>('');
    pageObs$: Observable<string> = this.pageSubject.asObservable();

    passPage(data:string){
        this.pageSubject.next(data);
    }

    getPage() {
        return this.pageObs$;
    }

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
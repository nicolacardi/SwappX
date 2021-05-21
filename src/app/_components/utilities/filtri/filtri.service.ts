import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
export class FiltriService {

    private filtriSubject = new BehaviorSubject<number>(0);
    filtri$: Observable<number> = this.filtriSubject.asObservable();
    
    
    passData(data: number) {
        this.filtriSubject.next(data);
    }

    getData () {
        return this.filtri$;
    }



}
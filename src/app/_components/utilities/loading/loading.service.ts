import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
export class LoadingService {

    private loadingSubject = new BehaviorSubject<boolean>(false)
    loading$: Observable<boolean> = this.loadingSubject.asObservable();
    
    showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
        return of(null)
            .pipe(
                tap(()=> this.loadingOn()),
                concatMap(() => obs$), // emette lo stesso identico observable di quello che riceve in input ma ha attivato il loading
                finalize(()=> this.loadingOff())
            )
    }
    
    loadingOn() {
        this.loadingSubject.next(true);
    }

    loadingOff() {
        this.loadingSubject.next(false);
    }
}
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
        
        //Questo metodo riceve in input un observable obs$ di qualsiasi natura (...<T>...)
        //ritorna un observable che parte da un observable VUOTO (...of(null))
        //al quale viene AGGANCIATO l'observable obs$ (concatMap)
        //quindi alla fine viene restituito LO STESSO OBSERVABLE
        //ma la differenza è che NEL FRATTEMPO è stato attivato e poi disattivato il loading
        //il component LoadingComponent è stato caricato in app.component come <loading><loading>
        //e' un component VUOTO che contiene SOLO lo spinner che ha un bell'ngIf su loadingService.loading$ | async
        //loading$ è un BehaviorSubject, quindi un servizio stateful nel quale andiamo a scrivere true o false a seconda

        return of(null) 
            .pipe(
                
                tap(()=> {
                    //console.log("set loading on");
                    this.loadingOn();
                }),

                concatMap(() => obs$), // emette lo stesso identico observable di quello che riceve in input ma ha attivato il loading
                finalize(()=> {
                    //console.log("set loading off");
                    this.loadingOff()
                })
            )
    }
    
    loadingOn() {
        //console.log("this.loadingSubject - LoadingOn: sta per essere portato a true", this.loadingSubject.getValue());
        this.loadingSubject.next(true);
    }

    loadingOff() {
        //console.log("this.loadingSubject - LoadingOff: sta per essere portato a false", this.loadingSubject.getValue());
        this.loadingSubject.next(false);
    }
}
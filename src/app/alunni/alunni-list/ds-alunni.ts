import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of, timer } from "rxjs";
import { ALU_Alunno } from "src/app/_models/ALU_Alunno";
import { AlunniService } from "../../_services/alunni.service";
import { map, catchError, finalize, delayWhen, skip, filter, first, take } from 'rxjs/operators';

export class AlunniDataSource implements DataSource<ALU_Alunno> {

    private AlunniSubject = new BehaviorSubject<ALU_Alunno[]>([]);
    startItem! : number;
    endItem!: number;
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private svcALU_Alunni: AlunniService) {}

    connect(collectionViewer: CollectionViewer): Observable<ALU_Alunno[]> {
        return this.AlunniSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.AlunniSubject.complete();
        this.loadingSubject.complete();
    }

    //per paginazione e filtro server side
    // findAlunni(filter: string, sortOrder: string, pageNumber: number, pageSize: number) {
    //     this.loadingSubject.next(true);
    //     this.svcALU_Alunni.findAlunni(filter, sortOrder, pageNumber, pageSize)
    //     .pipe(
    //         //delayWhen(() => timer(2000)),
    //         catchError(() => of([])),
    //         finalize(() => this.loadingSubject.next(false))
    //     )
    //     .subscribe(res => this.AlunniSubject.next(res));
    // }

    loadAlunni() {
        this.loadingSubject.next(true);
        this.svcALU_Alunni.loadAlunni()
        .pipe(
            //delayWhen(() => timer(2000)),
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(res => this.AlunniSubject.next(res));
    }

    loadAlunniPage(pageSize: number, pageIndex: number) {
        this.startItem = pageSize * pageIndex;
        this.endItem = pageSize * (pageIndex + 1);
        this.loadingSubject.next(true);
        this.svcALU_Alunni.loadAlunni ()
        .pipe(
            //map(val => val.filter(val => val.cognome === "Cardi")), //Questa funziona e FILTRA!
            map(val => val.slice(this.startItem, this.endItem)),
            //map (val => { console.log (val)}), //questa funziona
            //map( val => val[2]) //questa funziona e restituisce il secondo valore

            //filter((val, index) =>index > 2),
            //skip(val=>val[0]),
            //map(val=>val),

            //map ( (val, index) =>  index > 1),
            //delayWhen(() => timer(2000)),
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )

        .subscribe(res => this.AlunniSubject.next(res));
        //.subscribe(val => console.log("cicciopasticcio", val));
    }

}

function tap(arg0: (val: any) => void): import("rxjs").OperatorFunction<ALU_Alunno[], unknown> {
    throw new Error("Function not implemented.");
}





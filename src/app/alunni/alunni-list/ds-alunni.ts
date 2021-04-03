import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of, timer } from "rxjs";
import { ALU_Alunno } from "src/app/_models/ALU_Alunno";
import { AlunniService } from "../../_services/alunni.service";
import { map, catchError, finalize, delayWhen } from 'rxjs/operators';

export class AlunniDataSource implements DataSource<ALU_Alunno> {

    private AlunniSubject = new BehaviorSubject<ALU_Alunno[]>([]);

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

    loadAlunni(filter: string, sortOrder: string, pageNumber: number, pageSize: number) {
        this.loadingSubject.next(true);
        this.svcALU_Alunni.findAlunni(filter, sortOrder, pageNumber, pageSize)
        .pipe(
            //delayWhen(() => timer(2000)),
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(res => this.AlunniSubject.next(res));
        
    }    
}

function tap(arg0: (val: any) => void): import("rxjs").OperatorFunction<ALU_Alunno[], unknown> {
    throw new Error("Function not implemented.");
}





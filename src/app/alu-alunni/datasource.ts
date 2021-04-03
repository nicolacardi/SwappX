import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable } from "rxjs";
import { ALU_Alunno } from "src/models/ALU_Alunno";
import { ALU_AlunniService } from "../services/alu-alunni.service";

export class AlunniDataSource implements DataSource<ALU_Alunno> {

    private ALU_Alunno = new BehaviorSubject<ALU_Alunno[]>([]);

    constructor(private svcALU_Alunni: ALU_AlunniService) {}

    connect(collectionViewer: CollectionViewer): Observable<ALU_Alunno[]> {
        return this.ALU_Alunno.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.ALU_Alunno.complete();
    }

    loadAlunni() {
        this.svcALU_Alunni.loadAlunni()
        .subscribe(res => this.ALU_Alunno.next(res));
    }    
}

function tap(arg0: (val: any) => void): import("rxjs").OperatorFunction<ALU_Alunno[], unknown> {
    throw new Error("Function not implemented.");
}

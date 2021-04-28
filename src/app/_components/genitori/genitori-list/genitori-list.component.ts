import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable } from 'rxjs';
import { delayWhen, finalize, map } from 'rxjs/operators';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { GenitoriService } from '../../../_services/genitori.service';
import {MatTableDataSource} from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: ['./genitori-list.component.css']
})

export class GenitoriListComponent implements OnInit {
  
  //dsAlunni!: AlunniDataSource;***Questa si usava per passargli un custom datasource
  obs_ALU_Genitori$! : Observable<ALU_Genitore[]>;
  matDataSource = new MatTableDataSource<ALU_Genitore>();
  public searchAlu!: number;

  @Input()
  idAlunno!: number;

  displayedColumns = ["nome", "cognome", "tipo", "indirizzo", "telefono", "email", "dtNascita" ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;



  constructor(private svcALU_Genitori: GenitoriService, private router : Router) {}

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  ngOnInit () {
    //idAlunno = undefined      se sono nella lista Genitori da menu
    //idAlunno = id dell'alunno se sono nel form dopo aver cliccato su un alunno
    //idAlunno = 0              se sono nel form su nuovo alunno -> in questo caso non va caricata la lista di tutti.

    console.log ("idAlunno:", this.idAlunno);
    if (this.idAlunno) {
      this.displayedColumns = ["tipo", "nome", "cognome", "telefono", "email"];
    }

    this.loadingSubject.next(true);
    //this.dsAlunni = new AlunniDataSource(this.svcALU_Alunni);***Questa si usava per passargli un custom datasource
    
    if (this.idAlunno == 0) {
      this.searchAlu = -1;   
     } else {
      this.searchAlu = this.idAlunno;
     }

      this.obs_ALU_Genitori$ = this.svcALU_Genitori.loadGenitori(this.searchAlu)
        .pipe (
          //delayWhen(() => timer(200)),
          finalize(() => this.loadingSubject.next(false)
        )
        );
    

      this.obs_ALU_Genitori$.subscribe(val => 
        {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort;
        }
      );
    
    
  }

  onRowClicked(id: any) {
    this.router.navigate(["genitori", id]);
  }

  applyFilter(event: Event) {
    console.log (event);
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }



}


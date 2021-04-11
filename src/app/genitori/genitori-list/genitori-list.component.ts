import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable } from 'rxjs';
import { delayWhen, finalize, map } from 'rxjs/operators';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { GenitoriService } from '../../_services/genitori.service';
import {MatTableDataSource} from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: ['./genitori-list.component.css']
})

export class GenitoriListComponent implements OnInit {
  //dsAlunni!: AlunniDataSource;***Questa si usava per passargli un custom datasource
  obs_ALU_Genitori$! : Observable<ALU_Genitore[]>;
  matDataSource = new MatTableDataSource<ALU_Genitore>();
  displayedColumns = ["nome", "cognome", "indirizzo", "dtNascita", "ckAttivo" ];
  expandedElement!: ALU_Genitore | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private svcALU_Genitori: GenitoriService) {}

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  ngOnInit () {

    this.loadingSubject.next(true);
    //this.dsAlunni = new AlunniDataSource(this.svcALU_Alunni);***Questa si usava per passargli un custom datasource
    this.obs_ALU_Genitori$ = this.svcALU_Genitori.loadGenitori()
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

  onRowClicked(row: any) {
    console.log('Row clicked: ', row);
  }

  ngAfterViewInit() {
 
  }

  applyFilter(event: Event) {
    console.log (event);
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }



}


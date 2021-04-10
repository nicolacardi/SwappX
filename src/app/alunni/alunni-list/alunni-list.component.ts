import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { delayWhen, finalize, map, tap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../../_services/alunni.service';
import { AlunniDataSource } from './ds-alunni';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-alunni-list',
  templateUrl: './alunni-list.component.html',
  styleUrls: ['./alunni-list.component.css']
})
export class AlunniListComponent implements OnInit {

  //dsAlunni!: AlunniDataSource;***Questa si usava per passargli un custom datasource
  obs_ALU_Alunni$! : Observable<ALU_Alunno[]>;
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  displayedColumns = ["nome", "cognome", "dtNascita"];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private svcALU_Alunni: AlunniService) {}

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  ngOnInit () {
    this.loadingSubject.next(true);
    //this.dsAlunni = new AlunniDataSource(this.svcALU_Alunni);***Questa si usava per passargli un custom datasource
    this.obs_ALU_Alunni$ = this.svcALU_Alunni.loadAlunni()
      .pipe (
        //delayWhen(() => timer(200)),
        finalize(() => this.loadingSubject.next(false)
      )
      );
  

    this.obs_ALU_Alunni$.subscribe(val => 
      {
      
      this.matDataSource.data = val;
      this.matDataSource.paginator = this.paginator;
      this.matDataSource.sort = this.sort;
      }
    );
    
    
    

    //NON USO IL FILE DATASOURCE MA PASSO DIRETTAMENTE L'OBSERVABLE DEL SERVICE COME DATASOURCE DELLA MATTABLE
    
    //this.dsAlunni.findAlunni('', 'asc', 0, 3); //filtro e pagination server side
    //this.loadAlunniPage(3, 0);***Questa si usava per passargli un custom datasource
    //this.loading$ = this.dsAlunni.loading$;***Questa si usava per passargli un custom datasource
    //this.dsAlunni.paginator = this.paginator;
    

  }

  onRowClicked(row: any) {
    console.log('Row clicked: ', row);
  }

  ngAfterViewInit() {
    //this.paginator.pageIndex = 3;

    //this.paginator.pageIndex = 3;
    //console.log(this.paginator.getNumberOfPages());
  }

  //per paginazione client side ma con datasource custom
  // ngAfterViewInit() {
  //   this.paginator.page
  //   //     .pipe(
  //   //         tap(() => this.loadAlunniPage())
  //   //     )
  //        .subscribe(
  //          () => this.loadAlunniPage(this.paginator.pageSize, this.paginator.pageIndex)
  //          //() => console.log (this.paginator.pageSize, this.paginator.pageIndex)
  //          );
  //          this.paginator.pageIndex = 1;
  // }



  //per paginazione client side ma con custom datasource
  // loadAlunniPage(pageSize: number, pageIndex: number) {
  //   console.log (pageSize, pageIndex);
  //   this.dsAlunni.loadAlunniPage(pageSize, pageIndex);
  // }


  //per filtro e paginazione server side
  // findAlunniPage() {
  //     //console.log (this.paginator.pageSize);
  //     this.dsAlunni.findAlunni(
  //         '',
  //         'asc',
  //         this.paginator.pageIndex,
  //         this.paginator.pageSize);
  // }

}



// PER PRENDERE ALCUNI ELEMENTI DELL'OBSERVABLE (tipo dal quinto al settimo)
      // .pipe (
      //   map(val => val.slice(this.startItem, this.endItem)),
      // )

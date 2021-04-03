import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../../_services/alunni.service';
import { AlunniDataSource } from './ds-alunni';

@Component({
  selector: 'app-alunni-list',
  templateUrl: './alunni-list.component.html',
  styleUrls: ['./alunni-list.component.css']
})
export class AlunniListComponent implements OnInit {

  dsAlunni!: AlunniDataSource;
  //obs_ALU_Alunni$! : Observable<ALU_Alunno[]>;
  displayedColumns = ["nome", "cognome", "dtNascita"];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  
  constructor(private svcALU_Alunni: AlunniService) {}

  loading$!: Observable<boolean>;

  ngOnInit () {
    //this.obs_ALU_Alunni$ = this.svcALU_Alunni.loadAlunni();
    this.dsAlunni = new AlunniDataSource(this.svcALU_Alunni);
    this.dsAlunni.loadAlunni('', 'asc', 0, 3);

    this.loading$ = this.dsAlunni.loading$;

  }

  onRowClicked(row: any) {
    console.log('Row clicked: ', row);
  }

  ngAfterViewInit() {
    this.paginator.page
        //.pipe(
            //tap(() => this.loadAlunniPage())
            //tap(val => console.log(val))
        //)
        .subscribe(() => this.loadAlunniPage());
  }

  loadAlunniPage() {
      //console.log (this.paginator.pageSize);
      this.dsAlunni.loadAlunni(
          '',
          'asc',
          this.paginator.pageIndex,
          this.paginator.pageSize);
  }


}

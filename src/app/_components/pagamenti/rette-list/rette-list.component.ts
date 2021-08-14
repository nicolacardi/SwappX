import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { from, Observable, of, zip } from 'rxjs';
import { flatMap, groupBy, map, mergeMap, toArray } from 'rxjs/operators';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-rette-list',
  templateUrl: './rette-list.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RetteListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<PAG_Retta>();
  displayedColumns: string[] =  [];
  displayedColumnsList: string[] = [
                                  "actionsColumn", 
                                  "quotaConcordata",
                                  "mese",
                                  "anno",
                                  "alunno.cognome",
                                  "alunno.nome",
                                  //"note"
                                  ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  
  constructor(private svcRette:         RetteService,
              private _loadingService:  LoadingService,) { }

  ngOnInit(): void {
    this.displayedColumns =  this.displayedColumnsList;
    this.refresh();

  }

  refresh () {
    let obsRette$: Observable<PAG_Retta[]>;
      
    obsRette$= this.svcRette.load();

    //const loadRette$ =this._loadingService.showLoaderUntilCompleted(obsRette$);

    // of ({id: 1, name: 'aze1'},
    // {id: 2, name: 'sf2'},
    // {id: 2, name: 'dg2'},
    // {id: 1, name: 'erg1'},
    // {id: 1, name: 'df1'},
    // {id: 2, name: 'sfqfb2'},
    // {id: 3, name: 'qfs1'},
    // {id: 2, name: 'qsgqsfg2'})
    // .pipe(

    //   groupBy(p => p.id, p=>p.name),
    //   mergeMap( (group$) => group$.reduce((x:any, y:any) => [...x, y], [group$.key])),  //ma sarebbe flatMap che è deprecated
    //   //map(arr => ({'mese': (arr[0], 'values': arr.slice(1)}))
    // ).subscribe(p=> console.log(p))


    // const people = [
    //   { name: 'Sue', age: 25 },
    //   { name: 'Joe', age: 30 },
    //   { name: 'Frank', age: 25 },
    //   { name: 'Sarah', age: 35 }
    // ];
    // //emit each person
    // const source = from(people);
    // //group by age
    // const example = source.pipe(
    //   groupBy(person => person.age),
    //   // return each item in group as array
    //   mergeMap(group => group.pipe(toArray()))
    // );

    // const subscribe = example.subscribe(val => console.log("cicciopasticcio", val));

    

    obsRette$
    .pipe(
      mergeMap(res=>res),
      groupBy(o => o.mese, q=>q.quotaConcordata),
      // return each item in group as array
      //mergeMap(group => group.pipe(toArray())),
      mergeMap(group => zip(["" + group.key], group.pipe(toArray()))),
      //mergeMap( (group$) => group$.reduce((x:any, y:any) => [...x, y], ["" + group$.key]))
      map(arr => ({'mese': parseInt(arr[0]), 'quote': arr.slice(1)}))
    )
      .subscribe(val => 
      {
        console.log(val);
        //this.matDataSource.data = val;
        //this.matDataSource.paginator = this.paginator;
        //this.matDataSource.sort = this.sort;
      }
    );



  }


  



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
  
  onRightClick(event: MouseEvent, element: PAG_Retta) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  addRecord(){
    //TODO
  }

  editRecord(idPagamento: number){
    //TODO
  }

}

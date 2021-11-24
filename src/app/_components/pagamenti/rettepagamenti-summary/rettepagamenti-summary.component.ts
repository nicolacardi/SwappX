import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

//models
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_RettePagamenti_Sum } from 'src/app/_models/PAG_Retta';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';


@Component({
  selector: 'app-rettepagamenti-summary',
  templateUrl: './rettepagamenti-summary.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettepagamentiSummaryComponent implements OnInit {


//#region ----- Variabili -------

matDataSource = new MatTableDataSource<PAG_RettePagamenti_Sum>();

public idAnnoScolastico!:           number;
obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

form! :                             FormGroup;
menuTopLeftPosition =  {x: '0', y: '0'} 
displayedColumns: string[] =  [];
displayedColumnsRettePagamentiSummary: string[] = [
    "annoRetta",
    "meseRetta",
    "quotaDefault",
    "quotaConcordata",
    "importo",
];
//#endregion

//#region ----- ViewChild Input Output -------
@ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
//#endregion

  constructor(private svcRette:         RetteService,
              private svcAnni:          AnniScolasticiService,
              private fb:               FormBuilder,
              private _loadingService:  LoadingService) { 
  
  let obj = localStorage.getItem('AnnoCorrente');
  this.form = this.fb.group({
    selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
  })

  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.load();
    this.loadData();

    this.form.controls['selectAnnoScolastico'].valueChanges
    .subscribe(val => {
      this.loadData();
      //this.annoIdEmitter.emit(val);
    })
  }

  loadData() {

    this.displayedColumns = this.displayedColumnsRettePagamentiSummary;
    
    let obsSummary$: Observable<PAG_RettePagamenti_Sum[]>;
    obsSummary$= this.svcRette.loadSummary(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => {
        this.matDataSource.data = val;
      }
    );
    
  }
//#endregion

//#region ----- LifeCycle Hooks e simili-------
  onRightClick(event: MouseEvent, element: PAG_RettePagamenti_Sum) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion

//#region ----- Altri Metodi            -------
getTotalPagate() {
  return this.matDataSource.data.map(t => t.importo).reduce((acc, value) => acc + value, 0)
}
getTotalConcordate() {
  return this.matDataSource.data.map(t => t.quotaConcordata).reduce((acc, value) => acc + value, 0)
}
getTotalDefault() {
  return this.matDataSource.data.map(t => t.quotaDefault).reduce((acc, value) => acc + value, 0)
}
//#endregion

}

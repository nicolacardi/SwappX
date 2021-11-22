import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormBuilder, FormGroup } from '@angular/forms';


//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';

//classes
import { CLS_ClasseSezioneAnno_Sum } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';


@Component({
  selector: 'app-classi-sezioni-anni-summary',
  templateUrl: './classi-sezioni-anni-summary.component.html',
  styleUrls: ['../classi.css']
})
export class ClassiSezioniAnniSummaryComponent implements OnInit {

//#region ----- Variabili -------

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno_Sum>();

  public idAnnoScolastico!:           number;
  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  form! :                             FormGroup;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  displayedColumns: string[] =  [];
  displayedColumnsClassiSezioniAnniSummary: string[] = [
      "actionsColumn",
      "classe",
      "sezione",
      "anno",
      "numAlunni",
      "numMaschi",
      "numFemmine"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
//#endregion

  constructor(private svcClassi:        ClassiSezioniAnniService,
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

    this.displayedColumns = this.displayedColumnsClassiSezioniAnniSummary;
    
    let obsSummary$: Observable<CLS_ClasseSezioneAnno_Sum[]>;
    obsSummary$= this.svcClassi.loadSummary(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => {
        this.matDataSource.data = val;
      }
    );
    
  }
//#endregion


//#region ----- LifeCycle Hooks e simili-------
  onRightClick(event: MouseEvent, element: CLS_ClasseSezioneAnno_Sum) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormBuilder, FormGroup } from '@angular/forms';


//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';

//classes
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnno_Query } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { Router } from '@angular/router';


@Component({
  selector: 'app-classi-sezioni-anni-summary',
  templateUrl: './classi-sezioni-anni-summary.component.html',
  styleUrls: ['../classi.css']
})
export class ClassiSezioniAnniSummaryComponent implements OnInit {

//#region ----- Variabili -------

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno_Query>();

  //public idAnnoScolastico!:           number;
  obsAnni$!:                            Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  form! :                             FormGroup;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  displayedColumns: string[] =  [];
  displayedColumnsClassiSezioniAnniSummary: string[] = [
      "descrizioneBreve",
      "sezione",
      "numAlunni",
      "numMaschi",
      "numFemmine"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
//#endregion

  constructor(private svcClassiSezioniAnni:          ClassiSezioniAnniService,
              private svcAnni:            AnniScolasticiService,
              private fb:                 FormBuilder, 
              private _loadingService:    LoadingService,
              private router:             Router) { 

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
    
    let obsSummary$: Observable<CLS_ClasseSezioneAnno_Query[]>;
    obsSummary$= this.svcClassiSezioniAnni.loadSummary(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => {
        this.matDataSource.data = val;
      }
    ); 
  }
  
//#endregion


//#region ----- LifeCycle Hooks e simili-------
  onRightClick(event: MouseEvent, element: CLS_ClasseSezioneAnno_Query) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion

//#region ----- Altri Metodi            -------
  getTotal() {
    return this.matDataSource.data.map(t => t.numAlunni).reduce((acc, value) => acc + value, 0)
  }
  getTotalM() {
    return this.matDataSource.data.map(t => t.numMaschi).reduce((acc, value) => acc + value, 0)
  }
  getTotalF() {
    return this.matDataSource.data.map(t => t.numFemmine).reduce((acc, value) => acc + value, 0)
  }

  openGestioneClasse(item: CLS_ClasseSezioneAnno) {
    //console.log("classisezioniannisummary - openGestioneClasse - item di cui id passata a classisezioniannilist", item);
    //((console.log("classisezioniannisummary - openGestioneClasse - anno passato a classisezioniannilist", this.form.controls['selectAnnoScolastico'].value);
    this.router.navigate(['/classi-dashboard'], { queryParams: { idAnno: this.form.controls['selectAnnoScolastico'].value, idClasseSezioneAnno: item.id } });
  }
//#endregion
}

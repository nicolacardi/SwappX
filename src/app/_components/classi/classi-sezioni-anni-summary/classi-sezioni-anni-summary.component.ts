import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//services
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { CLS_ClasseSezioneAnno_Sum } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

@Component({
  selector: 'app-classi-sezioni-anni-summary',
  templateUrl: './classi-sezioni-anni-summary.component.html',
  styleUrls: ['../classi.css']
})
export class ClassiSezioniAnniSummaryComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno_Sum>();
  displayedColumns: string[] =  [];
  displayedColumnsClassiSezioniAnniSummary: string[] = [
      "classe",
      "sezione",
      "anno",
      "numAlunni",
      "numMaschi",
      "numFemmine"
  ];
//#endregion
  constructor(private svcClassi:        ClassiSezioniAnniService,
              private _loadingService:  LoadingService) { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.displayedColumns = this.displayedColumnsClassiSezioniAnniSummary;


    let obsSummary$: Observable<CLS_ClasseSezioneAnno_Sum[]>;

    
    obsSummary$= this.svcClassi.loadSummary();
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => 
      {
        this.matDataSource.data = val;
      }
    );
    
  }
//#endregion

}

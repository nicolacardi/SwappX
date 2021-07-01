import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { AlunnoDashboardNewService } from '../../alunni/alunno-dashboard-new/alunno-dashboard-new.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniAlunniService } from '../classi-sezioni-anni-alunni.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

@Component({
  selector: 'app-classi-sezioni-anni-alunno',
  templateUrl: './classi-sezioni-anni-alunno.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiSezioniAnniAlunnoComponent implements OnInit {

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno>();
  selectedRowIndex = -1;
  displayedColumns: string[] =  [
    "descrizione",
    "sezione",
    "annoscolastico"
    ];
    public idAlunno!:   number;

  constructor(private svcClassiSezioniAnniAlunno:   ClassiSezioniAnniService,
              private _alunnoDashBoardNewService:               AlunnoDashboardNewService,
              private _loadingService:              LoadingService
  ) { }

  ngOnInit(): void {
    //bisogna scatenare il refresh su change del form field che sta nella pagina principale...

      this._alunnoDashBoardNewService.getAlunno()
        .subscribe(
          val=>{
          this.idAlunno = val;
          //uno dei tre refresh parte qui: serve quando cambia il filtro idGenitore
          console.log("classi-sezioni-anni-alunno.component.ts - ngOnInit chiamata a this.refresh da getAlunno");
          if (val != 0) {this.refresh(this.idAlunno)}; 
      });

  }

  ngOnChanges() {
    //serve perchè quando classi-sezioni-anni-alunno è child di alunno-dashboard-new gli viene passato il valore di idAlunno
    // e devo "sentire" in questo modo che deve refreshare
    console.log("classi-sezioni-anni-alunno.component.ts - ngOnChanges chiamata a this.refresh ");
    this.refresh(this.idAlunno); 
  }





  refresh (val :number) {
    let obsClassi$: Observable<CLS_ClasseSezioneAnno[]>;
    obsClassi$= this.svcClassiSezioniAnniAlunno.loadClassiByAlunno(val);
    const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);
    loadClassi$.subscribe(val => 
      {
        this.matDataSource.data = val;
        //this.rowclicked(this.matDataSource.data[0]); //seleziona per default la prima riga NON FUNZIONA SEMPRE
      }
    );
  }

  rowclicked(val: CLS_ClasseSezioneAnno ) {
    this.selectedRowIndex = val.id;
  }



  
}

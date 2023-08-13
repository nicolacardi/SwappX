//#region ----- IMPORTS ------------------------
import { Component, Input, OnInit }             from '@angular/core';
import { ConsensiService }                      from '../../impostazioni/consensi/consensi.service';
import { MatDialog }          from '@angular/material/dialog';
import { LoadingService } from '../../utilities/loading/loading.service';
import { Observable } from 'rxjs';

//models
import { _UT_Consenso } from 'src/app/_models/_UT_Consenso';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//#endregion
@Component({
  selector: 'app-consensi-iscrizione',
  templateUrl: './consensi-iscrizione.component.html',
  styleUrls: ['../procedura-iscrizione.css']
})
export class ConsensiIscrizioneComponent implements OnInit  {

//#region ----- Variabili ----------------------
  obsConsensi$!:                                Observable<_UT_Consenso[]>;
  formConsensi! :                               UntypedFormGroup;

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() iscrizioneID!:                       number;
//#endregion

//#region ----- Constructor --------------------
  
constructor(private svcConsensi:                ConsensiService,
            private fb:                         UntypedFormBuilder, 

            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog
            ) {

                  
    this.formConsensi = this.fb.group({})
            }
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.obsConsensi$ = this.svcConsensi.list();  
  }
//#endregion


}

import { Component, Inject, OnInit,  }          from '@angular/core';
import { UntypedFormGroup }                            from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA }        from '@angular/material/legacy-dialog';
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//components

//services
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';

//models
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';


@Component({
  selector: 'app-voti-compito-page',
  templateUrl: './voti-compito-page.component.html',
  styleUrls: ['../lezioni.css']
})
export class VotiCompitoPageComponent implements OnInit {

  form! :                                       UntypedFormGroup;
  strClasseSezioneAnno!:                        string;
  dtStart!:                                     Date;
  strDtStart!:                                  string;
  strArgomento!:                                string;
//#region ----- ViewChild Input Output -------
  


//#endregion

constructor(
  public _dialogRef:                            MatDialogRef<VotiCompitoPageComponent>,
  @Inject(MAT_DIALOG_DATA) public data:         CAL_Lezione,

  private svcClasseSezioneAnno:                 ClassiSezioniAnniService,

) { }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {

    if (this.data.classeSezioneAnnoID != null && this.data.classeSezioneAnnoID != undefined) {
      this.svcClasseSezioneAnno.get(this.data.classeSezioneAnnoID).subscribe(
        val => this.strClasseSezioneAnno = val.classeSezione.classe.descrizione2 + " " + val.classeSezione.sezione
      );
    }
    this.dtStart = new Date (this.data.start);
    this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);

  }
//#endregion

//#region ----- Add Edit Drop -------

//#endregion


}

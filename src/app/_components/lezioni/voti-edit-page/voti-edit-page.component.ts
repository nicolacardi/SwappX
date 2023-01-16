import { Component, Inject, OnInit,  }          from '@angular/core';
import { FormGroup }                            from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//components

//services
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';

//models
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';


@Component({
  selector: 'app-voti-edit-page',
  templateUrl: './voti-edit-page.component.html',
  styleUrls: ['../lezioni.css']
})
export class VotiEditPageComponent implements OnInit {

  form! :                                       FormGroup;
  strClasseSezioneAnno!:                        string;
  dtStart!:                                     Date;
  strDtStart!:                                  string;
  strArgomento!:                                string;
//#region ----- ViewChild Input Output -------
  


//#endregion

constructor(
  public _dialogRef:                            MatDialogRef<VotiEditPageComponent>,
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
    console.log ("this.data", this.data);



  }
//#endregion

//#region ----- Add Edit Drop -------

//#endregion


}

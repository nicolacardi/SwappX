//#region ----- IMPORTS ------------------------
import { Component, ViewChild }                 from '@angular/core';

//components
import { FileuploadsListComponent }             from '../fileuploads-list/fileuploads-list.component';
//#endregion
@Component({
  selector: 'app-fileuploads-page',
  templateUrl: './fileuploads-page.component.html',
  styleUrls: ['../fileuploads.css']
})
export class FileuploadsPageComponent {

  //#region ----- ViewChild Input Output ---------

  @ViewChild(FileuploadsListComponent) fileuploadsList!: FileuploadsListComponent; 

  //#endregion

  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.fileuploadsList.addRecord()
  }

}

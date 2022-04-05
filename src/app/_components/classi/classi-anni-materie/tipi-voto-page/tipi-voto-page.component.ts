import { Component, OnInit, ViewChild } from '@angular/core';
import { ClassiAnniMaterieListComponent } from '../classi-anni-materie-list/classi-anni-materie-list.component';

@Component({
  selector: 'app-tipi-voto-page',
  templateUrl: './tipi-voto-page.component.html',
  styleUrls: ['../../classi.css']
})
export class TipiVotoPageComponent implements OnInit {

  @ViewChild(ClassiAnniMaterieListComponent) classiAnniMaterieList!: ClassiAnniMaterieListComponent; 

  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.classiAnniMaterieList.addRecord()
  }
}

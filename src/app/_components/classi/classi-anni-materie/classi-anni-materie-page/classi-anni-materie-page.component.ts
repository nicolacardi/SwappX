import { Component, OnInit, ViewChild } from '@angular/core';
import { ClassiAnniMaterieListComponent } from '../classi-anni-materie-list/classi-anni-materie-list.component';

@Component({
  selector: 'app-classi-anni-materie-page',
  templateUrl: './classi-anni-materie-page.component.html',
  styleUrls: ['../../classi.css']
})
export class ClassiAnniMateriePageComponent implements OnInit {

  @ViewChild(ClassiAnniMaterieListComponent) classiAnniMaterieList!: ClassiAnniMaterieListComponent; 

  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.classiAnniMaterieList.addRecord()
  }
}

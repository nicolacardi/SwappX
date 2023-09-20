import { Component, OnInit, ViewChild } from '@angular/core';

import { ClassiSezioniAnniListComponent } from '../classi-sezioni-anni-list/classi-sezioni-anni-list.component';

@Component({
  selector: 'app-classi-sezioni-anni-page',
  templateUrl: './classi-sezioni-anni-page.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiPageComponent {

  @ViewChild(ClassiSezioniAnniListComponent) ClassiSezioniAnniListComponent!: ClassiSezioniAnniListComponent; 

  constructor() { }

  ngOnInit() { }

  resetFiltri() { }

  addRecord() {
      this.ClassiSezioniAnniListComponent.addRecord()
  }
  
}

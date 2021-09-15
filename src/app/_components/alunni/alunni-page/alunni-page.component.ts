import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FiltriService } from '../../utilities/filtri/filtri.service';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';

@Component({
  selector: 'app-alunni-page',
  templateUrl: './alunni-page.component.html',
  styleUrls: ['./../alunni.css']
})
export class AlunniPageComponent implements OnInit {

  @ViewChild(AlunniListComponent) alunniList!: AlunniListComponent; 



  

  constructor(private _filtriService:   FiltriService) { }

  ngOnInit(): void {
    this._filtriService.passPage("alunniList");

   
  }

  addRecord() {
    this.alunniList.addRecord()
  }


}

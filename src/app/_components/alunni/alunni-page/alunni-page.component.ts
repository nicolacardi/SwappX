import { Component, OnInit } from '@angular/core';
import { FiltriService } from '../../utilities/filtri/filtri.service';

@Component({
  selector: 'app-alunni-page',
  templateUrl: './alunni-page.component.html',
  styleUrls: ['./alunni-page.component.css']
})
export class AlunniPageComponent implements OnInit {

  constructor(private _filtriService:   FiltriService) { }

  ngOnInit(): void {
    this._filtriService.passPage("alunniList");
  }

}

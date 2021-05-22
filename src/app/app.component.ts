import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { FiltriService } from './_components/utilities/filtri/filtri.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public mode = new FormControl('over');
  title = 'SwappX';



  @ViewChild('end') public rightSidenav!: MatSidenav;
  
  constructor( private _filtriService: FiltriService) {}

  ngOnInit () {
    this._filtriService.getData()
    .subscribe(
      val=>{
      if (val!=0 && val!= null && val!= undefined){
        console.log("ora voglio aprire");
        this.rightSidenav.open();
        
      }
    });
  }

  savePDF() {
    
  }


}

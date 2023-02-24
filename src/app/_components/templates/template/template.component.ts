import { Component, OnInit }                    from '@angular/core';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { PagineService } from '../pagine.service';
import { TemplatesService } from '../templates.service';

//models
import { TEM_Pagina } from 'src/app/_models/TEM_Pagina';
import { TEM_Template } from 'src/app/_models/TEM_Template';


@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['../templates.css']
})
export class TemplateComponent implements OnInit {

//#region ----- Variabili -------
  public zoom:                                  number = 1;
  public templateID:                            number = 1;
  public numPagine:                             number = 1;
  public obsTemplate$!:                         Observable<TEM_Template>;
  public obsPagine$!:                           Observable<TEM_Pagina[]>;

//#endregion

  constructor(
    private svcTemplates:                       TemplatesService,
    private svcPagine:                          PagineService,
    private _loadingService :                   LoadingService 
  ) 
  { }

  ngOnInit(): void {
    this.loadData();

  }

  loadData() {
    const obsPagineTMP$ = this.svcPagine.listByTemplate(this.templateID)
    .pipe(
      tap(val=> this.numPagine = val.length)
    );
    this.obsPagine$ = this._loadingService.showLoaderUntilCompleted( obsPagineTMP$);
  }

  addPage() {
    let objPagina = {
      templateID: this.templateID,
      pagina: this.numPagine + 1
    };
    this.svcPagine.post(objPagina).subscribe(res=> this.loadData());
  }

  deletedPage(pageNum: number) {
    this.loadData();
  }

  incZoom(){
    if (this.zoom < 4) this.zoom++;
  }

  decZoom(){
    if (this.zoom > 1) this.zoom--;
  }

  toggleMagnete() {
    
  }
}

import { ThisReceiver } from '@angular/compiler';
import { Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { CausaliPagamentoService } from '../causaliPagamento.service';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';
import { TipiPagamentoService } from '../tipiPagamento.service';

@Component({
  selector: 'app-pagamenti-filter',
  templateUrl: './pagamenti-filter.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiFilterComponent implements OnInit {

  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;
  
  @Input() pagamentiListComponent!: PagamentiListComponent;
  
  tipoPagamentoFilter = new FormControl('');
  causaleFilter = new FormControl('');
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  importoPiuDiFilter = new FormControl('');
  importoFilter = new FormControl('');
  importoMenoDiFilter = new FormControl('');
  dataDal = new FormControl('');
  dataAl = new FormControl('');

  constructor(               
    private tipiPagamentoSvc:             TipiPagamentoService,
    private causaliPagamentoSvc:          CausaliPagamentoService,) {}

  ngOnInit() {

    this.causaliPagamento$ = this.causaliPagamentoSvc.load();
    this.tipiPagamento$ = this.tipiPagamentoSvc.load();

    this.tipoPagamentoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.tipoPagamento = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.causaleFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.causale = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.nome = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.cognome = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )


    this.importoPiuDiFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.importoPiuDi = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.importoMenoDiFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.importoMenoDi = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.importoFilter.valueChanges
    .subscribe(
      val => {
        if (this.importoFilter.value != '') {this.importoMenoDiFilter.disable();this.importoPiuDiFilter.disable()} 
        else {this.importoMenoDiFilter.enable(); this.importoPiuDiFilter.enable()}
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.importo = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.dataDal.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.dataDal = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.dataAl.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.dataAl = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

  }

  resetMainFilter() {
    if (this.pagamentiListComponent.matDataSource.filterPredicate == this.pagamentiListComponent.storedFilterPredicate){
      this.pagamentiListComponent.matDataSource.filter = ''; 
      this.pagamentiListComponent.filterInput.nativeElement.value = '';
      this.pagamentiListComponent.matDataSource.filterPredicate = this.pagamentiListComponent.createFilter()
    };  
  }

  resetAllInputs() {
    this.tipoPagamentoFilter.setValue('', {emitEvent:false});
    this.causaleFilter.setValue('', {emitEvent:false});
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.dataDal.setValue('', {emitEvent:false});
    this.dataAl.setValue('', {emitEvent:false});
    this.importoFilter.setValue('', {emitEvent:false});
    this.importoMenoDiFilter.setValue('', {emitEvent:false});
    this.importoPiuDiFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.tipoPagamentoFilter.setValue('');
    this.causaleFilter.setValue('');
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.dataDal.setValue('');
    this.dataAl.setValue('');
    this.importoFilter.setValue('');
    this.importoMenoDiFilter.setValue('');
    this.importoPiuDiFilter.setValue('');
  }
}

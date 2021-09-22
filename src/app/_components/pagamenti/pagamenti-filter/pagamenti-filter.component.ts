import { Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';

@Component({
  selector: 'app-pagamenti-filter',
  templateUrl: './pagamenti-filter.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiFilterComponent implements OnInit {


  @Input() pagamentiListComponent!: PagamentiListComponent;
  
  tipoPagamentoFilter = new FormControl('');
  causaleFilter = new FormControl('');
  //nomeCognomeGenitoreFilter = new FormControl('');

  constructor() {}

  ngOnInit() {

    this.tipoPagamentoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.tipoPagamento = val.toLowerCase();
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )

    this.causaleFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.pagamentiListComponent.filterValues.causale = val.toLowerCase();
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
    //this.nomeCognomeGenitoreFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.tipoPagamentoFilter.setValue('');
    this.causaleFilter.setValue('')
    //this.nomeCognomeGenitoreFilter.setValue('');
  }
}

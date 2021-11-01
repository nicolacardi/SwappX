import { Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

//components
import { UsersListComponent } from '../users-list/users-list.component';

@Component({
  selector: 'app-users-filter',
  templateUrl: './users-filter.component.html',
  styleUrls: ['../users.css']
})
export class UsersFilterComponent implements OnInit {


//#region ----- Variabili -------
  fullnameFilter = new FormControl('');
//#endregion
  
//#region ----- ViewChild Input Output -------  
  @Input() usersListComponent!: UsersListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit() {

    this.fullnameFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.usersListComponent.filterValues.fullname = val.toLowerCase();
        this.usersListComponent.matDataSource.filter = JSON.stringify(this.usersListComponent.filterValues);
      }
    )

  }
//#endregion

//#region ----- Reset vari -------
  resetMainFilter() {
    if (this.usersListComponent.matDataSource.filterPredicate == this.usersListComponent.storedFilterPredicate){
      this.usersListComponent.matDataSource.filter = ''; 
      this.usersListComponent.filterInput.nativeElement.value = '';
      this.usersListComponent.matDataSource.filterPredicate = this.usersListComponent.filterRightPanel()
    };  
  }

  resetAllInputs() {
    this.fullnameFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.fullnameFilter.setValue('');
  }
//#endregion
}

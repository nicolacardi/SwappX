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
  fullnameFilter =  new FormControl('');
  emailFilter =     new FormControl('');
  badgeFilter =     new FormControl('');
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
        //this.resetFilterSx();
        this.usersListComponent.filterValues.fullname = val.toLowerCase();
        this.usersListComponent.matDataSource.filter = JSON.stringify(this.usersListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.usersListComponent.filterValues.email = val.toLowerCase();
        this.usersListComponent.matDataSource.filter = JSON.stringify(this.usersListComponent.filterValues);
      }
    )

    this.badgeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.usersListComponent.filterValues.badge = val.toLowerCase();
        this.usersListComponent.matDataSource.filter = JSON.stringify(this.usersListComponent.filterValues);
      }
    )

  }
//#endregion

//#region ----- Reset vari -------
  resetFilterSx() {
      // this.usersListComponent.matDataSource.filter = ''; 
      // this.usersListComponent.filterValue = '';
      // this.usersListComponent.filterValues.filtrosx = ''; 
      // this.usersListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.fullnameFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.badgeFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.fullnameFilter.setValue('');
    this.emailFilter.setValue('');
    this.badgeFilter.setValue('');
  }
//#endregion
}

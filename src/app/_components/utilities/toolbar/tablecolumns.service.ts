import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { map, Observable }                           from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';

//models
import { _UT_TableColVisible }                  from 'src/app/_models/_UT_TableColVisible';

@Injectable({
  providedIn: 'root'
})
export class TableColumnsService {

  constructor(private http: HttpClient) { }


  list(): Observable<_UT_TableColVisible[]>{
    return this.http.get<_UT_TableColVisible[]>(environment.apiBaseUrl+'_UT_TablesColsVisible');
    //http://213.215.231.4/swappX/api/_UT_TablesColsVisible
  }

  listByUserIDAndTable(UserID: string, TableName: string): Observable<_UT_TableColVisible[]>{
    return this.http.get<_UT_TableColVisible[]>(environment.apiBaseUrl+'_UT_TablesColsVisible/ListByUserIDAndTable/'+UserID+'/'+TableName);
    //http://213.215.231.4/swappX/api/_UT_TablesColsVisible/ListByUserIDAndTable/75b01815-1282-4459-bbf5-61bc877a9100/AlunniList
  }

  listVisibleByUserIDAndTable(UserID: string, TableName: string): Observable<_UT_TableColVisible[]>{
    return this.http.get<_UT_TableColVisible[]>(environment.apiBaseUrl+'_UT_TablesColsVisible/listVisibleByUserIDAndTable/'+UserID+'/'+TableName);
    //http://213.215.231.4/swappX/api/_UT_TablesColsVisible/listVisibleByUserIDAndTable/75b01815-1282-4459-bbf5-61bc877a9100/AlunniList
  }


  get(TableColVisibleID: any): Observable<_UT_TableColVisible>{
    return this.http.get<_UT_TableColVisible>(environment.apiBaseUrl+'_UT_TablesColsVisible/'+TableColVisibleID);
    //http://213.215.231.4/swappX/api/_UT_TablesColsVisible/25
  }

  put(formData: any): Observable <any>{
    console.log ("put", formData);
    return this.http.put( environment.apiBaseUrl  + '_UT_TablesColsVisible/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    console.log ("post", formData);

    return this.http.post( environment.apiBaseUrl  + '_UT_TablesColsVisible' , formData);  
  }

  delete(BloccoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_TablesColsVisible/' + BloccoID);    
  }
}

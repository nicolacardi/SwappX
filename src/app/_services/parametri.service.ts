import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError, take, tap } from 'rxjs/operators';
import { _UT_Parametro } from '../_models/_UT_Parametro';

@Injectable({
  providedIn: 'root'
})

export class ParametriService {

  constructor(private http: HttpClient) { }

  
  list(): Observable<_UT_Parametro[]>{
    return this.http.get<_UT_Parametro[]>(environment.apiBaseUrl+'_UT_Parametri');
    //http://213.215.231.4/swappX/api/_UT_Parametri
  }

  loadParametro(parName: string): Observable<_UT_Parametro>{
    return this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/GetByParName/'+parName);
    //http://213.215.231.4/swappX/api/_UT_Parametri/GetByParName/AnnoCorrente
  }
 
  put(par: _UT_Parametro): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_Parametri/' + par.id , par);    
  }

  /*
  export interface _UT_Parametro {
    id:                 number;
    parName:            string;
    parDescr:           string;
    parValue:           string;
  }
  */
  /*
              // PUT: api/_UT_Parametri/5
            // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
            [HttpPut("{id}")]
            public async Task<IActionResult> Put(int id, _UT_Parametro parametro)
            {
                if (id != parametro.ID)
                    return BadRequest();

                _context.Entry(parametro).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!Exists(id))
                        return NotFound();
                    else
                        throw;
                }

                return NoContent();
            }
  */
  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_Parametri' , formData);  
  }

}

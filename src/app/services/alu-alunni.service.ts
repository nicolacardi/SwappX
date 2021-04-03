import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ALU_Alunno } from 'src/models/ALU_Alunno';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ALU_AlunniService {

  constructor(private http: HttpClient) { }

  loadAlunni(): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni');
  }

}

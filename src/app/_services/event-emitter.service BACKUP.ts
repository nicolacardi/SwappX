import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
  invokeAppComponentRefreshFoto = new EventEmitter();    
  subsVar!: Subscription;    
    
  
  constructor() { }    
    
  onAccountSaveProfile() {
    this.invokeAppComponentRefreshFoto.emit();    
  }  
}

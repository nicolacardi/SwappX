import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../_user/Users';
import { PER_Persona } from '../_models/PER_Persone';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
  invokeAppComponentRefreshFoto = new EventEmitter();    
  subsVarForRefreshFoto!: Subscription;    
    
  invokeUserEmit = new EventEmitter();    
  subsVarForUserEmit!: Subscription;    

  constructor() { }    
    
  onAccountSaveProfile() {
    this.invokeAppComponentRefreshFoto.emit();    
  }  

  onLogin(user: PER_Persona) {
    this.invokeUserEmit.emit(user);
  }
}

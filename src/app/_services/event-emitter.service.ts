import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../_user/Users';
import { PER_Persona } from '../_models/PER_Persone';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
  invokeAppComponentRefreshFoto = new EventEmitter();    
  refreshFotoSubscribeAttiva!: Subscription;    
    
  invokeUserEmit = new EventEmitter();    
  userSubscribeAttiva!: Subscription;    

  constructor() { }    
    
  onAccountSaveProfile() {
    this.invokeAppComponentRefreshFoto.emit();    
  }  

  onLogin(user:any) {
    console.log("event-emitter - onLogin - passa di qua", user)
    this.invokeUserEmit.emit(user);
  }
}

import { AbstractControl, ValidationErrors } from "@angular/forms";
import { User } from "src/app/_user/Users";

export enum FormatoData {
  yyyy_mm_dd =  "yyyy-mm-dd",
  dd_mm_yyyy = "dd/mm/yyyy"
}

export abstract class Utility {
     

  //AS: verificare se esiste una funzione standard per formattare le chiamate a URL
  public static URL_FormatHour( ora: string ): string{
    
    return ora.replace(":", "%3A").replace(":", "%3A");

    //TODO: usare regex oppure encodeURIComponent
    //var p1 = encodeURIComponent("http://example.org/?a=12&b=55")
  }


  ///Formatta una data dal formato [2022-03-17T11:30:00.000Z] al formato ORA [HH:MM:SS]
  public static formatHour( fullDataWithHour: any ): string {
    let dtISOLocaleStart = fullDataWithHour.toLocaleString('sv').replace(' ', 'T');
    return dtISOLocaleStart.substring(11,19);
  }

  ///Formatta una data dal formato [2022-03-17T11:30:00.000Z] al formato [dd/mm/yyyy] o [yyyy-mm-dd]
  public static formatDate ( data: any, formato: FormatoData): string {
    let retDate= data;
    switch (formato) {
      case "yyyy-mm-dd":
        let dtISOLocaleStart = data.toLocaleString('sv').replace(' ', 'T');
        retDate = dtISOLocaleStart.substring(0,10);
        break;
      case "dd/mm/yyyy":
        var year = data.substring(0,4);
        var month = data.substring(5,7);
        let day = data.substring(8,10);
        retDate = day + '/' + month + '/' + year;
        break;
    }
    return retDate;
  }
  
  //Utility per comprimere le dimensioni dell'immagine del profilo (o dell'alunno)
  public static compressImage(src: any, newX: number, newY: number) {

    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const ratio = img.height / img.width;
        elem.width = newX;
        elem.height = newY;
        let posX = 0;
        let posY = 0;
        if (ratio>1) {
          newY = newX*ratio;          //rende il taglio proporzionato
          posY = (newY - newX) /2;    //posiziona il taglio
        } else { 
          newX = newY/ratio;          //rende il taglio proporzionato
          posX = (newX-newY)/2;       //posiziona il taglio
        }
        
        const ctx = elem.getContext('2d');
        ctx!.drawImage(img, -posX, -posY, newX, newY);
        
        const data = ctx!.canvas.toDataURL();
        res(data);
      }
      img.onerror = error =>{ 
        rej(error);
      }
    })
  }





   
  //Utility per caricare una foto nel template
  public static loadImage(src: any, newX: number) {

    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');

        let posX = 0;
        let posY = 0;
        let newY : number;

        const ratio = img.height / img.width;
        if (img.width> newX) {
          //immagine + piccola, non vado ad aumentarne le dimensioni
          newX = img.width;
          newY = newX*ratio
        } else {
          
          elem.width = newX;                      //imposta la larghezza al valore ricevuto
          elem.height = newX*ratio;               //imposta l'altezza corrispondente
          // if (ratio>1) {
            newY = newX*ratio;          //rende il taglio proporzionato
            posY = 0;    //posiziona il taglio
          // } else { 
          //   newX = newY/ratio;          //rende il taglio proporzionato
          //   posX = (newX-newY)/2;       //posiziona il taglio
          // }
        }
        const ctx = elem.getContext('2d');
        ctx!.drawImage(img, -posX, -posY, newX, newY);
        
        const data = ctx!.canvas.toDataURL();
        let arrReturn = [data, newX, newY];
        res(arrReturn);
      }
      img.onerror = error =>{ 
        rej(error);
      }
    })
  }




  public static getCurrentUser() : User {
    let obj: any;
    let tmp = localStorage.getItem('currentUser');
    obj = JSON.parse(tmp!) as User;
    return obj;
  }
  

  public static matchingPasswords(PasswordField : string, ConfirmPasswordField: string) {
    return (controls: AbstractControl) => {
      if (controls) {
        const Password = controls.get(PasswordField)!.value;
        const ConfirmPassword = controls.get(ConfirmPasswordField)!.value;
        //console.log ("check what is passed to the validator", password, confirmPassword);
        if (Password !== ConfirmPassword) { 
          //this is an error set for a specific control which you can use in a mat-error
          controls.get(ConfirmPasswordField)?.setErrors({not_the_same: true});  
          //this is the returned error for the form normally used to disable a submit button
          return {mismatchedPassword: true}  
        }
      }
      return null;
    }
  }

  public static checkIfChangedPasswords(PasswordField : string, NewPasswordField: string) {
    return (controls: AbstractControl) => {
      if (controls) {
        const Password = controls.get(PasswordField)!.value;
        const NewPassword = controls.get(NewPasswordField)!.value;
        //console.log ("check what is passed to the validator", password, confirmPassword);
        if (Password == NewPassword) { 
          //this is an error set for a specific control which you can use in a mat-error
          controls.get(NewPasswordField)?.setErrors({not_changed: true});  
          //this is the returned error for the form normally used to disable a submit button
          return {notChangedPassword: true}  
        }
      }
      return null;
    }
  }
}

  

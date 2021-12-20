import {Component, Inject} from '@angular/core';

export abstract class Utility {
     
  //static doSomething(val: string) { return val; }

  public static compressImage(src: any, newX: number, newY: number) {

    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        ctx!.drawImage(img, 0, 0, newX, newY);

        const data = ctx!.canvas.toDataURL();

        res(data);
        console.log("AS: ok", data);

      }
      img.onerror = error =>{ 
        rej(error);
        console.log("AS: error", error);
      }
    })
  }
}

  

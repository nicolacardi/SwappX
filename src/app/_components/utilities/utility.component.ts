export abstract class Utility {
     
  public static compressImage(src: any, newX: number, newY: number) {

    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;


            // var _URL = window.URL || window.webkitURL;

            // var objectUrl = _URL.createObjectURL(src);
            // img.onload = function () {
            //     alert(this.width + " " + this.height);
            //     _URL.revokeObjectURL(objectUrl);
            // };
            // img.src = objectUrl;

      


      img.onload = () => {
        const elem = document.createElement('canvas');
        console.log ("elem.width", img.width+" "+img.height);
        const ratio = img.height / img.width;
        console.log ("ratio", ratio);
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

        //elem.width = newX;
        //elem.height = newY;
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
}

  

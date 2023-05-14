import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';


@Component({
  selector: 'app-templates-manager',
  templateUrl: './templates-manager.component.html',
  styleUrls: ['./templates-manager.component.css']
})
export class TemplatesManagerComponent {


  selectedFile!: File;
  
  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post('http://example.com/upload', fd)
      .subscribe(res => {
        console.log(res);
      });
  }

}

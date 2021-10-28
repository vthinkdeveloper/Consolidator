import { Component, OnInit, Input } from '@angular/core';
import {FileUploadService} from '../services/common/file-upload.service'
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss']
})
export class ImageCardComponent implements OnInit {

  @Input() thumbnailImagePath:string;
  @Input() type: string;
  @Input() isround : boolean;
  @Input() width?: string;
  @Input() height?: string;
  imageUrl;

  constructor(private _fileUploadService: FileUploadService,private _authService: AuthService) { }

  ngOnInit(): void {
    let tenentId = this._authService.getUserToken().tenantId;
    if(this.thumbnailImagePath != undefined && this.thumbnailImagePath != ''){
      this._fileUploadService.downloadFile(tenentId,this.thumbnailImagePath,this.type).subscribe(data=>{      
        let imageBinary = data.result;
       // console.log(imageBinary);
        this.imageUrl = 'data:image/png;base64,' + imageBinary;
        this.setWidthandHeight();
      }, error => {
        this.imageUrl=this._fileUploadService.imageNotAvailableBase64;
        this.setWidthandHeight()
      }
      );
    }
    else{
      this.imageUrl=this._fileUploadService.imageNotAvailableBase64;
      this.setWidthandHeight()
    }
  }

  setWidthandHeight() {
    setTimeout(() => {
      if(this.width && this.height){
        let element = document.getElementById('dynamicImageClass');
        if(element)
        element.style.setProperty('width', this.width, 'important');
        element.style.setProperty('height', this.height, 'important');
      }
    },500);
  }


}

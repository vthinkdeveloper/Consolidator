import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  licenceurl:string
  currentyear=new Date().getFullYear();
  constructor(private _authService:AuthService) { }

  ngOnInit(): void {
    const tenantId=this._authService.getUserToken().tenantId
    this.licenceurl=`${environment.azureBlobBaseURL}customization/${tenantId}/documents/BrandMuscle_License_Agreement.pdf`
    //https://azfs01d.blob.core.windows.net/consolidator/customization/campariamerica/documents/BrandMuscle_License_Agreement.pdf
  }

}

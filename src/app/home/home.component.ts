import { getRtlScrollAxisType } from '@angular/cdk/platform';
import { Component, OnInit} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { AppCommonFunctions} from '../services/common/app-common';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  assetPath: string=environment.assetBasePath;
  private rightsObserver = new Subject<any>();

  constructor(private router: Router,route: ActivatedRoute, private _authService:AuthService, private _commonservice: AppCommonFunctions){}
  ngOnInit() {
    let tenentId = this._authService.getUserToken().tenantId;
    document.getElementById('loadingSpinnerContaineritem').style.display='block'
    this._commonservice.getRoles(tenentId).subscribe(data=>{ 
      localStorage.setItem('rights',data)
      this._commonservice.sendRights(true);
      document.getElementById('loadingSpinnerContaineritem').style.display='none' 
      let url=`program-dashboard/`
      this.router.navigate([url]);
    }, err => {
      this._commonservice.sendRights(false);
      document.getElementById('loadingSpinnerContaineritem').style.display='none';
    });
  }
}


import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment'
import { AuthService } from '../services/auth.service' 
import { AppCommonFunctions } from '../services/common/app-common';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  prevurl:string;
  imageUrl:string;
  username:string;
  assetPath: string = environment.assetBasePath;
  pageTitle: string = '';
  routerCallSubscription: Subscription;
  public resourceMessage: any;

  constructor(private router: Router, private _authService:AuthService,public appCommonFunctions: AppCommonFunctions,private appComponent: AppComponent) { 
    this.routerCallSubscription = this.router.events.subscribe((navigation) => {
      if (navigation instanceof NavigationEnd) {
        this.setTitle(navigation);
      }
   });
  }

  ngOnInit(): void {
    this.prevurl=`${environment.backUrl}`;
    const userToken = this._authService.getUserToken();
    this.username=this._authService.getUserToken().displayName;
    this.imageUrl= `${environment.azureBlobBaseURL}customization/${userToken.tenantId}/images/headerlogo.png`;
    if(!this.appCommonFunctions.getResourceMessages()) {
      this.appComponent
      .getResouceMessage()
      .subscribe((isResouceSuccessSuccess) => {
        this.resourceMessage = this.appCommonFunctions.getResourceMessages();
      });
    } else {
      this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    }

  }

  setTitle(navigation) {
    if(navigation.url === '/program-dashboard') {
      this.pageTitle =  this.resourceMessage && this.resourceMessage['programDashboard'];
    }
    if(navigation.url === '/program-order' || navigation.url === '/edit-order') {
      this.pageTitle = this.resourceMessage && this.resourceMessage['programOrderBM'];
    }
    if(navigation.url === '/buywindow'|| navigation.url === '/create-program'){
      this.pageTitle = this.resourceMessage && this.resourceMessage['ProgramBuilderMenu'];
    }
    if(navigation.url === '/admin-dashboard'){
      this.pageTitle = this.resourceMessage && this.resourceMessage['AdminDashboard'];
    }
    if(navigation.url === '/manage-program'){
      this.pageTitle = this.resourceMessage && this.resourceMessage['ProgramManager'];
    }
    if(navigation.url === '/create-program'){
      let element = JSON.parse(localStorage.getItem('adminProgramData'));
      let completeElement = JSON.parse(localStorage.getItem('isAdminCompleteProgram'));
      if(element || completeElement) {
        this.pageTitle = this.resourceMessage && this.resourceMessage['ProgramManager'];
      }
    }
  }

  backtohome(){
    //sessionStorage.setItem('brandmuscle_token',null);
  }

}

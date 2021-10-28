import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Subscription, Observable, forkJoin, Subject, of } from 'rxjs';
import { ResourceMessagesService } from './services/resource-messages/resource-messages.service';
import { catchError, filter } from 'rxjs/operators';
import { AppCommonFunctions } from './services/common/app-common';
import { Router, RouterEvent, NavigationEnd, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
declare var $ : any
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'consolidator';
  tokenSubscription: Subscription;
  previousUrl: string;
  themeProperties$;
  private resouceMessageObserver = new Subject<any>();
  assetPath: string=environment.assetBasePath;
  createpath=this.assetPath+"images/createprg.svg";
  constructor(private router: Router,private authService: AuthService, private resourceMessageService: ResourceMessagesService, private appConstants: AppCommonFunctions) {
    
    router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: NavigationEnd) => {
    console.log('prev:', event.url);
    this.previousUrl = event.url;
    
  });
    
    // subscribe to api token
    this.tokenSubscription = this.authService.getToken().subscribe(isTokenSuccess => {
      if (isTokenSuccess.isSucceded) { // If token api succeeds
        this.tokenSubscription.unsubscribe(); // Unsubscribing token api.
        const themeValues = sessionStorage.getItem('subscriptionTheme');
        const resourecMessageValue = sessionStorage.getItem('subscriptionResourceMessage');
        if(!themeValues || !resourecMessageValue) {
          this.resourceMessageThemeAPiCall().subscribe(
            (resourceThemeResponse) => {
              if(resourceThemeResponse[0].error){
                console.log('resource message failed')
                sessionStorage.setItem('consolidatorResourceMessage', JSON.stringify(this.appConstants.resouceMessage));
              }
              else{
                sessionStorage.setItem('consolidatorResourceMessage', JSON.stringify(resourceThemeResponse[0]));
              }
              if(resourceThemeResponse[1] && resourceThemeResponse[1].result && resourceThemeResponse[1].result.value)  {
                this.themeProperties$ = resourceThemeResponse[1].result.value;
                sessionStorage.setItem('ConsolidatorTheme', JSON.stringify(this.themeProperties$));
              }
              if(resourceThemeResponse[2] && resourceThemeResponse[2].result && resourceThemeResponse[2].result.value)  {
                sessionStorage.setItem('ConsolidatorConfig', JSON.stringify(resourceThemeResponse[2].result.value));
              }
              this.bindThemeProperties();
              this.resouceMessageObserver.next(true);
            }, err => {
              sessionStorage.setItem('consolidatorResourceMessage', JSON.stringify(this.appConstants.resouceMessage));
              this.resouceMessageObserver.next(true);
            });
        } else {
            this.resouceMessageObserver.next(false);
            this.themeProperties$ = themeValues ? JSON.parse(themeValues) : {};
            this.bindThemeProperties();
          }
        }
      });
      $('html,body').animate({scrollTop:0});
  }

  ngOnInit() {
    $('html,body').animate({scrollTop:0});
  }

  /**
   * Purpose - To call both theme and resource message api.
   */
  resourceMessageThemeAPiCall(): Observable<any> {
    const locale = sessionStorage.getItem('locale') ? sessionStorage.getItem('locale') : 'EN';
    const businessunitid = this.authService.getUserToken().businessUnitId;
    let tenentId = this.authService.getUserToken().tenantId
    const resourecMessageResponse = this.resourceMessageService.getResourceMessages(businessunitid).pipe(
      catchError(err => of(err)),
    );
    const themeResponse = this.resourceMessageService.getThemeApiResponse(tenentId).pipe(
      catchError(err => of(err)),
    );
    const configCall = this.resourceMessageService.getConfigs(tenentId).pipe(
      catchError(err => of(err)),
    );
    return forkJoin([resourecMessageResponse,themeResponse,configCall]);
  }

  /**
   * Purpose - To bind Theme properties.
   */
  bindThemeProperties() {
    if (document.documentElement && document.documentElement.style) {
      document.documentElement.style.setProperty('--app-background-color', this.themeProperties$ &&
      this.themeProperties$.color.appBackgroundColor ? this.themeProperties$.color.appBackgroundColor : '#006ef5');
      document.documentElement.style.setProperty('--app-description-text-color', this.themeProperties$ &&
      this.themeProperties$.color.appDescriptionTextColor ?  this.themeProperties$.color.appDescriptionTextColor : '#a59e9e');
      document.documentElement.style.setProperty('--app-font-color', this.themeProperties$ &&
      this.themeProperties$.color.appFontColor ?  this.themeProperties$.color.appFontColor : '#000');
      document.documentElement.style.setProperty('--app-primarytext-color', this.themeProperties$ &&
      this.themeProperties$.color.appPrimaryTextColor ?  this.themeProperties$.color.appPrimaryTextColor : '#3a3a3a');
      document.documentElement.style.setProperty('--appsecondary-background-color', this.themeProperties$ &&
      this.themeProperties$.color.appSecondaryBackgroundColor ?  this.themeProperties$.color.appSecondaryBackgroundColor : '#f8f8f8');
      document.documentElement.style.setProperty('--app-selection-background-color', this.themeProperties$ &&
      this.themeProperties$.color.appSelectionBackgroundColor ?  this.themeProperties$.color.appSelectionBackgroundColor : '#f3f8ff');
      document.documentElement.style.setProperty('--button-disable-color', this.themeProperties$ &&
      this.themeProperties$.color.buttonDisableColor ?  this.themeProperties$.color.buttonDisableColor : '#999595');
      document.documentElement.style.setProperty('--error-text-color', this.themeProperties$ &&
      this.themeProperties$.color.errorTextColor ?  this.themeProperties$.color.errorTextColor : '#ff0000');
      document.documentElement.style.setProperty('--header-back-color', this.themeProperties$ &&
      this.themeProperties$.color.headerBackColor ?  this.themeProperties$.color.headerBackColor : 'rgb(0, 46, 96)');
      document.documentElement.style.setProperty('--header-front-color', this.themeProperties$ &&
      this.themeProperties$.color.headerFrontColor ?  this.themeProperties$.color.headerFrontColor : '#fff');
      document.documentElement.style.setProperty('--footer-back-color', this.themeProperties$ &&
      this.themeProperties$.color.footerBackcolor ?  this.themeProperties$.color.footerBackcolor : '#000');
      document.documentElement.style.setProperty('--footer-front-color', this.themeProperties$ &&
      this.themeProperties$.color.footerFrontColor ?  this.themeProperties$.color.footerFrontColor : '#fff');
      document.documentElement.style.setProperty('--createpath', this.createpath );
    }
  }

  /**
   * Purpose - To create a new Observable for resourceMessage api.
   * @returns ()
   *   created observer
   */
  getResouceMessage(): Observable<any> {
    return this.resouceMessageObserver.asObservable();
  }
}

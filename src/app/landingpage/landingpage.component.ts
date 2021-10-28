import { Component, OnInit,SimpleChanges, ElementRef, HostListener } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppCommonFunctions } from '../services/common/app-common';
import { MatDrawerMode } from '@angular/material/sidenav'
import { AuthService } from '../services/auth.service';
import { AppComponent } from '../app.component';
declare var $ : any

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss']
})

export class LandingpageComponent implements OnInit {
  showFiller = false;
  assetPath: string = environment.assetBasePath;
  events: string[] = [];
  opened: boolean = true;
  showMenuScreen: boolean = true;
  mode: MatDrawerMode = 'side'
  routerCallSubscription: Subscription;
  selectedMenu = 0;
  rights:any;
  showSidebarButton = false;
  showHeaderScreen = true;
  public resourceMessages: any;
  menuArray  = [
    {
     name: 'Dashboard',
     logo: this.assetPath + 'images/dashboard.svg',
     activelogo: this.assetPath + 'images/dashboardactive.svg',
     url:'/program-dashboard'
    },
    {
      name: 'Order',
      logo: this.assetPath + 'images/cart.svg',
      activelogo: this.assetPath + 'images/orderactive.svg',
      url:'/program-order'
    }];

  constructor(private router: Router, private elementRef: ElementRef, public appConstants: AppCommonFunctions,private _authService:AuthService,private appComponent: AppComponent) { 
    if(this.appConstants && this.appConstants.isMobileCompatibleScreen()){
      this.opened = false;
      this.showMenuScreen = true;
      this.mode = 'over' as MatDrawerMode;
    } else {
      this.mode = 'side' as MatDrawerMode;
    }
    this.routerCallSubscription = this.router.events.subscribe((navigation) => {
      if (navigation instanceof NavigationEnd) {
        if(navigation.url === '/program-dashboard') {
          this.setBackGroundColor();
          this.selectedMenu = 0;
        }
        if(navigation.url === '/program-order') {
          this.setBackGroundColor();
          this.selectedMenu = 1;
        }
        if(navigation.url === '/buywindow'){
          this.setBackGroundColor();
          this.selectedMenu = 2;
        }
        if(navigation.url === '/buywindow'){
          this.setBackGroundColor();
          this.selectedMenu = 2;
        } 
        if(navigation.url === '/admin-dashboard') {
          this.setBackGroundColor();
          this.selectedMenu = 3;
        }
        if(navigation.url === '/create-program') {
          this.setBackGroundColor();
          if(sessionStorage.getItem('isFromModifyMobile') || localStorage.getItem('adminProgramData'))
          this.selectedMenu = 3;
          else 
          this.selectedMenu = 2;
        }
      }
   });
  }

  @HostListener('window:scroll', ['$event']) 
  scrollHandler(event) {
      if(this.appConstants && this.appConstants.isMobileCompatibleScreen()) {
        this.showHeaderScreen =  true;
      } else if(!this.showHeaderScreen && window.parent.scrollY === 0) {
        this.showHeaderScreen = true;
      } else if(this.showHeaderScreen && window.parent.scrollY > 70) {
        this.showHeaderScreen = false;
      }
  }

  changeFocusImage() {
    let element = document.getElementById('sidebar-button');
    if (this.opened) {
      element['src'] = this.assetPath + 'images/expand-blue.svg'
    } else {
      element['src'] = this.assetPath + 'images/collapse-blue.svg'
    }
  }

  changeNormalImage() {
    let element = document.getElementById('sidebar-button');
    if (this.opened) {
      element['src'] = this.assetPath + 'images/expand-white.svg'
    } else {
      element['src'] = this.assetPath + 'images/collapse-white.svg'
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if ((event.target.id !== "mobile-screen-menu" &&  event.target.id !== "sidebar-button-mobile" && event.target.id !== "brandmusclelogo" && this.showMenuScreen)) {
      this.showMenuScreen = false;
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      let element = document.getElementById('sidebar-button');
      if (element) {
        element.style.paddingLeft = '185px';
        element['src'] = this.assetPath + 'images/expand-blue.svg';
      }
      let programElement = document.getElementById('2logo')
      if(programElement) {
        programElement.style.paddingLeft = '18px';
      }
      let adminElement = document.getElementById('3logo')
      if(adminElement) {
        adminElement.style.paddingLeft = '18px';
      }
    }, 100);
    if(!this.appConstants.getResourceMessages()) {
      this.appComponent
      .getResouceMessage()
      .subscribe((isResouceSuccessSuccess) => {
        this.resourceMessages = this.appConstants.getResourceMessages();
        this.setMenuBasedOnRights()
      });
    } else {
      this.resourceMessages = this.appConstants.getResourceMessages();
      this.setMenuBasedOnRights()
    }
    this.appConstants.getRightsSuccessEvent().subscribe(isRightsApiCompleted => {
      this.resourceMessages = this.appConstants.getResourceMessages();
      this.setMenuBasedOnRights()
    })     
  }



  setMenuBasedOnRights() {
    this.rights= localStorage.getItem('rights');
    if(this.rights == null || this.rights == undefined){
      let tenentId = this._authService.getUserToken().tenantId;

      this.appConstants.getRoles(tenentId).subscribe(data=>{    
        localStorage.setItem('rights',data)
        this.rights= localStorage.getItem('rights');
        this.loadRoleBasedMenu()
      });
    }
    else{
      this.loadRoleBasedMenu()
    }
  }

  loadRoleBasedMenu(){    
    if(this.rights && ((typeof this.rights) === 'string')) {
      this.rights=this.rights.split(',')
      if(this.rights && this.rights instanceof Array &&  (this.rights.includes('ConsolidatorProgramBuilder') || this.rights.includes('ConsolidatorProgramBuilderAdmin') || this.rights.includes('ConsolidatorProgramBuilderCreator'))) {
        this.menuArray = [
          {
           name: this.resourceMessages && this.resourceMessages['DashboardMenu'],
           logo: this.assetPath + 'images/dashboard.svg',
           activelogo: this.assetPath + 'images/dashboardactive.svg',
           url:'/program-dashboard'
          },
          {
            name: this.resourceMessages && this.resourceMessages['OrderMenu'],
            logo: this.assetPath + 'images/cart.svg',
            activelogo:this.assetPath + 'images/orderactive.svg',
            url:'/program-order'
          }, 
          {
            name: this.resourceMessages && this.resourceMessages['ProgramBuilderMenu'],
            logo: this.assetPath + 'images/programbuilder.svg',
            activelogo:this.assetPath + 'images/programbuilderactive.svg',
            url:'/buywindow'
          }]
      }
      else{
        this.menuArray = [
          {
           name: this.resourceMessages && this.resourceMessages['DashboardMenu'],
           logo: this.assetPath + 'images/home.svg',
           activelogo: this.assetPath + 'images/dashboardactive.svg',
           url:'/program-dashboard'
          },
          {
            name: this.resourceMessages && this.resourceMessages['OrderMenu'],
            logo: this.assetPath + 'images/cart.svg',
            activelogo:this.assetPath + 'images/orderactive.svg',
            url:'/program-order'
          }]
      }
      if (this.rights.includes('ConsolidatorAdmin')) {
        let adminMenu = {
          name: this.resourceMessages && this.resourceMessages['AdminMenu'],
          logo: this.assetPath + 'images/admin.svg',
          activelogo: this.assetPath + 'images/adminselected.svg',
          url:'/admin-dashboard'
        };
        this.menuArray.push(adminMenu);
      }
    }
    else{
      this.menuArray = [
        {
         name: this.resourceMessages && this.resourceMessages['DashboardMenu'],
         logo: this.assetPath + 'images/dashboard.svg',
         activelogo: this.assetPath + 'images/dashboardactive.svg',
         url:'/program-dashboard'
        },
        {
          name: this.resourceMessages && this.resourceMessages['OrderMenu'],
          logo: this.assetPath + 'images/cart.svg',
          activelogo:this.assetPath + 'images/orderactive.svg',
          url:'/program-order'
        }]
    }
  }

  setBackGroundColor() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 
    this.appConstants.getTheme() && this.appConstants.getTheme().color && 
    this.appConstants.getTheme().color.appSelectionBackgroundColor ? this.appConstants.getTheme().color.appSelectionBackgroundColor : '#f3f8ff';
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  routeElement(selectedItem) {
    //.selectedMenu = selectedItem;
   //if(this.selectedMenu === 0) {
     if(this.router.url !== selectedItem) {
      localStorage.removeItem('orderData');
     }
     this.router.navigate([selectedItem]);
  //  } else if (this.selectedMenu === 1) {
  //   localStorage.setItem('orderData', null);
  //   this.router.navigate(['/program-order']);
  //  } else if (this.selectedMenu === 2) {
  //   this.router.navigate(['/buywindow']);
  //  } else {
  //   this.router.navigate(['/admin-dashboard']);
  //  }
   $('html,body').animate({scrollTop:0});
  }

  showMenuScreenClicked() {
    this.showMenuScreen = !this.showMenuScreen;
  }

  showExpandIcon() {
    this.showSidebarButton = true;
  }

  hideExpandIcon() {
    if(this.opened) {
      this.showSidebarButton = false;
    }
  }

  toggleSideBar() {
    let element = document.getElementById('sidebar-button');
    if(!element){
      return;
    }
    if (this.opened) {
      this.showSidebarButton = true;
      element.style.paddingLeft = '30px'
      element['src'] = this.assetPath + 'images/collapse-blue.svg'
      this.opened = false;
    } else {
      this.showSidebarButton = false;
      element.style.paddingLeft = '185px'
      element['src'] = this.assetPath + 'images/expand-blue.svg'
      this.opened = true;
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AdminDashboardService } from  '../assign-users/services/admin-dashboard.service';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from '../toast-message/toast-message.component'
import { Router } from '@angular/router';
import { AppCommonFunctions } from '../services/common/app-common';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  assetPath: string = environment.assetBasePath;
  rights:any;
  public resourceMessage: any;

  // menuArray  = [
  //   {
  //     url: '',
  //     name: 'Thumbnail 5',
  //     logo: this.assetPath + 'images/thumbnail5.svg',
  //     hoverLogo: this.assetPath + 'images/thumbnail5-hover.svg'
  //   },
  //   {
  //     url: '',
  //     name: 'Thumbnail 6',
  //     logo: this.assetPath + 'images/thumbnail6.svg',
  //     hoverLogo: this.assetPath + 'images/thumbnail6-hover.svg'
  //   }];
    menuArray = []
    over = [];
   
  constructor(public adminService: AdminDashboardService, private _authService: AuthService, private _snackBar: MatSnackBar,
    private router: Router, public appConstants: AppCommonFunctions,public appCommonFunctions: AppCommonFunctions,
    private appComponent: AppComponent) { }


  ngOnInit(): void {
   if(!this.appCommonFunctions.getResourceMessages()) {
      this.appComponent
      .getResouceMessage()
      .subscribe((isResouceSuccessSuccess) => {
        this.resourceMessage = this.appCommonFunctions.getResourceMessages();
      });
     } else {
      this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    }
    this.setMenuBasedOnRights();
  }

  openSnackBar(name,message, type) {   
    this._snackBar.openFromComponent(ToastMessageComponent,{
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type],
      data: {
        html: message,
        type:type,
        assetpath:this.assetPath,
        name:name
      }
    });
  }

  setMenuBasedOnRights() {
    this.rights= localStorage.getItem('rights');
    if(this.rights == null || this.rights == undefined) {
      let tenentId = this._authService.getUserToken().tenantId;
      this.appConstants.getRoles(tenentId).subscribe(data=>{    
        localStorage.setItem('rights',data)
        this.rights= localStorage.getItem('rights');
        this.loadRoleBasedMenu()
      });
    } else {
      this.loadRoleBasedMenu()
    }
  }

  loadRoleBasedMenu(){    
    if(this.rights && ((typeof this.rights) === 'string')) {
      this.rights=this.rights.split(',')
      if (this.rights && (this.rights instanceof Array) && this.rights.includes('ConsolidatorAdmin')) {
       let manageProgram = {
          url:'/manage-program',
          name: this.resourceMessage && this.resourceMessage['ManageProgram'],
          logo: this.assetPath + 'images/manageprogram.svg',
          hoverLogo: this.assetPath + 'images/manageprogram-hover.svg'
        }
        this.menuArray.splice(0, 0, manageProgram);
        let programAttribute = {
          url: './create-formio',
          name: this.resourceMessage && this.resourceMessage['ProgramAttributes'],
          logo: this.assetPath + 'images/program-attributes.svg',
          hoverLogo: this.assetPath + 'images/hover-program.svg'
        }
        this.menuArray.splice(1, 0, programAttribute);
        // let manageUsers = {
        //   url: '',
        //   name: this.resourceMessage && this.resourceMessage['ManageUsers'],
        //   logo: this.assetPath + 'images/manage-users.svg',
        //   hoverLogo: this.assetPath + 'images/user-highlight.svg'
        // }
        // this.menuArray.splice(1, 0, manageUsers);
        // let manageAddress = {
        //   url: '',
        //   name: this.resourceMessage && this.resourceMessage['ManageAddress'],
        //   logo: this.assetPath + 'images/manage-address.svg',
        //   hoverLogo: this.assetPath + 'images/address-hover.svg'
        // }
        // this.menuArray.splice(2, 0, manageAddress);
        // let programAttribute = {
        //   url: '',
        //   name: this.resourceMessage && this.resourceMessage['ProgramAttributes'],
        //   logo: this.assetPath + 'images/program-attributes.svg',
        //   hoverLogo: this.assetPath + 'images/hover-program.svg'
        // }
        // this.menuArray.splice(3, 0, programAttribute);
        this.over = new Array(this.menuArray.length);
        this.over.fill(false);
      }
    }
  }

  redirect(menu){
   if(menu.url)
   this.router.navigate([menu.url]);
  }

}

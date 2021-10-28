import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppCommonFunctions } from '../../services/common/app-common';
import { AppComponent } from '../../app.component';
import {ManageProgramService} from '../services/manage-program.service'
import {ProgramOrderDetails} from '../../programDashboard/_model/programOrderDetails'
import {AuthService} from '../../services/auth.service'
@Component({
  selector: 'app-manage-program',
  templateUrl: './manage-program.component.html',
  styleUrls: ['./manage-program.component.scss']
})
export class ManageProgramComponent implements OnInit {
  assetPath: string=environment.assetBasePath;
  public resourceMessage: any;
  programDetails:ProgramOrderDetails[]=[]

  //buywindowlist:createBuyWindow[]=[]; 
  activeprogramDetails:ProgramOrderDetails[]=[];
  completedprogramDetails:ProgramOrderDetails[]=[];
  isloaded:boolean = false;
  status=['active','archived'];
  constructor(public appCommonFunctions: AppCommonFunctions, private appComponent: AppComponent, private _authService:AuthService, 
    public _manageProgramService:ManageProgramService) { }
 ten
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

    this.loadPrograms();
  }

  loadPrograms(searchval:string=null){
    this.appCommonFunctions.showLoader('loadingSpinnerContainerProgram');
    let tenentId = this._authService.getUserToken().tenantId
    this._manageProgramService.GetAllPublishedPrograms(tenentId,searchval).subscribe(program=>{
      this.programDetails=program.result;
      this.isloaded=true;
      this.activeprogramDetails = this.programDetails.filter(
        program => program.isActive)

      this.completedprogramDetails = this.programDetails.filter(
        program => !program.isActive)
       this.appCommonFunctions.hideLoader('loadingSpinnerContainerProgram');
      },
      (err) => {
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerProgram');
      });
  }

  search(txtsearchval){
    if(txtsearchval == ""){
      txtsearchval=null;
    }
    if(txtsearchval == "" || txtsearchval == " "){
      txtsearchval=null;
    }

    if(txtsearchval != null){
      if (!txtsearchval.replace(/\s/g, '').length) {
        txtsearchval=null;
      }
    }
    this.loadPrograms(txtsearchval);
  }

  getElementLoading(){
    const loadingElement = document.getElementById('loadingSpinnerContainerProgram').style.display;;
    if (loadingElement == 'block') {
      return false;
    } else {
      return true;
    }
  }

}

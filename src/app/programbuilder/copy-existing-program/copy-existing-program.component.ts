import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppCommonFunctions } from '../../services/common/app-common';
import { AuthService } from '../../services/auth.service';
import { BuyWindowService } from '../../buybuilder/services/buy-window.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { ToastMessageComponent } from '../../toast-message/toast-message.component';
import { createBuyWindow } from '../../buybuilder/_models/buywindow';
import { ProgramDetails } from '../_models/program'
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { OrderService } from  '../../programOrder/services/order.service';

@Component({
  selector: 'app-copy-existing-program',
  templateUrl: './copy-existing-program.component.html',
  styleUrls: ['./copy-existing-program.component.scss']
})
export class CopyExistingProgramComponent implements OnInit {
  public resourceMessage: any;
  assetPath: string = environment.assetBasePath;
  @Input() programList: any;
  @Output() copyProgramFromBuyWindow = new EventEmitter<string>();
  selectedBuyWindow: any;
  selectedProgramToCopy: any;
  buywindowlist:createBuyWindow[]=[]; 
  programDetails:ProgramDetails[]=[];
  coypButtonClicked = false;
  copyExistingForm = this.formBuilder.group({
    buyWindowName: ['', Validators.required],
    programName: ['', Validators.required]
  });


  constructor(public appCommonFunctions: AppCommonFunctions, private _authService: AuthService, private _buyWindowService: BuyWindowService,
    private _snackBar: MatSnackBar, private formBuilder: FormBuilder, private _orderservice:OrderService) { }

  ngOnInit(): void {
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.loadBuywindowlist(null, null);
  }

  selectBuyWindow(event) { 
    this.selectedBuyWindow = event;
    this.selectedProgramToCopy = null;
    this.copyExistingForm.controls['programName'].setValue(null)
    this.copyExistingForm.controls['buyWindowName'].setValue(this.selectedBuyWindow.buyWindowName)
    this.loadProgramDetails();
  }

  selectCategoryToCopy(event) {
    this.selectedProgramToCopy = event;
    this.copyExistingForm.controls['programName'].setValue(this.selectedProgramToCopy.programName)
  }

  /**
   * To load buy window list.
   * @param searchkey searchkey to search buywindow list
   * @param searchval search category value
   */
  loadBuywindowlist(searchkey,searchval){
    document.getElementById('loadingSpinnerContainerprogram').style.display='block'
    let tenentId = this._authService.getUserToken().tenantId
    this._buyWindowService.getAllPublishedBuyWindows(tenentId).subscribe(data=>{
    this.buywindowlist = data.result;
    document.getElementById('loadingSpinnerContainerprogram').style.display='none';
    if(this.buywindowlist.length == 0 &&(searchkey== null)){
      let rm=this.resourceMessage && this.resourceMessage['NoBuywindowWarning'];
      this.openSnackBar(rm, 'warning');
    }
    },
    (err) => {
      document.getElementById('loadingSpinnerContainerprogram').style.display='none';
      this.openSnackBar(err.error, 'error');
    });
}

loadProgramDetails(){
  
  let tenentId = this._authService.getUserToken().tenantId;
  document.getElementById('loadingSpinnerContainerprogram').style.display='block'
  this._orderservice.GetProgramsByUser(tenentId,this.selectedBuyWindow.buyWindowId).subscribe(data=>{   
      document.getElementById('loadingSpinnerContainerprogram').style.display='none';   
      this.programDetails=data.result;
    },
    (err) => {
      document.getElementById('loadingSpinnerContainerprogram').style.display='none';
      this.openSnackBar(err.error, 'error');
    });
}

disableProgramDropDown() {
  if(this.programDetails && this.programDetails.length) {
    return false
  } else {
    return true
  }
}

isToolTipExists(id) {
  let element = document.getElementById(id);
  if(element && (element.offsetWidth < element.scrollWidth)) {
      return  element.id;
  }
  return ''
}
  /**
   * To open success and warning messages Indicators.
   * @param message Required message to display.
   * @param type Indicator types.
   */
  openSnackBar(message, type) {   
    this._snackBar.openFromComponent(ToastMessageComponent,{
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type],
      data: {
        html: message,
        type:type,
        assetpath:this.assetPath
      }
    });
  }

  copyProgramClicked() {
    this.coypButtonClicked = true;
    if(this.copyExistingForm.invalid){
      return
    }
    this.copyProgramFromBuyWindow.emit(this.selectedProgramToCopy.programID);
  }


}

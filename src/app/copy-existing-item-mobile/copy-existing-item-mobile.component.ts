import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ItemServiceService } from '../programbuilder/services/Item-service/item-service.service';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { AppCommonFunctions } from '../services/common/app-common';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ToastMessageComponent} from '../toast-message/toast-message.component';

@Component({
  selector: 'app-copy-existing-item-mobile',
  templateUrl: './copy-existing-item-mobile.component.html',
  styleUrls: ['./copy-existing-item-mobile.component.scss']
})
export class CopyExistingItemMobileComponent implements OnInit, OnDestroy {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  buywindowname: string;
  buywindowdata;
  programItemListFromCopied:any
  createdFromProgramId:string;
  tenentId: any;
  assetPath: string = environment.assetBasePath;
  public resourceMessage: any;
  enablecreatebutton:boolean=false;
  step = 0;

  constructor(private itemService: ItemServiceService, private _authService: AuthService,private _location: Location,
    public appCommonFunctions: AppCommonFunctions,private _snackBar: MatSnackBar) { 
  }

  ngOnInit(): void {
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.buywindowdata = JSON.parse(localStorage.getItem('buywindowData'));
    this.createdFromProgramId = JSON.parse(sessionStorage.getItem('createdFromProgramId'));
    this.buywindowname = this.buywindowdata.buywindowName;
    this.tenentId = this._authService.getUserToken().tenantId;
    this.getItemListByCopiedProgramId();
  }

  getItemListByCopiedProgramId(){    
    if (document.getElementById('loadingSpinnerContainerProgram')) {
       document.getElementById('loadingSpinnerContainerProgram').style.display='block';
    }
    let  programId=this.createdFromProgramId;
    this.itemService.getItemListByProgramId(this.tenentId, programId).subscribe(data=> {
      this.programItemListFromCopied = data.result;
      if (document.getElementById('loadingSpinnerContainerProgram')) {
       document.getElementById('loadingSpinnerContainerProgram').style.display='none';
      }
      //this.getItemList();
    })
  }

  create() {
    let checkboxes:any =(<HTMLInputElement[]><any>document.getElementsByName('checkitem'));
    let programItemID=[];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked == true) {
        programItemID.push(checkboxes[i].value);
      }
    }
    let toprogramid=localStorage.getItem('programID')
    this.appCommonFunctions.showLoader('loadingSpinnerContainerProgram');
    this.itemService.CopyItemToProgram(this.tenentId,this.createdFromProgramId,toprogramid,programItemID).subscribe(resut=>{
    this.appCommonFunctions.hideLoader('loadingSpinnerContainerProgram');
    this.closePage();
    }, (err) => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerProgram');
      this.openSnackBar('',err.error, 'error');
    })
  }

  setStep(index: number) {
    this.step = index;
  }

  checkitem(ele){
    let checkboxes:any =(<HTMLInputElement[]><any>document.getElementsByName('checkitem'));
    this.enablecreatebutton=false;
    //if (ele.checked) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            this.enablecreatebutton=true
        }
      }
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

  checkAll(ele){
    let checkboxes:any =(<HTMLInputElement[]><any>document.getElementsByName('checkitem'));
    if (ele.checked) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = true;
            this.enablecreatebutton=true
        }
     }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        console.log(i)
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = false;
            this.enablecreatebutton=false;
        }
      }
    }
  }

  closePage(){
    this._location.back();
    sessionStorage.removeItem('createdFromProgramId');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    sessionStorage.removeItem('createdFromProgramId')
  }

}

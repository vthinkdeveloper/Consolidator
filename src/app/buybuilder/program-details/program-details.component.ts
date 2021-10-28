import { Component, OnInit, Input, ViewChild,Output,EventEmitter } from '@angular/core';
import { BuyWindowService } from '../services/buy-window.service';
import { AuthService } from '../../services/auth.service';
import {ProgramDetails} from '../../programbuilder/_models/program'
import { environment } from 'src/environments/environment';
import { popupSection } from '../../services/common/app-common';
import { popupViewData } from '../../services/common/app-common';
import { AppCommonFunctions } from '../../services/common/app-common';
import { ConfirmPopupComponent } from '../../confirm-popup/confirm-popup.component';
import {ProgramService} from '../../programbuilder/services/program.service';
import { ToastMessageComponent } from '../../toast-message/toast-message.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {ViewModelComponent} from '../../view-model/view-model.component'

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
declare var $ : any
@Component({
  selector: 'app-program-details',
  templateUrl: './program-details.component.html',
  styleUrls: ['./program-details.component.scss']
})
export class ProgramDetailsComponent implements OnInit {

  constructor(public dialog: MatDialog,private router: Router,private _buyWindowService: BuyWindowService,
     private _authService: AuthService,
      public appCommonFunctions: AppCommonFunctions,
       private _programService:ProgramService,
       private _snackBar: MatSnackBar,) { }
  @Input() buywindowId:string;
  @Input() buyWindowName: string;
  @Input() endDate: Date;
  @Input() startDate:Date;
  @Input() status:string;
  @Input() canDelete: boolean;
  @Input() searchText;
  @Input() searchCategoryid;
  @Input() selectedElement:any;
  @Output() callbuy = new EventEmitter<string>();
  selectedViewElement:any;
  popupViewData :popupViewData;
  programDetails:ProgramDetails[]=[]; 
  assetPath: string=environment.assetBasePath;
  deleteProgram: any;
  popupDataObject: popupSection;
  public resourceMessage: any;
  @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent ;
  ngOnInit(): void {
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.loadProgramDetails();
  }

  loadProgramDetails(type?:string){
    document.getElementById('loadingSpinnerContainerProgramitem').style.display='block'
    let tenentId = this._authService.getUserToken().tenantId;
    if(this.searchText === ''){
      this.searchText=null;
      this.searchCategoryid =null;
    }
    this._buyWindowService.getBuyWindowProgramsById(tenentId,this.buywindowId, this.searchCategoryid, this.searchText).subscribe(data=>{      
      this.programDetails=data.result;
      document.getElementById('loadingSpinnerContainerProgramitem').style.display='none'
      if(this.programDetails.length == 0 && type =='delete'){
        // let expand=document.getElementsByClassName("expanded");
        // expand[0].classList.remove("expanded");
        this.callbuy.next(this.selectedElement);
      }
     // console.log(this.programDetails);
    });
  }

  getStartandEndDate(program) {
   return program.startDate.split('T')[0] + ' - ' + program.endDate.split('T')[0]
  }

  openDeletePopup(program:any){
    this.deleteProgram = program;
    this.popupDataObject = new popupSection();
    this.popupDataObject.selectedItem = this.deleteProgram.programName;
    this.popupDataObject.type = 'program'
    this.popupDataObject.title = this.resourceMessage && this.resourceMessage['Deletelbl'];
    this.popupDataObject.okButtonTitle = this.resourceMessage && this.resourceMessage['Deletebtn'];
    this.popupDataObject.cancelButtonTile = this.resourceMessage && this.resourceMessage['ArchiveCancel'];;
    this.confirmPopup.openPopup();
  }

  archiveApi(){
    document.getElementById('loadingSpinnerContainerProgramitem').style.display='block'
    let tenentId = this._authService.getUserToken().tenantId
    this._programService.delete(tenentId, this.deleteProgram.programID).subscribe(data=>{
      let rms= this.resourceMessage && this.resourceMessage['PgmDeleteMessage'];
      let msg= '<b>'+this.deleteProgram.programName+ '</b> <br>' + rms;
      this.openSnackBar(this.deleteProgram.programName,rms, 'success');
      this.loadProgramDetails('delete');
      this.callbuy.next(this.deleteProgram);
      this.confirmPopup.cancelClicked();
      }, (err) => {
      document.getElementById('loadingSpinnerContainerprogram').style.display='none';
      this.openSnackBar('',err.error, 'error');
    });
  }
  cancelArchive(){

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

  modifyProgram(program,index){
    event.preventDefault();
   // localStorage.setItem("buywindowname", element.buywindowName);
    //localStorage.setItem("buywindowid", element.buywindowId);
    let buywindowdata={
      buywindowName: this.buyWindowName,
      buywindowId : this.buywindowId,
      endDate : this.endDate,
      programID: program.programID,
      programIndex: index,
      startDate:this.startDate
    }
    localStorage.removeItem('adminProgramData');
    localStorage.removeItem('isAdminCompleteProgram');
    localStorage.setItem('buywindowData', JSON.stringify(buywindowdata));

    let url=`create-program/`
    
    //console.log(url);
    this.router.navigate([url]);
    $('html,body').animate({scrollTop:0});
  }


  openDialog(element): void { 
    this.selectedViewElement=element;
    const dialogRef = this.dialog.open(ViewModelComponent, {
      width: '100%',
      maxHeight: '90vh',
      data: {
          buyWindowName : this.buyWindowName,
          buywindowID: this.buywindowId,
          programID:this.selectedViewElement.programID
      },
      panelClass: 'dialog-container' 
    });

    dialogRef.afterClosed().subscribe(result => {     
      
    },
    error=>{
      console.log('error');
    }
    
    );
  }

}

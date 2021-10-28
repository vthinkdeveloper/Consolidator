import { Component, OnInit, Input, Inject, EventEmitter, Output  } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import {ProgramDetails} from '../programbuilder/_models/program';
import { AuthService } from '../services/auth.service';
import { BuyWindowService } from '../buybuilder/services/buy-window.service'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { popupViewData } from '../services/common/app-common';
import {ProgramService} from '../programbuilder/services/program.service';
import { ItemServiceService } from '../programbuilder/services/Item-service/item-service.service';
import { AppCommonFunctions } from '../services/common/app-common';
@Component({
  selector: 'app-view-model',
  templateUrl: './view-model.component.html',
  styleUrls: ['./view-model.component.scss']
})
export class ViewModelComponent implements OnInit {
 // @ViewChild('ViewDetailsTemplate') viewPopup: TemplateRef<any>;
  @Output() loadProgramName = new EventEmitter<string>();
  @Output() cancelButtonClicked = new EventEmitter<string>();
  @Input() popupObject: any;
  modalRef: BsModalRef;
  assetPath: string=environment.assetBasePath;
  programDetails:ProgramDetails[]=[]; 
  selectedProgram:any;
  programItemList: any; 
  tenentId: any;
  itemList: any;
  public resourceMessage: any;
  constructor( public appCommonFunctions: AppCommonFunctions,private itemService: ItemServiceService,private modalService: BsModalService,private _authService: AuthService,private _buyWindowService: BuyWindowService
    ,public dialogRef: MatDialogRef<ViewModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: popupViewData,
    private _programService:ProgramService
    ) {
    //this.loadProgramDetails();
   }

  ngOnInit(): void {
    this.tenentId = this._authService.getUserToken().tenantId;
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.loadProgramDetails();
  }

  closeModel(){
    this.dialogRef.close();
  }
  loadProgramDetails(){
    document.getElementById('loadingSpinnerContaineritem').style.display='block'   
    this._buyWindowService.getBuyWindowProgramsById(this.tenentId,this.data.buywindowID, null, null).subscribe(data=>{      
      this.programDetails=data.result;     
      
      if(this.data.programID != undefined){
        
        this.loadProgramInfo(this.data.programID);
      }
      else{
        this.selectedProgram = data.result[0];
        this.selectedProgram.programID = this.programDetails[0].programID;    
        this.getItemListByProgramId(this.selectedProgram.programID)    
      }

    });
    
  }

  selectProgram(element){
    document.getElementById('loadingSpinnerContaineritem').style.display='block' 
    this.selectedProgram = element;
    this.loadProgramInfo(this.selectedProgram.programID);
  }

  loadProgramInfo(programid){  
    //document.getElementById('loadingSpinnerContaineritem').style.display='block'  
    this._programService.getProgramDetailsById(this.tenentId, programid).subscribe(data=>{
      //this.programDetails=data.result;
      this.selectedProgram=data.result;
      //console.log(this.programDetails)
      this.getItemListByProgramId(data.result.programID)
      //document.getElementById('loadingSpinnerContaineritem').style.display='none'
    });
  }

  getItemListByProgramId(programId) {
  //  document.getElementById('loadingSpinnerContaineritem').style.display='block'
    this.itemService.getItemListByProgramId(this.tenentId, programId).subscribe(data=> {
      this.programItemList = data.result;
      document.getElementById('loadingSpinnerContaineritem').style.display='none'
    })
  }

  isToolTipExists(id) {
    let element = document.getElementById(id);
    if(element && (element.scrollHeight > element.clientHeight)) {
        return  element.id;
    }
    return ''
  }

  isToolTipExistsForDropdownItem(element){
    let result = document.getElementById(element.programID);
    if(result && (result.scrollHeight > result.clientHeight)) {
        return  element.programName;
    }
    return ''
  }

}

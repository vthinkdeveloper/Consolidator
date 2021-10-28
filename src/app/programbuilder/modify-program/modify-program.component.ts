import { Component, OnInit, ViewChild, TemplateRef, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ItemServiceService } from '../services/Item-service/item-service.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from '../../toast-message/toast-message.component'
import { environment } from 'src/environments/environment';
import { AppCommonFunctions, TovalidateNotes } from '../../services/common/app-common';
import { FormBuilder, Validators , FormsModule } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import {FileUploadService} from '../../services/common/file-upload.service'
import { NumbersOnlyInputDirective } from '../../numbers-only-input.directive';
import { ConfirmPopupComponent } from '../../confirm-popup/confirm-popup.component';
import { popupSection } from '../../services/common/app-common';
import { DragDropDirective } from '../drag-and-drop/drag-drop.directive';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

enum LocationType {
  SelectMode = 'select_Mode',
  EditMode = 'edit_Mode',
}

@Component({
  selector: 'app-modify-program',
  templateUrl: './modify-program.component.html',
  styleUrls: ['./modify-program.component.scss']
})



export class ModifyProgramComponent implements OnInit {
  @ViewChild('createElementTemplate') createElementTemplate: TemplateRef<any>;
  @ViewChild('cloneElementTemplate') cloneElementTemplate: TemplateRef<any>;
  @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent ;
  @Output() loadprogramdetails = new EventEmitter<string>();
  @Output() setStep = new EventEmitter<number>();
  @Input() iscopiedprogram:boolean;
  @Input() createdFromProgramId:string;
  modalRef: BsModalRef;
  selectedItem: any;
  isLoading = false;
  tenentId: any;
  itemList: any;
  programItemList: any; 
  programItemListFromCopied:any
  assetPath: string=environment.assetBasePath;
  public resourceMessage: any;
  public files;
  rights;
  deletepath=this.assetPath+"images/delete.svg";
  editpath=this.assetPath+"images/edit.svg";
  readyToUploadFiles: any[] = [];
  createElementForm = this.formBuilder.group({
    itemElement: ['', Validators.required],
    price: ['', Validators.required],
    notes: ['']
  }, { validator: TovalidateNotes("notes") });
  selectMode = LocationType.SelectMode;
  submitButtonClicked = false;
  isCreateNewProgram = false;
  popupDataObject: popupSection;
  deleteItem: any;
  upLoadFileSubscription:Subscription;
  itemSelection = '';
  filteredItemList = [];
  canEditPrice:boolean=false;
  fileName;
  imageNotAvailable;
  isremoveImage:boolean = false;
  enablecreatebutton:boolean=false
  show:boolean=true;
  isAdminCompleteProgram = false;
  isAdminEditScreen = false;

  constructor(private _fileUploadService: FileUploadService,private modalService: BsModalService, private itemService: ItemServiceService, private _authService: AuthService,
    private _snackBar: MatSnackBar, public appCommonFunctions: AppCommonFunctions,private formBuilder: FormBuilder,private router: Router) { }

  ngOnInit(): void {

    this.rights= localStorage.getItem('rights');
    if(this.rights && ((typeof this.rights) === 'string') && this.rights.includes('ConsolidatorProgramBuilderInternalAdmin')){
      this.canEditPrice=true;
    }
    this.imageNotAvailable=this._fileUploadService.imageNotAvailableBase64;
    this.tenentId = this._authService.getUserToken().tenantId;
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.getItemList();
    this.createElementForm.controls['notes'].clearValidators();
    this.createElementForm.controls['notes'].setValidators([]);
    this.createElementForm.controls['notes'].updateValueAndValidity();
    this.upLoadFileSubscription =  this.appCommonFunctions.getUploadSuccessEvent().subscribe((data)=>{
      this.modifyProgramFileChange(data);
      })
    let element = JSON.parse(localStorage.getItem('adminProgramData'));
    if (element) {
      this.getItemListByProgramId('admin');
      this.isAdminEditScreen = true;
    }
    let completeElement = JSON.parse(localStorage.getItem('isAdminCompleteProgram'));
    if (completeElement) {
      this.isAdminCompleteProgram = true;
    }
  }

  getItemList() {
    this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
    this.itemService.getItemList(this.tenentId).subscribe(data=> {
      this.itemList = data.result;
      this.filteredItemList = this.itemList;
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
    }, error => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
    })
  }


  editElementItem(item) {
    if(!this.appCommonFunctions.isMobileCompatibleScreen()){
    this.selectMode = LocationType.EditMode;
    this.selectedItem = item;
    this.itemSelection = this.selectedItem.externalItemID;
    this.createElementForm.controls['itemElement'].setValue(this.selectedItem);
    this.createElementForm.controls['price'].setValue(this.selectedItem.unitPrice.toFixed(2));
    this.createElementForm.controls['notes'].setValue(this.selectedItem.notes);
    this.modalRef = this.modalService.show(this.createElementTemplate, { class: 'modal-lg-size modal-program-size'}); 
    setTimeout(() => {
          //display image right side while modify an element
          if(this.selectedItem.thumbnailImagePath != undefined && this.selectedItem.thumbnailImagePath != ''){
            this.fileName=this.selectedItem.thumbnailImagePath;
            this.isremoveImage=true;
            this._fileUploadService.downloadFile(this.tenentId,this.selectedItem.thumbnailImagePath,"programElement").subscribe(data=>{      
              let imageBinary = data.result;
              document.getElementById('imageuploadEditElement')['src'] = 'data:image/png;base64,' + imageBinary;
              document.getElementById('imageuploadEditElement').style.objectFit = 'cover';
              // const blob = new Blob([imageBinary],{type: imageBinary.type}) ;
              // this.readyToUploadFiles=[];
              // this.readyToUploadFiles.push({
              //   name: localStorage.getItem('programID')+'.png',
              //   fileblob: blob
              // });
            }, error => {
              document.getElementById('imageuploadEditElement')['src'] = this._fileUploadService.imageNotAvailableBase64;
              document.getElementById('imageuploadEditElement').style.objectFit = 'none';
              this.isremoveImage=false;
            }
            );
          }
          else{
            this.isremoveImage=false;
            document.getElementById('imageuploadEditElement')['src'] = this._fileUploadService.imageNotAvailableBase64;
            document.getElementById('imageuploadEditElement').style.objectFit = 'none';
          }
    }, 100);
   } else {
       sessionStorage.setItem('selectedItem', JSON.stringify(item))
       this.router.navigate(['/modify-program-mobile'])
  }
  }

  checkEditModeDisabled() {
    if(this.selectMode ===  LocationType.EditMode) {
      return true;
    } else {
      return false;
    }
  }

  getItemListByProgramId(type?:string) {
    let programId = localStorage.getItem('programID');
    if (document.getElementById('loadingSpinnerContainerprogram')) {
       document.getElementById('loadingSpinnerContainerprogram').style.display='block'
    }
    if(type && type === 'admin') {
      let element = JSON.parse(localStorage.getItem('adminProgramData'));
      if (element) {
        programId = element.programID
     }
    }
    
    this.itemService.getItemListByProgramId(this.tenentId, programId).subscribe(data=> {
      this.programItemList = data.result;      
      this.getItemList();
    })
  }

  getItemListByCopiedProgramId(){    
    if (document.getElementById('loadingSpinnerContainerprogram')) {
       document.getElementById('loadingSpinnerContainerprogram').style.display='block'
    }
    let  programId=this.createdFromProgramId;
    this.itemService.getItemListByProgramId(this.tenentId, programId).subscribe(data=> {
      this.programItemListFromCopied = data.result;
      if (document.getElementById('loadingSpinnerContainerprogram')) {
       document.getElementById('loadingSpinnerContainerprogram').style.display='none'
      }
      //this.getItemList();
    })
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

  create(){
    let checkboxes:any =(<HTMLInputElement[]><any>document.getElementsByName('checkitem'));
    let programItemID=[];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked == true) {
        programItemID.push(checkboxes[i].value);
      }
    }
    let toprogramid=localStorage.getItem('programID')
    this.itemService.CopyItemToProgram(this.tenentId,this.createdFromProgramId,toprogramid,programItemID).subscribe(resut=>{
      this.enablecreatebutton=false;
      this.modalRef.hide();
      this.getItemListByProgramId();
      this.loadprogramdetails.emit('save');
      this.setStep.emit(1);
    })
  }

   /**
   * To open create window template.
   */
  openCreateWindowTemplate(template: TemplateRef<any>) {
    if(!this.appCommonFunctions.isMobileCompatibleScreen()) {
      this.isremoveImage=false;
      this.submitButtonClicked=false;
      this.createElementForm.reset();
      this.itemSelection = '';
      this.selectMode = LocationType.SelectMode;
      this.modalRef = this.modalService.show(this.createElementTemplate, { class: 'modal-lg-size modal-program-size' }); // To show confirm popup.
    } else {
      this.router.navigate(['/modify-program-mobile']);
    }
  }

  closeModel() {
    if(this.modalRef){
      this.modalRef.hide();
      this.selectedItem = null;
      this.createElementForm.reset();
      this.submitButtonClicked=false;
    }
    
  }

  createItem() {
    let programId = localStorage.getItem('programID'); 
    this.submitButtonClicked = true;
    this.createElementForm.controls['notes'].setErrors(null);
    if (!this.createElementForm.valid) {
      return
    }
    if(this.selectMode === LocationType.EditMode) {
      this.editElementItemApiCall()
      return
    }

    // Prepare FormData
  
    const formDataObject = this. prepareFormData();
   
    let createItemRequest = {
     notes: this.createElementForm.controls['notes'].value,
     createdBy:this.selectedItem.createdBy,
     itemId:this.selectedItem.itemId,
     UnitPrice: this.createElementForm.controls['price'].value,
    }

    if(formDataObject && formDataObject['fileName']){
      createItemRequest['thumbnailImagePath'] = formDataObject['fileName']
     }

    this.isLoading = true;
    this.itemService.createItem(this.tenentId, programId,createItemRequest).subscribe(cardValue => {
      this.isLoading = false;
      if(this.readyToUploadFiles && this.readyToUploadFiles.length) {
       //call API to upload image
       this._fileUploadService.upload(this.tenentId,formDataObject['formData'], 'programElement').subscribe(
        successResponse => {
          this.readyToUploadFiles = [];
      });
      }
      else{
        this.readyToUploadFiles = [];
      }
      this.submitButtonClicked = false;
      let msg= this.resourceMessage && this.resourceMessage['ItemSuccessMessage'];   
      this.closeModel();   
      
      this.getItemListByProgramId()
      this.openSnackBar('',msg, 'success');
      this.loadprogramdetails.emit('save');
      this.setStep.emit(1);
    }, err => {
      this.isLoading = false;
      this.openSnackBar('',err.error, 'error');
      this.submitButtonClicked = false;
      this.closeModel();
    });
  }


  prepareFormData() {
     // Prepare FormData
     
     const formData = new FormData();
     let obj = {};
     if (this.readyToUploadFiles && this.readyToUploadFiles.length && this.readyToUploadFiles[0].fileblob) {
       const fileNameValue = this.readyToUploadFiles[0].name.split('.');
      
       for (let i = 0; i < fileNameValue.length - 1; i++) {
         this.fileName = fileNameValue[i];
       }
       this.fileName=this.fileName + '_' + uuid() + '.' + fileNameValue[fileNameValue.length - 1]
       formData.append('uploads', this.readyToUploadFiles[0].fileblob, this.fileName); 
       obj['formData'] = formData;
       obj['fileName'] = this.fileName;
     }
      return obj
  }

  filterItemList(item) {
    let value = item.currentTarget.value
    if (value === ''){
      return;
  }
   // It will be called only when numbers,text,backspace or space button typed.
    this.itemSelection = value;
    this.createElementForm.controls['itemElement'].setValue(null);
    if(this.itemSelection === '') {
     this.filteredItemList = this.itemList;
    } else {
      this.filteredItemList = this.filterItemsBySearchKey(this.itemSelection);
    }
  }

  filterItemsBySearchKey(searchText) {
    this.filteredItemList = this.itemList;
    searchText = searchText.toLowerCase();
    return this.filteredItemList.filter(it => {
        return (it.externalItemID && it.externalItemID.toLowerCase().includes(searchText)) ||
            (it.longDescription && it.shortDescription.toLowerCase().includes(searchText)) ||
            (it.categorydescription && it.categorydescription.toLowerCase().includes(searchText)) || 
            (it.unitPrice && it.unitPrice.toString().includes(searchText)) 
    });
  }


  editElementItemApiCall() {
    let programId = localStorage.getItem('programID'); 
    const formDataObject = this. prepareFormData();
    let editItemRequest = {
      notes: this.createElementForm.controls['notes'].value,
      createdBy:this.selectedItem.createdBy,
      programItemId:this.selectedItem.programItemId,
      unitPrice: this.createElementForm.controls['price'].value,
      itemId: this.selectedItem.itemId
     }

     if(formDataObject && formDataObject['fileName'] && this.readyToUploadFiles.length){
      editItemRequest['thumbnailImagePath'] = formDataObject['fileName'];
     }
     else{
      editItemRequest['thumbnailImagePath'] = this.fileName;
     }
     this.isLoading = true;
     this.itemService.editItem(this.tenentId, programId, editItemRequest).subscribe(elementResponse => {
       this.isLoading = false;
       if(this.readyToUploadFiles && this.readyToUploadFiles.length) {
        //call API to upload image
        this._fileUploadService.upload(this.tenentId,formDataObject['formData'], 'programElement').subscribe(
         successResponse => {
           this.readyToUploadFiles = [];
       });
       }
       else{
        this.readyToUploadFiles = [];
       }
       this.submitButtonClicked = false;
       let rms= this.resourceMessage && this.resourceMessage['ItemEditSuccessMessaage'];
       let msg= '<b>'+ this.selectedItem.externalItemID + '</b> <br> ' + rms; 
       this.openSnackBar(this.selectedItem.externalItemID,rms, 'success');
       this.closeModel();
       this.getItemListByProgramId()
       this.loadprogramdetails.emit('edit');
       this.setStep.emit(1);
     }, err => {
      this.openSnackBar('',err.error, 'error');
       this.isLoading = false;
       this.submitButtonClicked = false;
       this.closeModel();
     });
  }

  openDeletePopup(program:any) {
    this.deleteItem = program;
    this.popupDataObject = new popupSection();
    this.popupDataObject.selectedItem = program.externalItemID;
    this.popupDataObject.type = 'item'
    let element = JSON.parse(localStorage.getItem('adminProgramData'));
    let completeElement = JSON.parse(localStorage.getItem('isAdminCompleteProgram'));
    if(element || completeElement) {
      this.popupDataObject.isAdminScreen = true;
      this.popupDataObject.title = this.resourceMessage && this.resourceMessage['thisitemwillreomoved'];
      this.popupDataObject.type = this.resourceMessage && this.resourceMessage['confirmationmessage'];
    } else {
      this.popupDataObject.isAdminScreen = false;
      this.popupDataObject.title = this.resourceMessage && this.resourceMessage['Deletelbl'];
    }
    this.popupDataObject.okButtonTitle = this.resourceMessage && this.resourceMessage['Deletebtn'];
    this.popupDataObject.cancelButtonTile = this.resourceMessage && this.resourceMessage['ArchiveCancel'];;
    this.confirmPopup.openPopup();
  }

  cancelDelete() {
    this.deleteItem = null;
    this.confirmPopup.cancelClicked();
  }

  deleteElementItem() {
    let programId = localStorage.getItem('programID'); 
    let deleteItemRequest = {
      deletedBy: this.deleteItem.createdBy,
      programItemId: this.deleteItem.programItemId,
      itemId: this.deleteItem.itemId
     }
     this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
     this.itemService.editItem(this.tenentId, programId,deleteItemRequest).subscribe(elementResponse => {
      let rms= this.resourceMessage && this.resourceMessage['DeleteElementMsg'];
      let msg= '<b>'+ this.deleteItem.externalItemID + '</b> <br> ' + rms; 
      this.getItemListByProgramId()
      this.getItemList();
      this.loadprogramdetails.emit('delete');
      this.setStep.emit(1);
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      this.openSnackBar(this.deleteItem.externalItemID,rms, 'success');
      this.cancelDelete();
    }, err => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      this.openSnackBar('',err.error, 'error');
    });
  }

  modifyProgramFileChange(pFileList){
    this.isremoveImage=true;
    let file = pFileList[0];
    let iscorrectformat=this.validateimageformat(file)
    if(iscorrectformat){
      this.applyFileInImageView(file);
      document.getElementById('invalidformt').innerHTML="";
    }
    else{
      let msg=  this.resourceMessage['ImageFileFormatWarning'];
      document.getElementById('invalidformt').innerHTML=msg;
    } 
  }

  validateimageformat(file){
    let valToLower = file.name.toLowerCase();
    let regex = new RegExp("(.*?)\.(jpg|png|jpeg|gif)$"); //add or remove required extensions here
   let regexTest = regex.test(valToLower);
    return !regexTest ?  false  : true;
  }

  handleDrop(files) {
    this.isremoveImage=true;
    document.getElementById('invalidformt').innerHTML="";
    for (let i = 0; i < files.length; i++) {
      this.applyFileInImageView(files[i]);
    }
  }

  showerrormessage(value){
    let msg;
    if(value==0){
      msg=  this.resourceMessage['ImageFileFormatWarning'];
    }
    else{
      msg=  this.resourceMessage['MultiplefileError'];
    }    
    document.getElementById('invalidformt').innerHTML=msg;
  }

  applyFileInImageView(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.files = reader.result;
      document.getElementById('imageuploadEditElement')['src'] = this.files; 
      document.getElementById('imageuploadEditElement').style.objectFit = 'cover';
    };
    const blob = new Blob([file],{type: file.type}) ;
    this.readyToUploadFiles.push({
      name: file.name,
      fileblob: blob
    });
  }

  selectElementItem(element){
    let programItemId = this.checkEditModeDisabled() ? this.selectedItem.programItemId : '';
    this.selectedItem = element;
    if(programItemId) {
      this.selectedItem.programItemId = programItemId;
    }
    this.itemSelection = element.externalItemID;
    this.filteredItemList = this.itemList;
    this.createElementForm.controls['itemElement'].setValue(this.selectedItem);
    this.createElementForm.controls['price'].setValue(this.selectedItem.unitPrice.toFixed(2));
    this.createElementForm.controls['notes'].setValue(this.selectedItem.notes);
    this.createElementForm.controls['notes'].setErrors(null);
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

  removeitemImage(event){
    event.preventDefault();
    this.readyToUploadFiles=[];
    this.fileName='';
    document.getElementById('imageuploadEditElement')['src'] = this._fileUploadService.imageNotAvailableBase64;
    this.isremoveImage=false;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.upLoadFileSubscription.unsubscribe();
  }
  openCloneWindowTemplate(template: TemplateRef<any>){
    if(!this.appCommonFunctions.isMobileCompatibleScreen()) {
      this.isremoveImage=false;
      this.enablecreatebutton=false;
      this.createElementForm.reset();
      this.itemSelection = '';
      this.selectMode = LocationType.SelectMode;
      this.modalRef = this.modalService.show(this.cloneElementTemplate, { class: 'modal-lg-size modal-program-size' }); // To show confirm popup.
      this.getItemListByCopiedProgramId();
    } else {
      sessionStorage.setItem('createdFromProgramId', JSON.stringify(this.createdFromProgramId));
      this.router.navigate(['/copy-existing-item']);
    }
 
  }

  isToolTipExists(id) {
    let element = document.getElementById(id.externalItemID);
    if(element && (element.scrollHeight > element.clientHeight)) {
        return  id.notes;
    }
    return ''
  }
}

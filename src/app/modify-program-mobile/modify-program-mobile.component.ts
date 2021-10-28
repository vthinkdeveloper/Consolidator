import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppCommonFunctions , TovalidateNotes } from '../services/common/app-common';
import { FormBuilder, Validators , FormsModule } from '@angular/forms';
import { ItemServiceService } from '../programbuilder/services/Item-service/item-service.service';
import { AuthService } from '../services/auth.service';
import {FileUploadService} from '../services/common/file-upload.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { v4 as uuid } from 'uuid';
import { Router,  ActivatedRoute, ParamMap } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';
import { switchMap } from 'rxjs/operators';
import { DragDropDirective } from '../programbuilder/drag-and-drop/drag-drop.directive';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';

enum LocationType {
  SelectMode = 'select_Mode',
  EditMode = 'edit_Mode',
}

@Component({
  selector: 'app-modify-program-mobile',
  templateUrl: './modify-program-mobile.component.html',
  styleUrls: ['./modify-program-mobile.component.scss']
})

export class ModifyProgramMobileComponent implements OnInit ,OnDestroy {
  selectMode = LocationType.SelectMode;
  selectedItem: any;
  assetPath: string=environment.assetBasePath;
  public resourceMessage: any;
  step = 0;
  rights;
  isCreateNewProgram = false;
  itemList: any;
  itemSelection = '';
  imageNotAvailable;
  createElementForm = this.formBuilder.group({
    itemElement: ['', Validators.required],
    price: ['', Validators.required],
    notes: ['']
  }, { validator: TovalidateNotes("notes") });
  filteredItemList = [];
  submitButtonClicked = false;
  readyToUploadFiles: any[] = [];
  fileName;
  isLoading = false;
  tenentId: any;
  isremoveImage:boolean = false;
  public files;
  canEditPrice:boolean=false;
  upLoadFileSubscription:Subscription;
  buywindowname = '';
  buywindowdata;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(public appCommonFunctions: AppCommonFunctions,private formBuilder: FormBuilder,private itemService: ItemServiceService,private _authService: AuthService,
    private _fileUploadService: FileUploadService,private _snackBar: MatSnackBar,private router: Router,private route: ActivatedRoute,private _location: Location) { }

  ngOnInit(): void {
   let value = sessionStorage.getItem('selectedItem');

    this.rights= localStorage.getItem('rights');
    if(this.rights && ((typeof this.rights) === 'string') && this.rights.includes('ConsolidatorProgramBuilderInternalAdmin')){
      this.canEditPrice=true;
    }
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    if(value) {
      this.selectedItem = JSON.parse(value);
      this.selectMode = LocationType.EditMode;
      this.editElementItem()
    } else {
      this.selectMode = LocationType.SelectMode;
    }

    this.buywindowdata = JSON.parse(localStorage.getItem('buywindowData'));
    this.buywindowname = this.buywindowdata.buyWindowName ? this.buywindowdata.buyWindowName : this.buywindowdata.buywindowName;

    this.tenentId = this._authService.getUserToken().tenantId;
    this.getItemList()
    this.createElementForm.controls['notes'].clearValidators();
    this.createElementForm.controls['notes'].setValidators([]);
    this.createElementForm.controls['notes'].updateValueAndValidity();
    this.imageNotAvailable=this._fileUploadService.imageNotAvailableBase64;
    this.upLoadFileSubscription =  this.appCommonFunctions.getUploadSuccessEvent().subscribe((data)=>{
      this.modifyProgramFileChange(data);
      })
  }

  checkEditModeDisabled() {
    if(this.selectMode ===  LocationType.EditMode) {
      return true;
    } else {
      return false;
    }
  }

  setStep(index: number) {
    this.step = index;
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
    this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
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
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      let msg= this.resourceMessage && this.resourceMessage['ItemSuccessMessage'];   
      this.closeModel();   
    }, err => {
      this.isLoading = false;
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      this.openSnackBar('',err.error, 'error');
      this.submitButtonClicked = false;
    });
  }

  editElementItem() {
    this.createElementForm.controls['itemElement'].setValue(this.selectedItem);
    this.itemSelection = this.selectedItem.externalItemID;
    this.createElementForm.controls['price'].setValue(this.selectedItem.unitPrice.toFixed(2));
    this.createElementForm.controls['notes'].setValue(this.selectedItem.notes);
    setTimeout(() => {
    if(this.selectedItem.thumbnailImagePath != undefined && this.selectedItem.thumbnailImagePath != ''){
      this.fileName=this.selectedItem.thumbnailImagePath;
      this.isremoveImage=true;
      
      this._fileUploadService.downloadFile(this.tenentId,this.selectedItem.thumbnailImagePath,"programElement").subscribe(data=>{      
        let imageBinary = data.result;
        this.isremoveImage=true;
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
        document.getElementById('imageuploadEditElement').style.objectFit = 'cover';
        this.isremoveImage=false;
      }
      );
    }
    else{
      this.isremoveImage=false;
      if(document.getElementById('imageuploadEditElement')) {
        document.getElementById('imageuploadEditElement')['src'] = this._fileUploadService.imageNotAvailableBase64;
        document.getElementById('imageuploadEditElement').style.objectFit = 'none';
      }
    }
  }, 100);
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
   this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
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
     this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
     let rms= this.resourceMessage && this.resourceMessage['ItemEditSuccessMessaage'];
     let msg= '<b>'+ this.selectedItem.externalItemID + '</b> <br> ' + rms; 
     this.openSnackBar(this.selectedItem.externalItemID,rms, 'success');
     this.closeModel();
   }, err => {
    this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
    this.openSnackBar('',err.error, 'error');
     this.isLoading = false;
     this.submitButtonClicked = false;
     this.closeModel();
   });
}

closeModel() {
  sessionStorage.removeItem('selectedItem');
  sessionStorage.setItem('isFromModifyMobile', JSON.stringify(true));
  this._location.back();
}

ngOnDestroy(): void {
  sessionStorage.removeItem('selectedItem');
  // unsubscribe to ensure no memory leaks
  this.upLoadFileSubscription.unsubscribe();
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

}

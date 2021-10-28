import { Component, OnInit, ViewChild, TemplateRef, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppComponent } from '../../app.component';
import { AppCommonFunctions } from '../../services/common/app-common';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { MatAccordion } from '@angular/material/expansion';
import { FormBuilder, Validators, FormsModule } from '@angular/forms';
import { CompareStartEndDates, CannotContainOnlySpace } from '../../services/common/app-common';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import { ProgramService } from '../services/program.service';
import { Subscription } from 'rxjs';
import { ToastMessageComponent } from '../../toast-message/toast-message.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuyWindowService } from '../../buybuilder/services/buy-window.service'
import { ProgramDetails } from '../_models/program'
import { ConfirmPopupComponent } from '../../confirm-popup/confirm-popup.component';
import { popupSection } from '../../services/common/app-common';
import { DatePipe } from '@angular/common';
import { v4 as uuid } from 'uuid';
import { ItemServiceService } from '../services/Item-service/item-service.service';
import { FileUploadService } from '../../services/common/file-upload.service'
import { ModifyProgramComponent } from '../modify-program/modify-program.component';
import { Router } from '@angular/router';
import { AdminDashboardService } from  '../../assign-users/services/admin-dashboard.service';
import { FormioService } from '../../services/formio/formio.service';
import { FormioComponent } from '@formio/angular';

declare var $: any
@Component({
  selector: 'app-create-program',
  templateUrl: './create-program.component.html',
  styleUrls: ['./create-program.component.scss']
})
export class CreateProgramComponent implements OnInit, OnDestroy {
  createBuyWindowSubscription: Subscription;
  fileUploadSubscription: Subscription;
  @ViewChild('createElementTemplate') createElementTemplate: TemplateRef<any>;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  buywindowname: string;
  modalRef: BsModalRef;
  public resourceMessage: any;
  assetPath: string = environment.assetBasePath;
  htmlContent = '';
  popupDataObject: popupSection;
  programDetails: ProgramDetails[] = [];
  prgramDetails: ProgramDetails;
  Elementdisabled: boolean = false;
  canPublish: boolean = false;
  readyToUploadFiles: any[] = [];
  selectedItem: any;
  isLoading = false;
  createdFromProgramId: string = '';
  creteFromProgrmIdtoModifyProgram: string = '';
  ispgmselected: boolean = false;
  iscopiedprogram: boolean = false;
  isAdminCreatePage = false;
  submission: any;
  
  config: AngularEditorConfig = {
    editable: true,

    spellcheck: true,
    height: '115px',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['Superscript'],
      ['Subscript'],
      ['indent'],
      ['insertUnorderedList'],
      ['insertOrderedList'],
      ['outdent'],
      ['strikeThrough']
    ],
    toolbarPosition: 'top',
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]

  };
  fileName;
  submitButtonClicked = false;
  dateCustomClasses: DatepickerDateCustomClasses[];
  minDate: Date;
  maxDate: Date;
  maxEndDate: Date;
  isCopyProgramSelected = false;
  createProgramForm = this.formBuilder.group({
    Programname: ['', Validators.required, CannotContainOnlySpace()],
    programDescription: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  }, { validator: CompareStartEndDates("startDate", "endDate") });

  public files;
  IsremoveImage: boolean = false;
  @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;
  @ViewChild('modifyProgramComponent', { static: false }) modifyProgramComponent: ModifyProgramComponent;
  @ViewChild(FormioComponent, { static: false }) form: FormioComponent;
  deleteProgram: any;
  cloningProgram: any;
  ProgramName: string = '';
  sDate: Date;
  EndDate: Date;
  tenentId: any;
  itemList: any;
  isOpen: boolean = true;
  panelOpenState = false;
  hierarchyLocation = [];
  imageUrl;
  deletepath = this.assetPath + "images/delete.svg";
  clonepath = this.assetPath + "images/copynotselect.svg";
  createpath = this.assetPath + "images/createprg.svg"
  deleteselectpath = this.assetPath + "images/deleteselected.svg";
  cloneselectpath = this.assetPath + "images/cloneselected.svg";
  rights: any;
  canDelete: boolean = false;
  canClone: boolean = false;
  canCopyProgram: boolean = false;
  canPublishUsingrole: boolean = false;
  isCreateNewProgram = true;
  buywindowdata;
  step = 0;
  imageNotavailable
  isAdminCompleteProgram = false;
  formDefinition: any;
  refreshForm:any;

  constructor(private router: Router, public datepipe: DatePipe, private _fileUploadService: FileUploadService, private _buyWindowService: BuyWindowService, private _snackBar: MatSnackBar, private appComponent: AppComponent,
    public appCommonFunctions: AppCommonFunctions, private _authService: AuthService, private formBuilder: FormBuilder, private _programService: ProgramService, private itemService: ItemServiceService,
    private modalService: BsModalService, public adminService: AdminDashboardService,public formioService: FormioService) { 
      let modifyItem = sessionStorage.getItem('isFromModifyMobile')
      if (modifyItem) {
        this.setStep(1);
      }
    }

  ngOnInit(): void {
    this.refreshForm = new EventEmitter();
    this.submission = {data: {}};
    let modifyItem = sessionStorage.getItem('isFromModifyMobile')
    if (modifyItem) {
      this.setStep(1);
    }
    let element = JSON.parse(localStorage.getItem('adminProgramData'));
    if (element) {
      this.isAdminCreatePage = true;
    }
    this.getFormioService().then(() => {
      let completeElement = JSON.parse(localStorage.getItem('isAdminCompleteProgram'));
    if (completeElement) {
      this.isAdminCompleteProgram = true;
    }

    if(this.isAdminCompleteProgram) {
      this.createProgramForm.controls['Programname'].disable();
      this.createProgramForm.controls['programDescription'].disable();
      this.createProgramForm.controls['startDate'].disable();
      this.createProgramForm.controls['endDate'].disable()
      this.config.editable = false;
    }

    this.buywindowdata = JSON.parse(localStorage.getItem('buywindowData'));
    this.maxEndDate = new Date(this.datepipe.transform(this.buywindowdata.endDate, 'MM/dd/yyyy'));
    // this.datepipe.transform(data.result.startDate, 'MM/dd/yyyy')
    this.tenentId = this._authService.getUserToken().tenantId;
    var ToDate = new Date();
    this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
    if (new Date(this.minDate).getTime() <= ToDate.getTime()) {
      this.minDate = new Date();
      //alert("The Date must be Bigger or Equal to today date");
    }

    this.maxDate = new Date(this.datepipe.transform(this.buywindowdata.endDate, 'MM/dd/yyyy'));//new Date(this.minDate.getFullYear() + 25 + "-" + 12 + "-" + 31);

    this.buywindowname = this.buywindowdata.buywindowName;//localStorage.getItem('buywindowname')

    //console.log(this.buywindowdata.endDate);
    this.dateCustomClasses = this.appCommonFunctions.applyWeekEndCustomColor();
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.rights = localStorage.getItem('rights');
    if(this.rights && ((typeof this.rights) === 'string')) {
      this.rights = this.rights.split(',')
      if (this.rights && (this.rights instanceof Array) && (this.rights.includes('ConsolidatorProgramBuilderInternalAdmin') || this.rights.includes('ConsolidatorProgramBuilderAdmin'))) {
        this.canDelete = true;
      }
      if (this.rights && (this.rights instanceof Array) && (this.rights.includes('ConsolidatorProgramBuilderInternalAdmin') || this.rights.includes('ConsolidatorProgramBuilderAdmin') || this.rights.includes('ConsolidatorProgramBuilder'))) {
        this.canClone = true;
      }
      if (this.rights && (this.rights instanceof Array) && this.rights.includes('ConsolidatorProgramBuilderCreator')) {
        this.canPublishUsingrole = true;
      }
      if (this.rights && (this.rights instanceof Array) && (this.rights.includes('ConsolidatorProgramBuilderInternalAdmin') || this.rights.includes('ConsolidatorProgramBuilderAdmin') ||
        this.rights.includes('ConsolidatorProgramBuilder'))) {
        this.canCopyProgram = true;
      }
    }
    localStorage.setItem('programID', null);
    localStorage.setItem('programIndex', null);
    this.imageNotavailable = this._fileUploadService.imageNotAvailableBase64;

    if (element) {
      this.adminProgramEdit(element)
      let hierarchyLevel = JSON.parse(
        sessionStorage.getItem('ConsolidatorConfig')
      )['hierarchyLevel'];
      let programId = element.programID ? element.programID : element.ProgramID;
      this.adminService
        .getHierarchyForProgram(this.tenentId, programId, hierarchyLevel)
        .subscribe(
          (data) => {
              this.hierarchyLocation = data.result;
            },
            (err) => {
              this.hierarchyLocation = [];
            }
        );
    } else {
      this.loadProgramDetails();
    }
    });
    
  }

   /**
  * To Triggered when there is some changes on formio.
  * @param formObject formio change component
  */
 onChange(formObject) {
  this.appCommonFunctions.setTooltipOnFormIo();
 }

  getFormioService() {
    this.formDefinition = {}
    return new Promise((resolve, reject) => {
    this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
    let formIoKey = JSON.parse(sessionStorage.getItem('ConsolidatorConfig')) &&  JSON.parse(sessionStorage.getItem('ConsolidatorConfig'))['formKeys']
    if(!formIoKey || !formIoKey["programAttributes"]) {
      resolve(true);
      return
    }
    this.formioService.getFormDefinition(formIoKey["programAttributes"]).subscribe(response => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      this.formDefinition = JSON.parse(JSON.stringify(response));
      resolve(true);
    }, (err) => {
      this.formDefinition = {}
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      resolve(true);
    })
  })
}

  adminProgramEdit(element) {
    this.createdFromProgramId = '';
    this.minDate = null;
    let tenentId = this._authService.getUserToken().tenantId
    localStorage.setItem('programID', element.programID)
    localStorage.setItem('programIndex', element.programIndex);
   
    if (this.buywindowdata) {
      this.buywindowdata.programID = element.programID;
      this.buywindowdata.programIndex = 1;
      // let buywindowdata = {
      //   buywindowName: this.buywindowdata.buywindowName,
      //   buywindowId: this.buywindowdata.buywindowId,
      //   endDate: this.buywindowdata.endDate,
      //   programID: this.buywindowdata.programID,
      //   programIndex: this.buywindowdata.programIndex,
      //   startDate: this.buywindowdata.startDate
      // }
      localStorage.setItem('buywindowData', JSON.stringify(this.buywindowdata));
    }
    this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
    this._programService.getProgramDetailsById(tenentId, this.buywindowdata.programID).subscribe(data => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      let startDate = new Date(this.datepipe.transform(data.result.startDate, 'MM/dd/yyyy'));
      let endDate = new Date(this.datepipe.transform(data.result.endDate, 'MM/dd/yyyy'));
      // this.minDate = startDate;
      this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
      if(this.minDate.getTime() < (new Date()).getTime()) {
        this.minDate =  new Date()
      } else if(this.minDate.getDate() > (new Date()).getTime()) {
        this.minDate =  new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
      } else {
        this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
      }

      this.Elementdisabled = true;


      this.ProgramName = data.result.programName;
      this.htmlContent = data.result.programDescription;

      if (data.result.createdFromProgramId) {
        this.iscopiedprogram = true;
        this.creteFromProgrmIdtoModifyProgram = data.result.createdFromProgramId
      }
      else {
        this.iscopiedprogram = false;
        this.creteFromProgrmIdtoModifyProgram = ''
      }


      this.sDate = startDate;
      this.EndDate = endDate;
      this.createProgramForm.controls['startDate'].setValue(this.sDate);
      this.createProgramForm.controls['startDate'].setErrors(null);
      this.createProgramForm.controls['endDate'].setValue(this.EndDate);
      this.createProgramForm.controls['endDate'].setErrors(null);
      this.createProgramForm.controls['Programname'].setValue(data.result.programName);
      this.createProgramForm.controls['programDescription'].setValue(this.htmlContent);

      if (data.result.programAttributes) {
        let programAttribute = JSON.parse(data.result.programAttributes);
        this.submission = {data: {}};
        if(this.form && this.form.formio && this.form.formio.submission && this.form.formio.submission.data) {
          let keys = Object.keys(this.form.formio.submission.data);
          keys.forEach((key, index) => {
            let programAtrributeKeys = Object.keys(programAttribute);
            programAtrributeKeys.forEach((keyValue, index) => {
              if (key === keyValue) {
                this.submission.data[key] = programAttribute[keyValue];
              }
            });
          });
          this.submission.data =  this.appCommonFunctions.getPersistentData(this.submission.data, this.formDefinition.components);
        }
        this.refreshForm.emit({
          form: this.formDefinition
        });
        this.appCommonFunctions.setTooltipOnFormIo();
      } else {
        this.submission = {data: {}};
        this.refreshForm.emit({
          form: this.formDefinition
        });
        this.appCommonFunctions.setTooltipOnFormIo();
    }
     
      //display image right side while modify an element
      if (data.result.thumbnailImagePath != undefined && data.result.thumbnailImagePath != "") {
        let imagename = data.result.thumbnailImagePath;
        this._fileUploadService.downloadFile(tenentId, data.result.thumbnailImagePath, "program").subscribe(data => {
          this.IsremoveImage = true;
          let imageBinary = data.result;
          setTimeout(() => {
            if(document.getElementById('image')) {
              document.getElementById('image')['src'] = 'data:image/png;base64,' + imageBinary;
             }
          }, 300)
          this.fileName = imagename;
        }, error => {
          this.IsremoveImage = false;
          if(document.getElementById('image')) {
           document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
          }
        }
        );
      }
      else {
        this.IsremoveImage = false;
        if(document.getElementById('image')) {
          document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
        }
      }
    }, (err) => {
      this.minDate = new Date();
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      this.openSnackBar('', err.error, 'error');
    });
   if(this.modifyProgramComponent) {
    this.modifyProgramComponent.getItemListByProgramId();
   }
  }

  tabSelection(isCopyProgramTab) {
    this.iscopiedprogram = false;
    this.creteFromProgrmIdtoModifyProgram = ''
    this.IsremoveImage = false;
    this.readyToUploadFiles = [];
    if (this.buywindowdata.programID != undefined) {

      this.buywindowdata.programID = null;
      this.buywindowdata.programIndex = null;
      // }
    }
    let buywindowdata = {
      buywindowName: this.buywindowdata.buywindowName,
      buywindowId: this.buywindowdata.buywindowId ? this.buywindowdata.buywindowId : this.buywindowdata.buyWindowId,
      endDate: this.buywindowdata.endDate,
      programID: this.buywindowdata.programID,
      programIndex: this.buywindowdata.programIndex,
      startDate: this.buywindowdata.startDate
    }

    localStorage.setItem('buywindowData', JSON.stringify(buywindowdata));


    var ToDate = new Date();
    this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
    if (new Date(this.minDate).getTime() <= ToDate.getTime()) {
      this.minDate = new Date();
      //alert("The Date must be Bigger or Equal to today date");
    }

    this.isCopyProgramSelected = isCopyProgramTab;
    this.createProgramForm.reset();
    localStorage.setItem('programID', null);
    localStorage.setItem('programIndex', null);
    this.htmlContent = '';
    this.fileName = '';
    if (document.getElementById('image')) {
      document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
    }
    let prgcard = document.getElementsByClassName('program-card');
    if (prgcard != null) {
      for (let j = 0; j < prgcard.length; j++) {
       if(prgcard[j]) {
        prgcard[j].classList.remove('selectedclass');
        prgcard[j].classList.add('notselectedclass');
       }
      }
    }

    let prgnameall = document.getElementsByClassName('program-name');
    if (prgnameall != null) {
      for (let j = 0; j < prgnameall.length; j++) {
        let pgnmaclass = <HTMLElement>document.getElementsByClassName('program-name')[j];
        if(pgnmaclass) {
          pgnmaclass.classList.remove('selectpgmname');
          pgnmaclass.classList.add('notselectpgmname')
        }
      }
    }

    let deleteimgall = document.getElementsByClassName("deleteimg");
    if (deleteimgall != null) {
      for (let j = 0; j < deleteimgall.length; j++) {
        let srcdelete = <HTMLImageElement>document.getElementsByClassName("deleteimg")[j]
        if (srcdelete != null)
          srcdelete.src = this.deletepath;
      }

      let deleteimg = document.getElementById("deleteimg") as HTMLImageElement;
      if (deleteimg != null)
        deleteimg.src = this.deleteselectpath;
    }


    this.checkItemDisabled()
    // this.step = 1;
    // this.setStep(1)

    // setTimeout(() => {
    //   // this.step = 0;
    //   // this.setStep(0)
    // }, 100);
  }

  getItemList() {
    this.itemService.getItemList(this.tenentId).subscribe(data => {
      this.itemList = data.result;
    })
  }

  refreshFormio() {
    this.submission = {data: {}};
    this.refreshForm.emit({
      form: this.formDefinition
    });
  }

  loadProgramDetails(type?: string) {
    this.appCommonFunctions.showLoader('loadingSpinnerContainerprogram');
    let tenentId = this._authService.getUserToken().tenantId;
    let buyWindowId = this.buywindowdata.buywindowId ?  this.buywindowdata.buywindowId : this.buywindowdata.buyWindowId;
    this.buywindowdata.buywindowId = buyWindowId;
    this._buyWindowService.getBuyWindowProgramsById(tenentId, this.buywindowdata.buywindowId, null, null).subscribe(data => {
      this.programDetails = data.result;
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
      //console.log(this.programDetails);
      if (this.programDetails.length == 0) {
        this.isLoading = false;
        this.submitButtonClicked = false;
        this.tabSelection(false)
        // this.createProgramForm.reset();
        // this.htmlContent='';
        this.canPublish = false;
        // document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
      }

      if (type == "save" || type == "clone") {
        let d = this.programDetails.length - 1;
        localStorage.setItem('programIndex', d.toString())

        if (this.buywindowdata && type == "clone") {
          this.buywindowdata.programID = localStorage.getItem("ProgramID");
          this.buywindowdata.programIndex = localStorage.getItem("programIndex");
          let buywindowdata = {
            buywindowName: this.buywindowdata.buywindowName,
            buywindowId: this.buywindowdata.buywindowId ? this.buywindowdata.buywindowId : this.buywindowdata.buyWindowId,
            endDate: this.buywindowdata.endDate,
            programID: this.buywindowdata.programID,
            programIndex: this.buywindowdata.programIndex,
            startDate: this.buywindowdata.startDate
          }

        }

      }
      this.programDetails.forEach(programDataValue => {
        if (programDataValue.canPublish) {
          this.canPublish = true
        }
        else {
          this.canPublish = false
        }
      })
      if (this.buywindowdata.programID != undefined || (localStorage.getItem('programID') != "null" && localStorage.getItem('programID') != null && localStorage.getItem('programID') != undefined)) {
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerprogram');
        this.getProgramDetails(this.buywindowdata.programID == undefined ? localStorage.getItem('programID') : this.buywindowdata.programID, this.buywindowdata.programIndex == undefined ? localStorage.getItem('programIndex') : this.buywindowdata.programIndex, type);
      }
    });

  }

  /**
   * To open create window template.
   */
  openCreateWindowTemplate(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(this.createElementTemplate, { class: 'modal-lg-size modal-terms-size' }); // To show confirm popup.
  }



  submitForm() {
    this.submitButtonClicked = true;
    if(this.formDefinition && this.formDefinition !== {} && Object.keys(this.formDefinition).length > 0) {
      this.form.formio.emit('submitButton');
      let value = {};
      setTimeout(() => {
        if(this.form.formio.checkValidity()) {
          let keys = Object.keys(this.form.formio.submission.data);
          keys.forEach((key, index) => {
            if(this.form.formio.submission.data[key] != ''){
              value[key] = this.form.formio.submission.data[key];
             } 
          });
          this.submission.data =  this.appCommonFunctions.getPersistentData(this.submission.data, this.formDefinition.components);
          if(Object.keys(value).length) {
            this.callSubmitFunction(this.submission.data);
          } else {
            this.callSubmitFunction();
          }
        } else {
          this.submitButtonClicked = true;
        }
      }, 200);
    } else {
      this.callSubmitFunction();
    }
  }

  callSubmitFunction(programAttributes?) {
    // Prepare FormData
    if (!this.createProgramForm.valid) {
        return
      }
    const formData = new FormData();
    if (this.readyToUploadFiles[0] != undefined) {
      this.fileName = '';
      if (this.readyToUploadFiles[0].fileblob) {
        const fileNameValue = this.readyToUploadFiles[0].name.split('.');
        for (let i = 0; i < fileNameValue.length - 1; i++) {
          this.fileName += fileNameValue[i];
        }
        this.fileName = this.fileName + '_' + uuid() + '.' + fileNameValue[fileNameValue.length - 1]
        formData.append('uploads', this.readyToUploadFiles[0].fileblob, this.fileName);
      }
    }
    document.getElementById('loadingSpinnerContainerprogram').style.display = 'block'
    let tenentId = this._authService.getUserToken().tenantId
    let createProgramRequest = {
      startDate: this.convertDateToISO(this.createProgramForm.controls['startDate'].value),
      endDate: this.convertDateToISO(this.createProgramForm.controls['endDate'].value),
      programName: this.createProgramForm.controls['Programname'].value,
      programDescription: this.htmlContent,
      buyWindowId: this.buywindowdata.buywindowId ? this.buywindowdata.buywindowId : this.buywindowdata.buyWindowId,
      createdBy: this._authService.getUserToken().userName,
      thumbnailImagePath: this.fileName
    }
    if (programAttributes) {
      createProgramRequest['programAttributes'] = JSON.stringify(programAttributes);
    }

    if (this.createdFromProgramId) {
      createProgramRequest['createdFromProgramId'] = this.createdFromProgramId;
    }

    if (localStorage.getItem('programID') == null || localStorage.getItem('programID') == 'null') {
      this.Upsertprogram(tenentId, createProgramRequest, formData, 'insert');
    }
    else {
      this.Upsertprogram(tenentId, createProgramRequest, formData, 'update');
    }
  }

  Upsertprogram(tenentId, createProgramRequest, formData, type) {

    if (type == 'insert') {
      this.createBuyWindowSubscription = this._programService.create(tenentId, createProgramRequest).subscribe(programId => {
        //console.log(programId);
        // Call Api to upload file

        this.createBuyWindowSubscription.unsubscribe();

        if (this.readyToUploadFiles[0] != undefined) {
          this.fileUploadSubscription = this._fileUploadService.upload(tenentId, formData, 'program').subscribe(
            successResponse => {
              if (this.fileUploadSubscription) {
                console.log('success')
              }
            });
        }
        setTimeout(() => {
          this.isLoading = false;
          this.createdFromProgramId = ''
          let rms = this.resourceMessage && this.resourceMessage['ProgramSuccessMessage'];
          let msg = '<b>' + createProgramRequest.programName + '</b> <br>' + rms;
          this.loadProgramDetails('save');
          this.openSnackBar(createProgramRequest.programName, rms, 'success');
          let d = programId.result;

          localStorage.setItem('programID', d.toString());
          this.step = 1;
          this.submitButtonClicked = false;
          this.setStep(1);
        }, 1000);


      }, err => {
        this.createBuyWindowSubscription.unsubscribe();
        if (this.fileUploadSubscription) {
          this.fileUploadSubscription.unsubscribe();
        }
        this.openSnackBar('', err.error, 'error');
        document.getElementById('loadingSpinnerContainerprogram').style.display = 'none'
        this.isLoading = false;
        this.submitButtonClicked = false;
      });
    }
    else {
      this.createBuyWindowSubscription = this._programService.update(tenentId, createProgramRequest, localStorage.getItem('programID')).subscribe(programId => {
        //this.createBuyWindowSubscription.unsubscribe();
        if (this.readyToUploadFiles[0] != undefined) {
          this.fileUploadSubscription = this._fileUploadService.upload(tenentId, formData, 'program').subscribe(successResponse => {
            if (this.fileUploadSubscription) {
              //this.FileUpload.unsubscribe();    
              console.log('success')

            }

          });
        }
        setTimeout(() => {
          this.isLoading = false;
          // this.submitButtonClicked = false;

          // this.createProgramForm.reset();
          // this.htmlContent='';


          let rms = this.resourceMessage && this.resourceMessage['ProgramSuccessMessage'];
          let msg = '<b>' + createProgramRequest.programName + '</b> <br>' + rms;
          if(!this.isAdminCreatePage){
            this.loadProgramDetails('edit');
          } else {
            let element = JSON.parse(localStorage.getItem('adminProgramData'));
            if(element) {
              this.adminProgramEdit(element);
            }
          }
          this.openSnackBar(createProgramRequest.programName, rms, 'success');
          let d = programId.result;
          localStorage.setItem('programID', d.toString());
          this.submitButtonClicked = false;
          this.step = 1;
          this.setStep(1);
        }, 1000);
      }, err => {
        document.getElementById('loadingSpinnerContainerprogram').style.display = 'none'
        this.openSnackBar('', err.error, 'error');
        this.isLoading = false;
        this.submitButtonClicked = false;
        if (this.createBuyWindowSubscription) {
          this.createBuyWindowSubscription.unsubscribe();
        }
        if (this.fileUploadSubscription) {
          this.fileUploadSubscription.unsubscribe();
        }
      });
    }

  }

  showerrormessage(value) {
    let msg;
    if (value == 0) {
      msg = this.resourceMessage['ImageFileFormatWarning'];
    }
    else {
      msg = this.resourceMessage['MultiplefileError'];
    }
    document.getElementById('createinvalidformt').innerHTML = msg;
  }

  convertDateToISO(event: any) {
    return this.datepipe.transform(event, 'YYYY-MM-ddTHH:mm:ss') + '.000Z'
  }

  openSnackBar(name, message, type) {
    this._snackBar.openFromComponent(ToastMessageComponent, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type],
      data: {
        html: message,
        type: type,
        assetpath: this.assetPath,
        name: name
      }
    });
  }

  createProgramFileChange(pFileList) {

    let file = pFileList[0];
    let iscorrectformat = this.validateimageformat(file)
    if (iscorrectformat) {
      this.applyFileInImageView(file);
      document.getElementById('createinvalidformt').innerHTML = "";
    }
    else {
      let msg = this.resourceMessage['ImageFileFormatWarning'];
      document.getElementById('createinvalidformt').innerHTML = msg;
    }


    // here you can do whatever you want with your image. Now you are sure that it is an image


  }

  validateimageformat(file) {
    let valToLower = file.name.toLowerCase();
    let regex = new RegExp("(.*?)\.(jpg|png|jpeg|gif)$"); //add or remove required extensions here
    let regexTest = regex.test(valToLower);
    return !regexTest ? false : true;
  }

  handleDrop(files) {
    document.getElementById('createinvalidformt').innerHTML = "";
    for (let i = 0; i < files.length; i++) {
      this.applyFileInImageView(files[i]);
    }
    this.IsremoveImage = true;
  }

  applyFileInImageView(file) {
    this.IsremoveImage = true;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.files = reader.result;
      document.getElementById('image')['src'] = this.files;
    };
    const blob = new Blob([file], { type: file.type });
    this.readyToUploadFiles = [];
    this.readyToUploadFiles.push({
      name: file.name,
      fileblob: blob
    });
  }

  openDeletePopup(program: any) {
    this.deleteProgram = program;
    this.popupDataObject = new popupSection();
    this.popupDataObject.selectedItem = this.deleteProgram.programName;
    this.popupDataObject.type = 'program'
    this.popupDataObject.title = this.resourceMessage && this.resourceMessage['Deletelbl'];
    this.popupDataObject.okButtonTitle = this.resourceMessage && this.resourceMessage['Deletebtn'];
    this.popupDataObject.cancelButtonTile = this.resourceMessage && this.resourceMessage['ArchiveCancel'];;
    this.confirmPopup.openPopup();
  }


  cancelArchive() {
    // this.selectedArchiveElement = null;
    this.confirmPopup.cancelClicked();
  }

  archiveApi() {
    document.getElementById('loadingSpinnerContainerprogram').style.display = 'block'
    let tenentId = this._authService.getUserToken().tenantId
    this._programService.delete(tenentId, this.deleteProgram.programID).subscribe(data => {
      let rms = this.resourceMessage && this.resourceMessage['PgmDeleteMessage'];
      let msg = '<b>' + this.deleteProgram.programName + '</b> <br>' + rms;
      this.openSnackBar(this.deleteProgram.programName, rms, 'success');
      if (this.buywindowdata.programID != undefined) {
        if (this.deleteProgram.programID == this.buywindowdata.programID) {
          this.buywindowdata.programID = null;
          this.buywindowdata.programIndex = null;
          localStorage.setItem('programID', null)
          this.createProgramForm.reset();
          localStorage.setItem('programID', null);
          localStorage.setItem('programIndex', null);
          this.htmlContent = '';
          this.fileName = '';
          document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
        }

      }

      if (this.deleteProgram.programID == localStorage.getItem('programID')) {
        localStorage.setItem('programID', null)
        this.createProgramForm.reset();
        localStorage.setItem('programID', null);
        localStorage.setItem('programIndex', null);
        this.htmlContent = '';
        this.fileName = '';
        document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
      }


      let buywindowdata = {
        buywindowName: this.buywindowdata.buywindowName,
        buywindowId: this.buywindowdata.buywindowId ? this.buywindowdata.buywindowId : this.buywindowdata.buywindowId.buyWindowId,
        endDate: this.buywindowdata.endDate,
        programID: this.buywindowdata.programID,
        programIndex: this.buywindowdata.programIndex,
        startDate: this.buywindowdata.startDate
      }

      localStorage.setItem('buywindowData', JSON.stringify(buywindowdata));

      this.loadProgramDetails();
      this.confirmPopup.cancelClicked();
      this.step = 0;
      this.setStep(0)
    }, (err) => {
      document.getElementById('loadingSpinnerContainerprogram').style.display = 'none';
      this.openSnackBar('', err.error, 'error');
    });
  }

  loadProgramDetailsfromitem(event) {
    this.loadProgramDetails(event);
  }

  getProgramDetails(programID, i, type?: string) {
    if (type != "save" && type != "edit" && type != "delete") {
      this.step = 1;
      this.setStep(1)

      setTimeout(() => {
        // this.step = 0;
        // this.setStep(0)
      }, 100);
    }
    else {
      this.step = 1;
      this.setStep(1)
    }
    this.createdFromProgramId = '';
    this.minDate = null;

    let tenentId = this._authService.getUserToken().tenantId
    localStorage.setItem('programID', programID)
    localStorage.setItem('programIndex', i);

    if (this.buywindowdata) {
      this.buywindowdata.programID = programID;
      this.buywindowdata.programIndex = i;
      let buywindowdata = {
        buywindowName: this.buywindowdata.buywindowName,
        buywindowId: this.buywindowdata.buywindowId ? this.buywindowdata.buywindowId : this.buywindowdata.buyWindowId,
        endDate: this.buywindowdata.endDate,
        programID: this.buywindowdata.programID,
        programIndex: this.buywindowdata.programIndex,
        startDate: this.buywindowdata.startDate
      }

      localStorage.setItem('buywindowData', JSON.stringify(buywindowdata));
    }

    this._programService.getProgramDetailsById(tenentId, programID).subscribe(data => {
      let startDate = new Date(this.datepipe.transform(data.result.startDate, 'MM/dd/yyyy'));
      let endDate = new Date(this.datepipe.transform(data.result.endDate, 'MM/dd/yyyy'));
      this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));

      if(this.minDate.getTime()  < (new Date()).getTime()) {
        this.minDate =  new Date();
      } else if(this.minDate.getTime() > (new Date()).getTime()) {
        this.minDate =  new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
      } else {
        this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
      }

      this.Elementdisabled = true;
      this.ProgramName = data.result.programName;
      this.htmlContent = data.result.programDescription;

      if (data.result.createdFromProgramId) {
        this.iscopiedprogram = true;
        this.creteFromProgrmIdtoModifyProgram = data.result.createdFromProgramId
      }
      else {
        this.iscopiedprogram = false;
        this.creteFromProgrmIdtoModifyProgram = ''
      }


      this.sDate = startDate;
      this.EndDate = endDate;
      this.createProgramForm.controls['startDate'].setValue(this.sDate);
      this.createProgramForm.controls['startDate'].setErrors(null);
      this.createProgramForm.controls['endDate'].setValue(this.EndDate);
      this.createProgramForm.controls['endDate'].setErrors(null);
      this.createProgramForm.controls['Programname'].setValue(data.result.programName);
      this.createProgramForm.controls['programDescription'].setValue(this.htmlContent);
      // document.getElementById('loadingSpinnerContainerprogram').style.display='none';
      if (data.result.programAttributes) {
            let programAttribute = JSON.parse(data.result.programAttributes);
            this.submission = {data: {}};
          if(this.form && this.form.formio && this.form.formio.submission && this.form.formio.submission.data) {
            let keys = Object.keys(this.form.formio.submission.data);
            keys.forEach((key, index) => {
              let programAtrributeKeys = Object.keys(programAttribute);
              programAtrributeKeys.forEach((keyValue, index) => {
                if (key === keyValue) {
                  this.submission.data[key] = programAttribute[keyValue];
                  this.form.formio.submission.data[key] = programAttribute[keyValue];
                }
              });
            });
          }
            this.refreshForm.emit({
              form: this.formDefinition
            });
            this.appCommonFunctions.setTooltipOnFormIo();
          } else {
            this.submission = {data: {}};
            // let keys = Object.keys(this.form.formio.submission.data);
            // keys.forEach((key, index) => {
            //   this.submission[key] = '';
            // })
            this.refreshForm.emit({
              form: this.formDefinition
            });
            this.appCommonFunctions.setTooltipOnFormIo();
        }
      let prgcard = document.getElementsByClassName('program-card');
      if (prgcard != null) {
        for (let j = 0; j < prgcard.length; j++) {
          if(prgcard[j]) {
            prgcard[j].classList.remove('selectedclass');
            prgcard[j].classList.add('notselectedclass');
          }
        }
        if(document.getElementById('programcard-' + i)) {
          document.getElementById('programcard-' + i).classList.remove('notselectedclass');
          document.getElementById('programcard-' + i).classList.add('selectedclass');
        }
      }
      this.checkItemDisabled();

      let deleteimgall = document.getElementsByClassName("deleteimg");
      if (deleteimgall != null) {
        for (let j = 0; j < deleteimgall.length; j++) {
          let srcdelete = <HTMLImageElement>document.getElementsByClassName("deleteimg")[j]
          if (srcdelete != null)
            srcdelete.src = this.deletepath;
        }
        let deleteimg = document.getElementById("deleteimg-" + i) as HTMLImageElement;
        if (deleteimg != null)
          deleteimg.src = this.deleteselectpath;
      }

      let cloneimgall = document.getElementsByClassName("cloneimg");
      if (cloneimgall != null) {
        for (let j = 0; j < deleteimgall.length; j++) {
          let srcclone = <HTMLImageElement>document.getElementsByClassName("cloneimg")[j]
          if (srcclone != null)
            srcclone.src = this.clonepath;
        }
        let cloneimg = document.getElementById("cloneimg-" + i) as HTMLImageElement;
        if (cloneimg != null)
          cloneimg.src = this.cloneselectpath;
      }

      let prgnameall = document.getElementsByClassName('program-name');
      if (prgnameall != null) {
        for (let j = 0; j < prgnameall.length; j++) {
          let pgnmaclass = <HTMLElement>document.getElementsByClassName('program-name')[j];
          if(pgnmaclass) {
            pgnmaclass.classList.remove('selectpgmname');
            pgnmaclass.classList.add('notselectpgmname');
          }
        }

        let prgname = document.getElementById('programname-' + i) as HTMLElement;
        if(prgname) {
          prgname.classList.remove('notselectpgmname');
          prgname.classList.add('selectpgmname');
        }
      }

      //display image right side while modify an element
      if (data.result.thumbnailImagePath != undefined && data.result.thumbnailImagePath != "") {
        let imagename = data.result.thumbnailImagePath;
        this._fileUploadService.downloadFile(tenentId, data.result.thumbnailImagePath, "program").subscribe(data => {
          let imageBinary = data.result;
          this.IsremoveImage = true;
          setTimeout(() => {
            if(document.getElementById('image')) {
              document.getElementById('image')['src'] = 'data:image/png;base64,' + imageBinary;
             }
          }, 300)
          this.fileName = imagename;
        }, error => {
          this.IsremoveImage = false;
          document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
        }
        );
      }
      else {
        this.IsremoveImage = false;
        if(document.getElementById('image'))
        document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
      }
    }, (err) => {
      this.minDate = new Date();
      document.getElementById('loadingSpinnerContaineritem').style.display = 'none';
      this.openSnackBar('', err.error, 'error');
    });

    this.modifyProgramComponent.getItemListByProgramId();

  }

  copyProgramFromBuyWindow(programID) {
    this.getFormioService().then(() => {
    this.tabSelection(false);
    this.submitButtonClicked = false;
    this.createdFromProgramId = programID;
    this.canPublish = false;
    this.step = 0;
    this.setStep(0);
    this.minDate = null;
    var ToDate = new Date();
    this.minDate = new Date(this.datepipe.transform(this.buywindowdata.startDate, 'MM/dd/yyyy'));
    if (new Date(this.minDate).getTime() <= ToDate.getTime()) {
      this.minDate = new Date();
      //alert("The Date must be Bigger or Equal to today date");
    }
    document.getElementById('loadingSpinnerContainerprogram').style.display = 'block'
    let tenentId = this._authService.getUserToken().tenantId;
    this._programService.getProgramDetailsById(tenentId, programID).subscribe(data => {
      this.Elementdisabled = true;
      this.modifyProgramComponent.getItemListByProgramId();
      this.ProgramName = data.result.programName;
      this.htmlContent = data.result.programDescription;
      this.createProgramForm.controls['Programname'].setValue(data.result.programName);
      this.createProgramForm.controls['programDescription'].setValue(this.htmlContent);
      document.getElementById('loadingSpinnerContainerprogram').style.display = 'none';
      //display image right side while modify an element
        if (data.result.programAttributes) {
          let programAttribute = JSON.parse(data.result.programAttributes);
          this.submission = {data: {}};
          if(this.form && this.form.formio && this.form.formio.submission && this.form.formio.submission.data) {
          let keys = Object.keys(this.form.formio.submission.data);
          keys.forEach((key, index) => {
            let programAtrributeKeys = Object.keys(programAttribute);
            programAtrributeKeys.forEach((keyValue, index) => {
              if (key === keyValue) {
                this.submission.data[key] = programAttribute[keyValue];
                this.form.formio.submission.data[key] = programAttribute[keyValue];
              }
            });
          });
        }
          this.refreshForm.emit({
            form: this.formDefinition
          });
          this.appCommonFunctions.setTooltipOnFormIo();
        } else {
          this.submission = {data: {}};
          this.refreshForm.emit({
            form: this.formDefinition
          });
          this.appCommonFunctions.setTooltipOnFormIo();
      }
       
      if (data.result.thumbnailImagePath != undefined && data.result.thumbnailImagePath != "") {
        let imagename = data.result.thumbnailImagePath;
        this._fileUploadService.downloadFile(tenentId, data.result.thumbnailImagePath, "program").subscribe(data => {
          let imageBinary = data.result;
          // console.log(imageBinary);
          this.IsremoveImage = true;
          setTimeout(() => {
            if(document.getElementById('image')) {
              document.getElementById('image')['src'] = 'data:image/png;base64,' + imageBinary;
             }
          }, 300)
          // const blob = new Blob([imageBinary],{type: imageBinary.type}) ;
          // this.readyToUploadFiles=[];
          // this.readyToUploadFiles.push({
          //   name: imagename,
          //   fileblob: blob
          // });
          this.fileName = imagename;
        }, error => {
          this.IsremoveImage = false;
          document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
        }
        );
      }

      else {
        this.IsremoveImage = false;
        document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
      }
    }, (err) => {
      this.minDate = new Date();
      document.getElementById('loadingSpinnerContainerprogram').style.display = 'none';
      this.openSnackBar('', err.error, 'error');
    });
  })
  }

  checkItemDisabled() {
    if(this.isAdminCreatePage || this.isAdminCompleteProgram) {
      return false
    }
    let programId = localStorage.getItem('programID')
    if (programId != 'null') {
      return false
    } else {
      return true
    }
  }

  isFormioExists() {
    return this.formDefinition && Object.keys(this.formDefinition).length > 0;
  }


  /**
  * Purpose - Unsubscribe state subscriptions.
  */
  ngOnDestroy() {
    // if(this.router.routerState.snapshot.url !== '/modify-program-mobile') {
    //   localStorage.removeItem('adminProgramData');
    //   localStorage.removeItem('isAdminCompleteProgram');
    // }
    sessionStorage.removeItem('isFromModifyMobile');
  }

  publish() {
    let tenentId = this._authService.getUserToken().tenantId;
    let buyWindowId = this.buywindowdata.buywindowId ? this.buywindowdata.buywindowId : this.buywindowdata.buyWindowId
    this._buyWindowService.publish(tenentId, buyWindowId).subscribe(data => {
      let rms = this.resourceMessage && this.resourceMessage['PublishSuccess'];
      let msg = '<b>' + this.buywindowname + '</b> ' + rms;
      this.openSnackBar(this.buywindowname, rms, 'success');
      let url = `buywindow/`
      //console.log(url);
      this.router.navigate([url]);
      $('html,body').animate({ scrollTop: 0 });
    }, (err) => {
      this.openSnackBar('', err.error, 'error');
    });
  }

  removeSession() {
    sessionStorage.removeItem('isFromModifyMobile');
  }


  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  getcharcount(event) {
    if(this.isAdminCompleteProgram) {
      return false;
    }
    let descriptioncount = this.htmlContent.replace(/<(.|\n)*?>/g, '').length;
    if (descriptioncount > 900) {
      event.preventDefault();
      return false;
    }
    else {
      return true;
    }
  }

  get1000charcount(event: ClipboardEvent) {
    if(this.isAdminCompleteProgram) {
      return false;
    }
    let clipboardData = event.clipboardData;//|| window.clipboardData;
    let pastedText = clipboardData.getData('text');
    let descriptioncount = pastedText.replace(/<(.|\n)*?>/g, '').length;
    if (descriptioncount > 900) {
      this.htmlContent = pastedText.substring(0, 900);
      // event.preventDefault();
      return false;
    }
    else {
      return true;
    }

  }

  removeImage(event) {
    event.preventDefault();
    this.readyToUploadFiles = [];
    this.fileName = '';
    document.getElementById('image')['src'] = this._fileUploadService.imageNotAvailableBase64;
    this.IsremoveImage = false;
  }

  isToolTipExists(id, name) {
    let result = document.getElementById("programname-" + id);
    if (result && (result.scrollHeight > result.clientHeight)) {
      return name;
    }
    return ''
  }
  cloneProgram(program: any) {
    document.getElementById('loadingSpinnerContainerprogram').style.display = 'block';
    this.cloningProgram = program;
    this._programService.cloneProgram(this.tenentId, this.cloningProgram.programID).subscribe(newprogramId => {
      let d = newprogramId.result;
      localStorage.setItem('programID', d.toString());
      this.loadProgramDetails('clone');
      let rms = this.resourceMessage && this.resourceMessage['PgmCloneMessage'];
      let msg = '<b>' + this.cloningProgram.programName + '</b> <br>' + rms;
      this.openSnackBar(this.cloningProgram.programName, rms, 'success');
    },
      err => {
        this.openSnackBar('', err.error, 'error');
        document.getElementById('loadingSpinnerContainerprogram').style.display = 'none'
        this.isLoading = false;
      });
  }

}

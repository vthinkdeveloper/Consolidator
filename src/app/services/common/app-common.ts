import { Injectable } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { getRtlScrollAxisType } from '@angular/cdk/platform';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export function getDatePickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    adaptivePosition: true,
    showWeekNumbers: false
  });
}

@Injectable({
  providedIn: 'root',
})
export class AppCommonFunctions {
  apiUrl: string;
  private uploadFileEvent = new Subject<any>();
  private sendRightsData = new Subject<any>();
  formIoUrl = '';
  public resouceMessage: any = {
    BuyWindowNameLbl: 'Buy window name',
    CreateBuyBtn: 'Create',
    CreateBuyLbl: 'Create New Buy Window',
    CreateNewBuyBtn: 'Create New Buy Window',
    EndDateLbl: 'End Date',
    StartDateLbl: 'Start Date',
    BuyNameVal: "* 'Buy window name' is required. Please enter and try again.",
    EndDateVal: "* 'End Date' is required. Please enter and try again.",
    StartDateVal: "* 'Start Date' is required. Please enter and try again.",
    ActiveBuy: 'Active Buy Window',
    ArchivedBuy: 'Archived Buy Window',
    BuyWindow: 'Buy Window',
    StartEndDate: 'Start & End Date',
    Actionslbl: 'Actions',
    AddProgramlnk: 'Add Program',
    Archivelnk: 'Archive',
    Publishlnk: 'Publish',
    AllCategories: 'All',
    Buyname: 'Buy window name',
    Programname: 'Program name',
    SKUnumber: 'Item SKU number',
    Searchlbl: 'Search….',
    Archivelbl: 'Are you sure you want to archive the',
    ArchiveCancel: 'Cancel',
    ArchiveBtn: 'Archive',
    Filterlbl: 'Filter Period',
    Past30days: 'Past 30 days',
    Past3months: 'Past 3 months',
    Past6months: 'Past 6 months',
    PgmNameVal: "* 'Program Name' is required. Please enter and try again.",
    Deletelbl: 'Are you sure you want to delete the',
    Deletebtn: 'Delete',
    BuyArchiveMessage: 'buy window has been successfully archived.',
    BuySuccessMessage: 'buy window has been successfully created.',
    ProgramSuccessMessage: 'program has been successfully created.',
    PgmDeleteMessage: 'program has been successfully deleted.',
    NoBuywindowWarning:
      'There are no existing Buy windows! Please create one to start',
    ProgramUpdateMessage: 'program has been successfully Modified.',
    PublishSuccess: 'buy window is published successfully.',
    PublishError:
      'There should be atleast one program and item in the buy window',
    PublishBtn: 'Publish',
    Selectbuywindowlbl: 'Select a Buy Window',
    SelectPgmlbl: 'Select a Program to copy',
    Publishedlbl: 'Published',
    ModifyElementlbl: 'Add/Modify Item',
    CreatenewElmBtn: 'Create a New Item',
    Elementlbl: 'Item:',
    CreateNewElmlbl: 'Create New Item',
    CopyExistingElmBtn: 'Copy Existing Item',
    Pricelbl: 'Price',
    Notelbl: 'Notes',
    SaveElementBtn: 'Save Item',
    ItemSuccessMessage: 'The Item has been successfully created.',
    ItemEditSuccessMessaage: 'The Item has been successfully updated.',
    Imagelbl: 'Image',
    Elementnamelbl: 'Item',
    DeleteElementMsg: 'The Item has been successfully deleted.',
    Modifybtn: 'Modify',
    ProgramDetailsLbl: 'Program Details',
    ElementDetailsLbl: 'Item Details',
    ImageFileFormatWarning:
      'Only files with following extensions are allowed: jpeg jpg png gif',
    SearchFilterlbl: 'Search Filters',
    Viewlnk: 'View',
    '2021lbl': '2021',
    '2020lbl': '2020',
    '2019lbl': '2019',
    SelectProgramlbl: 'Select a Program',
    CreateNewPgmBtn: 'Create New Program',
    CopyExistingPgmBtn: 'Copy Existing Program',
    ModifyPgmlbl: 'Add/Modify Program',
    ProgramDesclbl: 'Program Description',
    DragandDrop: 'Drag & Drop to Upload image',
    BrowseFileslbl: 'Browse Files',
    SavePgmbtn: 'Save Program',
    SearchFilterslbl: 'Search Filters',
    Pgmlbl: 'PROGRAM',
    Userlbl: 'USER',
    Marketlbl: 'MARKET',
    SelectProgramddl: 'Select Program',
    SelectUserddl: 'Select User',
    SelectMarketddl: 'Select Market',
    OrderPeriodlbl: 'Order period:',
    ItemListlbl: 'Item List for Program :',
    ItemName: 'Item Name',
    Quantitylbl: 'Quantity',
    TotalCostlbl: 'Total Cost',
    Actionlbl: 'Action',
    OrderBtn: 'Order',
    Totallbl: 'Total',
    BuyDateVal: "'Start Date' cannot be greater than 'End Date'",
    MultiplefileError: 'Please select one file.Multiple files not supported',
    OrderedQtyLbl: 'Ordered Qty',
    SelectedAddLbl: 'Selected Addresses',
    SearchAddrlbl: 'Search Addresses',
    CompanyLbl: 'Company',
    ContactLbl: 'Contact',
    AddressLbl: 'Address',
    ClearLbl: 'Clear',
    CancelChangesBtn: 'Cancel Changes',
    SaveChangesBtn: 'Save Changes',
    Norecordslbl: 'No records to display',
    FilterMarketlbl: 'Filter Market',
    Downloadbtnlbl: 'Download Report',
    ActivePgmslbl: 'Active Programs',
    CompletedPgmslbl: 'Completed Programs',
    Programslbl: 'Programs',
    Itemslbl: 'Items',
    Totalqtylbl: 'Total Qty',
    Editbtnlbl: 'Edit',
    CreateNewItembtn: 'Create New Item',
    programItemReq: '* Please select program item',
    priceReq: '* Please enter item price',
    Qtylbl: 'Qty',
    RemoveImagelbl: 'Remove Image',
    searchPlaceholderProgramOrder: 'Search an item name or item description',
    Activelbl: 'Active',
    Compeletedlbl: 'Completed',
    Copypgmlbl: 'Copy Program',
    SelectaBuywindowlbl: 'Select a Buy Window',
    BuywindowRqd:
      "* 'Buy Window' selection is required. Please select and try again",
    ProgramRqd:
      "* 'Program' selection is required. Please select and try again",
    Copyfromexistingbtn: 'Copy from existing',
    modifyItem: 'Modify Item',
    locationsuccess: 'Successfully assigned locations',
    usersuccess: 'Successfully assigned users',
    Resultslbl: 'Results',
    selectalllbl: 'Select All',
    nameLbl: 'Name',
    saveuser: 'Save',
    alluser: 'All',
    viewLocation: 'View Location',
    viewUsers: 'View Users',
    viewItem: 'View Item',
    viewProgram: 'View Program',
    draganddropprogram: 'Drag & Drop to Upload Program image',
    searchlocationname: 'Search Location Name',
    searchlocation: 'Search Location',
    AdminDashboard: 'Admin Dashboard',
    ManageProgram: 'Manage Program',
    ManageUsers: 'Manage Users',
    ManageAddress: 'Manage Address',
    ProgramAttributes: 'Program Attributes',
    BuyWindowDetails: 'Buy Window Details',
    ProgramName: 'Program Name',
    noofitems: 'No. of Items',
    DashboardMenu: 'Dashboard',
    OrderMenu: 'Order',
    ProgramBuilderMenu: 'Program Builder',
    AdminMenu: 'Admin',
    deletethisitem: 'Delete this item',
    clonethisprogram: 'Clone this program',
    deletethisprogram: 'Delete this program',
    editthisitem: 'Edit this item',
    thisitemwillreomoved: 'This item will be removed from',
    confirmationmessage:
      'program. All open orders associated with this item will be cleared out. Do you still want to delete it?',
    programDashboard: 'Program Dashboard',
    programOrderBM: 'BrandMuscle Program Order',
    ProgramManager: 'Program Manager',
    BacktoHome: 'Back to Home',
    welcomelbl: 'Hi',
  };
  checkMobileWidth = 1024;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  sendUploadFiles(event) {
    this.uploadFileEvent.next(event);
  }

  getUploadSuccessEvent(): Observable<any> {
    return this.uploadFileEvent.asObservable();
  }

  sendRights(event) {
    this.sendRightsData.next(event);
  }

  getRightsSuccessEvent(): Observable<any> {
    return this.sendRightsData.asObservable();
  }

  /**
   * @Purpose - To get resource messages from session storage.
   * @returns: Resource messages value
   */
  getResourceMessages(): any {
    const resourecMessageValue = sessionStorage.getItem(
      'consolidatorResourceMessage'
    );
    return resourecMessageValue ? JSON.parse(resourecMessageValue) : null;
  }

  getTheme(): any {
    const themeValues = sessionStorage.getItem('subscriptionTheme');
    return themeValues ? JSON.parse(themeValues) : null;
  }

  showLoader(id) {
    if (document.getElementById(id)) {
      document.getElementById(id).style.display = 'block';
    }
  }

  hideLoader(id) {
    if (document.getElementById(id)) {
      document.getElementById(id).style.display = 'none';
    }
  }

  applyWeekEndCustomColor() {
    let minDate = new Date();
    let weekEnd = [];
    for (let k = minDate.getFullYear(); k <= minDate.getFullYear() + 25; k++) {
      //Need refactoring
      for (let j = 1; j <= 12; j++) {
        //looping through months
        var getTot = this.daysInMonth(j, k);
        for (var i = 1; i <= getTot; i++) {
          //looping through days in month
          let newDate = new Date(k, j, i);
          if (newDate.getDay() == 0) {
            //if Sunday
            weekEnd.push(newDate);
          }
          if (newDate.getDay() == 6) {
            //if Saturday
            weekEnd.push(newDate);
          }
        }
      }
    }
    let weekEndDateCustomClasses = [];
    weekEnd.forEach((date) => {
      let dateValue = { date: date, classes: ['week-end-color'] };
      weekEndDateCustomClasses.push(dateValue);
    });
    return weekEndDateCustomClasses;
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  getRoles(tenantId: any): any {
    const url = `${this.apiUrl}${tenantId}/rights`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  omit_special_char(event) {
    var k;
    document.all
      ? (k = event.keyCode > 0 ? event.keyCode : event.charCode)
      : (k = event.which > 0 ? event.which : event.charCode);
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 32 ||
      (k >= 48 && k <= 57)
    );
  }

  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
  private handleError(error: any) {
    return throwError(error);
  }

  /**
   * @Purpose - Prevent typing letters and numbers.
   */
  preventTyping(event: any) {
    var key = window.event ? event.keyCode : event.which;

    if (
      event.keyCode == 8 ||
      event.keyCode == 46 ||
      event.keyCode == 37 ||
      event.keyCode == 39
    ) {
      return true;
    } else return false;
  }

  checkImageFileUploaded(fileType) {
    fileType = fileType.split('.').pop();
    let imageFileType = ['png', 'jpeg', 'jpg', 'jpe', 'gif'];
    return imageFileType.includes(fileType.toLowerCase());
  }

  isMobileCompatibleScreen() {
    return window.screen.width <= this.checkMobileWidth;
  }

  getPersistentData(submissionData: any, formData: any) {
    const fields = this.getNonPersistentFieldsForm(formData, []);

    fields.forEach((element) => {
      delete submissionData[element];
    });

    return submissionData;
  }

  setTooltipOnFormIo() {
    let elements = document.getElementsByClassName('choices__list--single');
    for(let j=0;j < elements.length;j++) {
    let elementsItem = elements[j]
    let selectDropdown = elementsItem.getElementsByClassName('choices__item--selectable');
    for(let i=0;i < selectDropdown.length;i++) {
      let spanElement = selectDropdown[i].getElementsByTagName('span')[0]
      if(spanElement) {
        spanElement['data-toggle'] = 'tooltip';
        spanElement['data-placement'] = 'top';
        spanElement['title'] = spanElement.innerText;
        if(selectDropdown[i]) {
          selectDropdown[i]['data-toggle'] = 'tooltip';
          selectDropdown[i]['data-placement'] = 'top';
          selectDropdown[i]['title'] = spanElement.innerText;
        }
        if(elementsItem) {
          elementsItem['data-toggle'] = 'tooltip';
          elementsItem['data-placement'] = 'top';
          elementsItem['title'] = spanElement.innerText;
        }
      }
    }
  }
  }

  getNonPersistentFieldsForm(formdata: any, fields: any) {
    for (let i = 0; i < formdata.length; i++) {
      if (formdata[i].components) {
        this.getNonPersistentFieldsForm(formdata[i].components, fields);
      } else if (formdata[i].columns) {
        this.getNonPersistentFieldsForm(formdata[i].columns, fields);
      } else {
        if (formdata[i].persistent === false) {
          fields.push(formdata[i].key);
        }
      }
    }

    return fields;
  }
}


// To validate start and end dates
export function CompareStartEndDates(
  controlName: string,
  matchingControlName: string
) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return;
    }

    if (control.value > matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

export function TovalidateNotes(controlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    control.setErrors(null);
  };
}

  // To validate start and end dates
  export function CannotContainOnlySpace() : ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      const value = control.value;
  
      if (control.errors && !control.errors.containSpace) {
        return of(null);
      }
  
      if (control.value.trim().length === 0) {
        return of({containSpace:true})
      } else {
        return of(null);
      }
    };
  }

export class popupSection {
  selectedItem: String;
  title: String;
  okButtonTitle: String;
  cancelButtonTile: String;
  type ?:string;
  isAdminScreen?: boolean = false;
}

export class popupViewData{
  buywindowID: string;
  buyWindowName: string;
  programID ?: string;
}


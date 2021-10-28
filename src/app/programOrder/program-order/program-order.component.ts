import { Component, OnInit,ViewChild, ViewEncapsulation } from '@angular/core';
import {AuthService} from  '../../services/auth.service';
import {OrderService} from  '../services/order.service'
import { AppCommonFunctions } from '../../services/common/app-common';
import {ProgramDetails} from '../../programbuilder/_models/program';
import {ProgramService} from  '../../programbuilder/services/program.service';
import { MatTableDataSource } from '@angular/material/table';
import {OrderLineData} from '../_model/OrderLineData';
import { MatSort } from '@angular/material/sort';
import {animate, state, style,transition, trigger } from '@angular/animations';
import { environment } from 'src/environments/environment';
import {ModalOrderpageComponent} from '../modal-orderpage/modal-orderpage.component'
import {MatDialog} from '@angular/material/dialog';
import {UserDetail} from '../_model/userDetails'
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { EditOrderComponent } from '../../edit-order/edit-order.component';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ToastMessageComponent } from '../../toast-message/toast-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormioService } from '../../services/formio/formio.service';
import { MatDrawerMode } from '@angular/material/sidenav';
import { FormioComponent } from '@formio/angular';
import { FormioModule } from '@formio/angular';

declare var $ : any
@Component({ 
  selector: 'app-program-order',
  templateUrl: './program-order.component.html',
  styleUrls: ['./program-order.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'void',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProgramOrderComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(FormioComponent, { static: false }) form: FormioComponent;
  
  tenantId;
  public resourceMessage: any;
  programDetails:ProgramDetails[]=[];
  userDetails:UserDetail[]=[];
  marketDetails:any[]=[];
  selectedProgram:any;
  selectedUser:any;
  selectedMarket:any;
  orderLineData:OrderLineData[]=[]; 
  assetPath: string=environment.assetBasePath;
  formDefinition: any;
  mode: MatDrawerMode = 'side'
  opened: boolean = true;
  showAdditionalFilter: boolean = false;
  showAdditionalRow: boolean = true;
  events: string[] = [];
  selectedFilters = [];
  dropDownArray = [];
  programAttributeList = [];
  programAttributeListvalues = [];
  programDetailList = [];
  submission: any;
  constructor(public dialog: MatDialog,
    private _authservice:AuthService,
     private _orderservice:OrderService, 
    public appCommonFunctions: AppCommonFunctions,
    private _programService: ProgramService,
    private router: Router,
    private _snackBar: MatSnackBar,
    public formioService: FormioService) { }
    dataSource: any;
    totalAmount=0;
    totalQty=0;
    noOfPages = 1;
    selectedPage = 1;
    startIndex = 0;
    endIndex = 0;
    itemListLength = 0;
    orderData
    formIoKey;
    displayedColumns: string[] = [
      'image',
      'itemName',
      'unitPrice',
      'quantity',
      'totalCost',
      'action'
    ];

    displayedColumnsMobile: string[] = [
      'itemName',
      'quantity',
      'totalCost',
      'action'
    ] 

    isProgramOpen:boolean=false;
    isMarketOpen:boolean=false;
    isUserOpen:boolean=false;

  ngOnInit(): void {
    $('html,body').animate({scrollTop:0});
    this.formIoKey = JSON.parse(sessionStorage.getItem('ConsolidatorConfig')) &&  JSON.parse(sessionStorage.getItem('ConsolidatorConfig'))['formKeys']
    if(!this.formIoKey){
      this.showAdditionalRow= false
    }
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.tenantId=this._authservice.getUserToken().tenantId;
    this.orderData=JSON.parse(localStorage.getItem('orderData'));;
    if(this.orderData){
      this.loadDefaultView(this.orderData);
    }
    else{
      this.getProgramDDL();
    }
  }

  /**
  * To Triggered when there is some changes on formio.
  * @param formObject formio change component
  */
  onChange(formObject) {
    if (formObject.changed && formObject.changed.flags && (formObject.changed.flags.changed || formObject.changed.flags.changes &&
      formObject.changed.component.data) && (!formObject.changed.component.inputType || formObject.changed.component.inputType !== 'hidden')
    ) {
      this.programDetails = this.programDetailList.slice(0);
      this.appCommonFunctions.showLoader('loadingSpinnerContainerOrder');
      let object = {
      }
      object[formObject.changed.component.key] = formObject.changed.value;
      let filterLenght = this.selectedFilters.findIndex((element) => element[formObject.changed.component.key])

      if ((Object.keys(formObject.changed.value).length > 0)) {
        if (filterLenght >= 0) {
          this.selectedFilters[filterLenght] = object;
        } else {
          this.selectedFilters.push(object);
        }
      }
      else {
        this.selectedFilters.splice(filterLenght, 1);
      }

      if ((formObject.changed.value || formObject.changed.value == "") && (Object.keys(formObject.changed.value).length > 0) &&
        (formObject.changed.component.data)) {
        this.programDetails = this.programDetailList.slice(0);
        if (this.selectedFilters && this.selectedFilters.length) {
          let componentddldata = [...this.programDetails];
          componentddldata.forEach((element, index) => {
            if (element) {
              if (!element['programAttributes'] || !this.isItemIsInAttribute(element['programAttributes'])) {
                var indexitem = this.programDetails.findIndex(values => values.programID === element.programID);
                if (indexitem !== -1) {
                  this.programDetails.splice(indexitem, 1);
                }
              }
            }
            else if (element) {
              var indexitem = this.programDetails.findIndex(values => values.programID === element.programID);
              if (indexitem !== -1) {
                this.programDetails.splice(indexitem, 1);
              }
            }
          })
        }
        else {
          this.programDetails = this.programDetailList.slice(0);
        }
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      }
      else if (formObject.changed.component && formObject.changed.component.data) {
        this.programDetails = this.programDetailList.slice(0);
        if (this.selectedFilters && this.selectedFilters.length) {
          let componentddldata = [...this.programDetails];
          componentddldata.forEach((element, index) => {
            if (element) {
              if (!element['programAttributes'] || !this.isItemIsInAttribute(element['programAttributes'])) {
                var indexitem = this.programDetails.findIndex(values => values.programID === element.programID);
                if (indexitem !== -1) {
                  this.programDetails.splice(indexitem, 1);
                }
              }
            }
            else if (element) {
              var indexitem = this.programDetails.findIndex(values => values.programID === element.programID);
              if (indexitem !== -1) {
                this.programDetails.splice(indexitem, 1);
              }
            }
          })
        }
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      } else {
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      }
      this.appCommonFunctions.setTooltipOnFormIo();
    } else {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
    }
  }

/**
  * To check program Attribute present on program item.
  * @param programAttributes ProgramAttribute of program item.
  */
isItemIsInAttribute(programAttributes) {
  let issElementExists = true;
  let value = JSON.parse(programAttributes);
  for(let i=0;i < this.selectedFilters.length;i++) {
    let key = Object.keys(this.selectedFilters[i])[0]
    if(this.selectedFilters[i][key] instanceof Array && value[key] instanceof Array) {
      let programAttributeArray = value[key]
        let selectedAttributeArray = this.selectedFilters[i][key]
        if(programAttributeArray.length === 0 || selectedAttributeArray.length === 0) {
          issElementExists = false;
          break;
        }
    
      for(let j=0 ; j < selectedAttributeArray.length; j++) {
        let selectedElement = selectedAttributeArray[j].value
         issElementExists = programAttributeArray.findIndex((element) => element.value === selectedElement) >= 0;
        if(!issElementExists) {
          break;
        }
      }

    } else if(!(value[key] instanceof Array)) {
      if(Object.keys(this.selectedFilters[i][key]).length ==0 || (value[key] && this.selectedFilters[i][key].value === value[key].value)){
        issElementExists = true;
      } else {
        issElementExists = false;
        break;
      }
    }
    if(issElementExists === false) {
      break;
    }
  }
  return issElementExists;
}

 /**
  * To get formio object data.
  */
  getFormioService() {
    let formIoKey = JSON.parse(sessionStorage.getItem('ConsolidatorConfig')) &&  JSON.parse(sessionStorage.getItem('ConsolidatorConfig'))['formKeys']
    if(!formIoKey || !formIoKey["programAttributes"]) {
      document.getElementById('loadingSpinnerContainerOrder').style.display='none';
      return
    }
    this.formioService.getFormDefinition(formIoKey["programAttributes"]).subscribe(response => {
      
      response.components.forEach(element => {
        if(element && element.validate && element.validate.required) {
          element.validate.required = false;
        }
        if(element.columns) {
          element.columns.forEach(data => {
            data.components.forEach(component => {
              this.dropDownArray.push(component);
              component.validate.required = false;
              if(component.customClass && component.customClass.includes('form-input-custom-class-order')) {
                component.customClass = component.customClass.replace('form-input-custom-class-order', 'form-input-custom-class');
              }
            })
          })
        } else if(element){
          this.dropDownArray.push(element);
          if(element.customClass &&  element.customClass.includes('form-input-custom-class-order')
           ) {
            element.customClass = element.customClass.replace('form-input-custom-class-order', 'form-input-custom-class');
          }
        }
      });
      this.formDefinition = JSON.parse(JSON.stringify(response));
      this.showAdditionalRow = true;
    }, (err) => {
      this.formDefinition = {};
      this.showAdditionalRow = false;
    });
  }

/**
  * To get formio dropdown filtered data.
  */
 setFormioDropdownData() {
  this.programAttributeList = [];
  this.programAttributeListvalues=[];
  let programAttributesValue;
  for(let i=0;i <= this.programDetails.length; i++) {
     let programDetail = this.programDetails[i] 
     if(programDetail && programDetail['programAttributes']) {
      programAttributesValue = JSON.parse(programDetail['programAttributes']);
      break;
     }
  }
 if(programAttributesValue) {
  Object.keys(programAttributesValue).forEach(valueData => {
    programAttributesValue[valueData] = []
  })
  if (this.programDetails && this.programDetails.length) {
    this.programDetails.forEach(element => {
      if (element && element['programAttributes']) {
        let value = JSON.parse(element['programAttributes']);
        Object.keys(value).forEach(valueData => {
           if(value[valueData] && Object.keys(value[valueData]).length > 0) {
            let filterValue = this.containsObject(valueData,value[valueData],programAttributesValue)
             if(!filterValue){
               if(value[valueData] instanceof Array) {
                value[valueData].forEach(element => {
                  if(programAttributesValue[valueData]) {
                  programAttributesValue[valueData].push(element);
                  } else {
                  programAttributesValue[valueData] = [];
                  programAttributesValue[valueData].push(element)
                  }
                });
               } else {
                 if(programAttributesValue[valueData]) {
                   programAttributesValue[valueData].push(value[valueData]);
                 } else {
                  programAttributesValue[valueData] = [];
                  programAttributesValue[valueData].push(value[valueData]);
                 }
               }
             }
           }
        })
      }
    });
 } 
}

  this.submission = {};
  if(programAttributesValue) {
    this.submission.data = {'programAttributesValue': programAttributesValue};
  } else {
    this.submission.data = {'programAttributesValue': {}};
  }
  
  this.submission.data.programAttributesValue['isFromProgramOrder'] = true;
  this.appCommonFunctions.setTooltipOnFormIo();
}

containsObject(valueData, obj, list) {
  let keys = Object.keys(list);
  for(let j=0; j < keys.length;j++) {
    let value = list[keys[j]];
    if(keys[j] == valueData) {
      var x;
      for (x = 0; x < value.length;x++) {
        if(obj instanceof Array){
          var k;
          for (k= 0; k < obj.length;k++) {
           if (JSON.stringify(obj[k]) === JSON.stringify(value[x])) {
              return true;
           }
          }
        } else {
          if (JSON.stringify(obj) === JSON.stringify(value[x])) {
            return true;
        }
      }  
      }
    }
  }
  return false;
}

  expandDropdown() {
     let downarrow = document.getElementById('caret-down') 
     if(downarrow && downarrow.style.display !== 'none') { 
       downarrow.style.display = 'none';
       document.getElementById('caret-up').style.display = 'block'; 
       for(let i=0;i < this.dropDownArray.length; i++) {
        document.getElementById('dropdownElements' + i).style.display = 'block';
       }
     } else {
      let uparrow = document.getElementById('caret-up') 
      uparrow.style.display = 'none';
      document.getElementById('caret-down').style.display = 'block';
      for(let i=0;i < this.dropDownArray.length; i++) {
        document.getElementById('dropdownElements' + i).style.display = 'none';
      }
     }
  }

  expandIndexElement(itemKey, dataValues,index) {
    for (let i=0;i< dataValues.length;i++) {
      let element = document.getElementById('dropdownElements' + index)
      let downarrow = document.getElementById('dropdownElements' + itemKey + i);
      if(downarrow && downarrow.style.display !== 'none') { 
        downarrow.style.display = 'none';
        element.style.backgroundColor = '#FFFFFF';
        this.appCommonFunctions.showLoader('dropdownItem' + index);
        this.appCommonFunctions.hideLoader('dropupItem' + index);
      } else if(downarrow) {
        downarrow.style.display = 'block';
        element.style.backgroundColor = '#F8F8F8';
        this.appCommonFunctions.hideLoader('dropdownItem' + index);
        this.appCommonFunctions.showLoader('dropupItem' + index);
      }
    }
  }

  loadDefaultView(orderData){
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    this.selectedProgram=orderData;
    this.loadProgramInfo(orderData.programID);
    this.selectedUser=orderData;
    if(orderData.isActive){
      this.getProgramDDL();
    }
    this.getUserDDL(orderData.programID);
  }

  getProgramDDL(){
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    //this endpoint will return the program details by user
    this._orderservice.GetProgramsByUser(this.tenantId).subscribe(data =>{
      this.programDetails=data.result; 
      this.programDetailList = this.programDetails.slice(0);
      this.setFormioDropdownData();
      if(this.showAdditionalFilter){
        this.getFormioService();
      }
      //document.getElementById('loadingSpinnerContainerOrder').style.display='none'
        // 
      if(this.orderData == null){
        //this.selectedProgram = data.result[0]; 
        document.getElementById('loadingSpinnerContainerOrder').style.display='none'
      }
          
    }, (err) => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      this.openSnackBar('', err.error, 'error');
    });
  }

  getUserDDL(programid){
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    this._orderservice.GetOrderUsers(this.tenantId,programid).subscribe(data=>{
      this.userDetails=data.result;
      this.selectedUser=[];
      this.selectedUser.fullName=this._authservice.getUserToken().displayName;
      this.selectedUser.userName=this._authservice.getUserToken().userName;
      this.getMarketDDL();
    }, (err) => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      this.openSnackBar('', err.error, 'error');
    })
  }

  getMarketDDL(){
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    if(JSON.parse(sessionStorage.getItem('ConsolidatorConfig'))) {
      let hierarchyLevel = JSON.parse(
        sessionStorage.getItem('ConsolidatorConfig')
      )['hierarchyLevel'];
      this._orderservice.GetUserMarkets(this.tenantId,this.selectedProgram.programID,this.selectedUser.userName,hierarchyLevel).subscribe(data=>{
        this.marketDetails=data.result;
        this.selectedMarket=this.marketDetails[0]
        $('html,body').animate({scrollTop:0});
        this.loadOrderLineDetails(null);
      }, (err) => {
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
        this.openSnackBar('', err.error, 'error');
      });
    } else {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
    }
  }
  
  selectProgram(element){
   // document.getElementById('loadingSpinnerContaineritem').style.display='block'     
    this.loadProgramInfo(element.programID);
  }

  selectUser(element){
    this.selectedUser=element;
    this.getMarketDDL();
  }

  selectMarket(element){
    this.appCommonFunctions.showLoader('loadingSpinnerContainerOrder');
    this.selectedMarket=element;
    this.loadOrderLineDetails(null)
  }

  loadProgramInfo(programid){  
    this.appCommonFunctions.showLoader('loadingSpinnerContainerOrder');
    this._programService.getProgramDetailsById(this.tenantId, programid).subscribe(data=>{
      //this.programDetails=data.result;
      this.selectedProgram=data.result;
      this.getUserDDL(programid);
      //this.getItemListByProgramId(data.result.programID)
      //document.getElementById('loadingSpinnerContaineritem').style.display='none'
    }, (err) => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      this.openSnackBar('', err.error, 'error');
    });
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
        name: name,
      },
    });
  }


  loadOrderLineDetails(searchval:string, isSaved:boolean=false){
    if(!this.selectedMarket || !this.selectedMarket.lmeId) {
       this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder'); 
       return
    }
    this.appCommonFunctions.showLoader('loadingSpinnerContainerOrder');
    this._orderservice.GetOrderLineDetails(this.tenantId,this.selectedUser.userName,this.selectedProgram.programID,searchval,this.selectedMarket.lmeId).subscribe(data=>{
      this.orderLineData=data.result;
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      this.dataSource = new MatTableDataSource<OrderLineData>(this.orderLineData);
      this.dataSource.sortingDataAccessor = (data, sortHeaderId) =>
      {
        if(typeof data[sortHeaderId] === 'string' || data[sortHeaderId] instanceof String) {
          return data[sortHeaderId].toLocaleLowerCase();
        }
        return data[sortHeaderId];
      }
      if (this.sort) {
        this.sort.direction = '';
      }

      
      //if(isSaved == false){
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.itemListLength = this.orderLineData.length;
        this.setPaginationChanges(isSaved);
      //}
      
      this.totalAmount=this.orderLineData.reduce((prev,next)=>prev+Number(next.totalCost),0)
      this.totalQty=this.orderLineData.reduce((prev,next)=>prev+Number(next.quantity),0)
      if(document.getElementById('loadingSpinnerContainerOrder')) {
        document.getElementById('loadingSpinnerContainerOrder').style.display='none';
      }
    }, (err) => {
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrder');
      this.openSnackBar('', err.error, 'error');
    });
  }

  nextClicked() {
    if (this.endIndex === this.noOfPages) {
      return;
    }
    this.startIndex = this.startIndex + 5;
    if (this.endIndex + 5 > this.noOfPages) {
      this.endIndex = this.noOfPages;
    } else {
      this.endIndex = this.endIndex + 5;
    }
    this.changePage(this.startIndex);
  }

  setPaginationChanges(isSaved) {
    if(isSaved == false){
      this.startIndex = 1;
      this.selectedPage = 1;
    }
   
    this.noOfPages = Number(this.itemListLength / 10);

    if (this.itemListLength < 10) {
      this.noOfPages = 1;
    }

    if (this.itemListLength > 10 && this.itemListLength % 10 !== 0) {
      this.noOfPages = this.noOfPages + 1;
    }
    if(isSaved == false){
      if (this.noOfPages > 5) {
        this.endIndex = 5;
      } else {
        this.endIndex = this.noOfPages;
      }
    }
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  previousClicked() {
    if (this.startIndex === 1) {
      return;
    }
    if (this.endIndex % 5 === 0) {
      this.endIndex = this.endIndex - 5;
    } else {
      let excessValue = this.endIndex % 5;
      this.endIndex = this.endIndex - excessValue;
    }
    this.startIndex = this.startIndex - 5;
    this.changePage(this.startIndex);
  }

  getPageList() {
    let pageArray = [];
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      pageArray.push(i);
    }
    return pageArray;
  }

  changePage(index) {
    if(this.paginator) {
      this.paginator.pageIndex = index - 1;
      this.selectedPage = index;
      this.paginator.page.next({
        pageIndex: index - 1,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      });
    }
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

  /**
   * To sort the programDetail by name.
   */
  sortbyname() {
    this.dataSource.sort = this.sort;
  }

  /**
  * To search program List.
  * @searchtext search key value
  */
  search(searchtext){
    if(searchtext=='')
    searchtext=null;
    if(searchtext == "" || searchtext == " "){
      searchtext=null;
    }

    if(searchtext != null){
      if (!searchtext.replace(/\s/g, '').length) {
        searchtext=null;
      }
    }
    this.loadOrderLineDetails(searchtext);
  }

  /**
  * To check program dropdown is opened.
  * @param open dropdown open boolean
  * @param dropdown selected dropdown
  */
  checkDropDown(open:boolean,dropdown: NgbDropdown) {
    if(open){
      this.isProgramOpen=true;
    }
    else{
      this.isProgramOpen=false;
    }
  }

  /**
   * To show and hide additional filter area.
   */
  showAndHideAdditionalFilter() {
    document.getElementById('loadingSpinnerContainerOrder').style.display='block';
    this.showAdditionalFilter = !this.showAdditionalFilter;
    if(this.showAdditionalFilter){
      this.getFormioService();
    }
    else{
      document.getElementById('loadingSpinnerContainerOrder').style.display='none';
    }
    
  }

 /**
  * To check market dropdown is opened.
  * @param open dropdown open boolean
  * @param dropdown selected dropdown
  */
  checkMarketDropdown(open:boolean, dropdown:NgbDropdown){
    
    if(open){
      this.isMarketOpen=true;
    }
    else{
      this.isMarketOpen=false;
    }
  }

  /**
  * To check user dropdown is opened.
  * @param open dropdown open boolean
  * @param dropdown selected dropdown
  */
  checkuserDropdown(open:boolean, dropdown:NgbDropdown){
    
    if(open){
      this.isUserOpen=true;
    }
    else{
      this.isUserOpen=false;
    }
  }

 /**
  * To open order dropdown.
  * @param element dropdown element data
  */
  openOrderPopup(element) {
    if(this.appCommonFunctions.isMobileCompatibleScreen()) {
      const dialogRef = this.dialog.open(EditOrderComponent, {
        maxWidth: '100vw',
        data: {
            element:element,
            programID:this.selectedProgram.programID,
            tenantId:this.tenantId,
            assetPath:this.assetPath,
            userName:this.selectedUser.userName,
            programItemId:element.programItemId,
            lmeId:this.selectedMarket.lmeId,          
            orderStatus:this.orderData != null ? this.orderData.status : true
        },
        position: {
          right: '0px'
        },
        panelClass: 'order-container-mobile' 
      });
  
      dialogRef.afterClosed().subscribe(result => {  
        if(result == true){
          this.loadOrderLineDetails(null,true);
        }
        
      },
      error=>{
        console.log('error');
      }
      
      );

    } 
    else {
    const dialogRef = this.dialog.open(ModalOrderpageComponent, {
      maxWidth: '1028px',
      minWidth:'1028px',
      data: {
          element:element,
          programID:this.selectedProgram.programID,
          tenantId:this.tenantId,
          assetPath:this.assetPath,
          userName:this.selectedUser.userName,
          programItemId:element.programItemId,
          lmeId:this.selectedMarket.lmeId,          
          orderStatus:this.orderData != null ? this.orderData.status : true
      },
      position: {
        right: '0px'
      },
      panelClass: 'order-container' 
    });

    dialogRef.afterClosed().subscribe(result => {  
      if(result == true){
        this.loadOrderLineDetails(null,true);
      }
      
    },
    error=>{
      console.log('error');
    }
    
    );
  }
}
}

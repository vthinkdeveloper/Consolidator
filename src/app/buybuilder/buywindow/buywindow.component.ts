import { Component, OnInit, ViewChild, TemplateRef , OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, FormControl } from '@angular/forms';

import { AppComponent } from '../../app.component';
import { AppCommonFunctions } from '../../services/common/app-common';

import { BuyWindowService } from '../services/buy-window.service';
import { AuthService } from '../../services/auth.service';
import { CompareStartEndDates, CannotContainOnlySpace } from '../../services/common/app-common';
import {createBuyWindow} from '../_models/buywindow'
import {MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ToastMessageComponent} from '../../toast-message/toast-message.component'
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
declare var $ : any
@Component({
  selector: 'app-buywindow',
  templateUrl: './buywindow.component.html',
  styleUrls: ['./buywindow.component.scss']
})
export class BuywindowComponent implements OnInit {
  @ViewChild('createBuyWindowTemplate') createBuyWindowTemplate: TemplateRef<any>;

  createBuyWindowSubscription: Subscription;
  isLoading = false;
  modalRef: BsModalRef;
  resourceMessage: any;
  minDate: Date;
  maxDate: Date;
  searchText = null;
  searchCategoryid = null;
  filterSelectedValue;
  selectedCategoryId = 0;
  submitButtonClicked = false;
  tabindex:string="0";
  status=['active','archived']
  createBuyWindowForm = this.formBuilder.group({
    buyWindowName: ['', Validators.required, CannotContainOnlySpace()],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  }, { validator: CompareStartEndDates("startDate", "endDate") });

  buywindowlistold:createBuyWindow[]=[]; 
  buywindowlist:createBuyWindow[]=[]; 
  activebuywindowlist:createBuyWindow[]=[];
  archivedbuywindowlist:createBuyWindow[]=[];
  filterarchivedbuywindow: createBuyWindow[]=[];
  archivedsavedlist: createBuyWindow[]=[];
  assetPath: string=environment.assetBasePath;
  dateCustomClasses: DatepickerDateCustomClasses[];
  isDataloaded: boolean=false;
  weekEnd = [];
  
  constructor(public datepipe: DatePipe,private router: Router,private _snackBar: MatSnackBar,private modalService: BsModalService, private _buyWindowService: BuyWindowService,
    private _authService: AuthService, private appComponent: AppComponent, public appCommonFunctions: AppCommonFunctions,
    private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.minDate = new Date();
    this.maxDate = new Date(this.minDate.getFullYear() + 25 + "-" + 12 + "-" + 31);
    this.dateCustomClasses = this.appCommonFunctions.applyWeekEndCustomColor();
    if(!this.appCommonFunctions.getResourceMessages()) {
      this.appComponent.getResouceMessage().subscribe(isResouceSuccessSuccess => {
        this.resourceMessage = this.appCommonFunctions.getResourceMessages();
      });
    } else {
      this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    }
    this.loadBuywindowlist(null, null);
  }

  /**
   * To load buy window list.
   * @param searchkey searchkey to search buywindow list
   * @param searchval search category value
   */
  loadBuywindowlist(searchkey,searchval){
  
    if(document.getElementById("Filtername") != null){
      document.getElementById("Filtername").innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
    document.getElementById("Filterid").innerHTML="0";
    this.filterSelectedValue = 0;
    }
    
      this.searchText = searchval;
      this.searchCategoryid = searchkey
      this.activebuywindowlist=[];
      this.archivedbuywindowlist=[];
      this.buywindowlist=[];
      this.isDataloaded=false;
      document.getElementById('loadingSpinnerContaineritem').style.display='block'
      let tenentId = this._authService.getUserToken().tenantId
      this._buyWindowService.getBuyWindowList(tenentId,searchkey,searchval).subscribe(data=>{
      this.isDataloaded=true;
      this.buywindowlist=data.result;
      if(this.buywindowlist.length == 0 &&(searchkey== null)){
        let rm=this.resourceMessage && this.resourceMessage['NoBuywindowWarning'];
        this.openSnackBar('',rm, 'warning');
      }

      this.activebuywindowlist = this.buywindowlist.filter(
        buywindow => buywindow.statusName.toLowerCase() === "active" || buywindow.statusName.toLowerCase() === "published" )

      this.archivedbuywindowlist = this.buywindowlist.filter(
          buywindow => buywindow.statusName.toLowerCase()  === "archived")
          this.archivedsavedlist = this.buywindowlist.filter(
            buywindow => buywindow.statusName.toLowerCase()  === "archived")
          this.appCommonFunctions.hideLoader('loadingSpinnerContaineritem');
      },
      (err) => {
        this.appCommonFunctions.hideLoader('loadingSpinnerContaineritem');
        this.openSnackBar('',err.error, 'error');
      });
  }

  /**
   * To open create window template.
   */
  openCreateWindowTemplate(template: TemplateRef<any>) {
    this.createBuyWindowForm.reset();
    this.modalRef = this.modalService.show(this.createBuyWindowTemplate, { class: 'modal-lg-size modal-terms-size'}); // To show confirm popup.
  }

  /**
   * To submit create buywindow form.
   */
  submitForm() {

    this.submitButtonClicked = true;
    if (!this.createBuyWindowForm.valid) {
      return
    }
    let tenentId = this._authService.getUserToken().tenantId
    let createwindowRequest = {
      startDate: this.convertDateToISO(this.createBuyWindowForm.controls['startDate'].value),
      endDate: this.convertDateToISO(this.createBuyWindowForm.controls['endDate'].value),
      buyWindowName: this.createBuyWindowForm.controls['buyWindowName'].value,
      createdBy: this._authService.getUserToken().userName
    }
    this.isLoading = true;
    this.createBuyWindowSubscription = this._buyWindowService.create(tenentId, createwindowRequest).subscribe(cardValue => {
      this.isLoading = false;
      this.submitButtonClicked = false;
      this.modalRef.hide();
      this.createBuyWindowForm.reset();
      this.loadBuywindowlist(null,null);
      let rms= this.resourceMessage && this.resourceMessage['BuySuccessMessage'];
      let msg= '<b>'+createwindowRequest.buyWindowName + '</b> <br> ' + rms;      
      this.openSnackBar(createwindowRequest.buyWindowName,rms, 'success');
      
    }, err => {
      this.isLoading = false;
      this.submitButtonClicked = false;
      this.modalRef.hide();
      this.openSnackBar('',err.error, 'error');
    });

  }

  /**
   * To open success and warning messages Indicators.
   * @param message Required message to display.
   * @param type Indicator types.
   */
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

  /**
   * To convert date to ISD.
   * @param event Selected date
   */
   convertDateToISO(event: any) {
    return this.datepipe.transform(event, 'YYYY-MM-ddTHH:mm:ss') + '.000Z'
  }

/**
  * To select category.
  * @param searchtxt searchtext for buywindow list
  * @param categoryid search category id
  */
  selectCategory(categoryname,id){    
    document.getElementById('categoryname').innerHTML=categoryname.currentTarget.textContent;
    document.getElementById('categoryid').innerHTML=id;
    this.selectedCategoryId = id;
  }
  

/**
  * To search buy-window-list.
  * @param searchtxt searchtext for buywindow list
  * @param categoryid search category id
  */
  search(searchtxt,categoryid){

    if(document.getElementById("Filtername") != null){
      document.getElementById("Filtername").innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
      document.getElementById("Filterid").innerHTML="0";
      this.filterSelectedValue = 0;
    }

    if(searchtxt == "" || searchtxt == " "){
      searchtxt=null;
      categoryid=null;
    }

    if(searchtxt != null){
      if (!searchtxt.replace(/\s/g, '').length) {
        searchtxt=null;
        categoryid=null;
      }
    }
    
    this.searchText = searchtxt;
    this.searchCategoryid = categoryid;
    this.loadBuywindowlist(categoryid,searchtxt);
  }
  
/**
  * To close popup.
  */
closePopup() {
  this.submitButtonClicked = false;
  this.modalRef.hide();
}

/**
  * To filter buy-window-list.
  * @param event dropdown select event
  * @param value dropdown selected category value
  * @param type  selected category type
  */
 getFilter(event, value, type){
    document.getElementById('loadingSpinnerContaineritem').style.display='block'
    if(event == 'index'){
      document.getElementById('Filtername').innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
      document.getElementById('Filterid').innerHTML = "0";
    }
    else{
      document.getElementById('Filtername').innerHTML=event.currentTarget.textContent;
    }
    
    document.getElementById('Filterid').innerHTML=value;
    this.filterSelectedValue = value;
    var date1 = new Date();
    var date2 = new Date();
    //this.filterarchivedbuywindow = this.archivedbuywindowlist;
    if(this.archivedbuywindowlist.length == 0){
      this.archivedbuywindowlist=this.archivedsavedlist;
    }
    this.filterarchivedbuywindow =[];
    let origanlarray=[...this.archivedsavedlist];
    if(type != 'none'){
    origanlarray.forEach(buy=>{
      var date2= new Date(buy.createdDate);
      if(type == 'days') {           
        // To calculate the time difference of two dates
        var Difference_In_Time = date1.getTime() - date2.getTime();
          
        // To calculate the no. of days between two dates
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        if(Math.round(Difference_In_Days) <= value){
          this.filterarchivedbuywindow.push(buy);
        }
      }
      else if(type == 'months'){
        let mdiff= this.monthDiff(date2,date1)
        if(mdiff <= value){
          this.filterarchivedbuywindow.push(buy);
        }
      }
      else if(type == 'years'){
        if(date2.getFullYear() == value){
          this.filterarchivedbuywindow.push(buy);
        }
      }
      
    })
  }
  else {
    this.filterarchivedbuywindow=this.archivedsavedlist;
  }
  this.archivedbuywindowlist=this.filterarchivedbuywindow;
  document.getElementById('loadingSpinnerContaineritem').style.display='none'  
 }

 /**
  * To calculate difference between dates.
  * @param d1 date1
  * @param d1 date2
  */
 monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

/**
  * To create new buy window.
  * @param event change event
  */
tabchange(event){
  this.tabindex=event;
 
}

changefilter(index){
  if(index == 1){
    this.getFilter('index',0,'none');
  }
}

redirect(event){
  event.preventDefault();
  let url=`program-order/`
  localStorage.setItem("orderData", null);
  //console.log(url);
  this.router.navigate([url]);
  $('html,body').animate({scrollTop:0});

}

redirectDashboard(event){
  event.preventDefault();
  localStorage.setItem("orderData", null);
  let url=`program-dashboard/`
    
  //console.log(url);
  this.router.navigate([url]);
  $('html,body').animate({scrollTop:0});
    
}
  
/**
  * Purpose - Unsubscribe state subscriptions.
  */
ngOnDestroy() {
  if (this.createBuyWindowSubscription) {
    this.createBuyWindowSubscription.unsubscribe();
  }
}


}

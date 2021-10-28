import { Component, OnInit, ViewChild,EventEmitter, Output, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppCommonFunctions } from '../../services/common/app-common';
import {animate, state, style,transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createBuyWindow } from '../../buybuilder/_models/buywindow';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {DashboardService} from '../services/dashboard.service'
import {ProgramOrderDetails} from '../_model/programOrderDetails'
import {AuthService} from '../../services/auth.service'
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs/dist/exceljs.min.js';
import { DatePipe } from '@angular/common';
import { AppComponent } from '../../app.component';
//import * as Workbook from "exceljs/dist/exceljs.min.js";

@Component({
  selector: 'app-program-dashboard',
  templateUrl: './program-dashboard.component.html',
  styleUrls: ['./program-dashboard.component.scss'],
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
export class ProgramDashboardComponent implements OnInit {
  
  assetPath: string=environment.assetBasePath;
  buywindowlist: any[];
  public resourceMessage: any;
  dataSource: any;
  selectedElement: any;
  noOfPages = 1;
  selectedPage = 1;
  startIndex = 0;
  endIndex = 0;
  itemListLength = 0;
  displayedColumns: string[] = [
    'buyWindowName',
    'startDate',
    'buyWindowId',
    'arrow',
  ];
  status=['active','archived']
  unFilteredbuywindowlist: createBuyWindow[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() tabchange = new EventEmitter<string>();

  //to do
  buywindowlistold:createBuyWindow[]=[]; 

  programOrderDetails:ProgramOrderDetails[]=[]

  //buywindowlist:createBuyWindow[]=[]; 
  activeprogramOrderDetails:ProgramOrderDetails[]=[];
  completedprogramOrderDetails:ProgramOrderDetails[]=[];

  filtercompletedlist: ProgramOrderDetails[]=[];
  filtersavedlist: ProgramOrderDetails[]=[];
  isloaded:boolean=false;
  searchText = null;
  searchCategoryid = null;
  isDataloaded:boolean=false;
  
  marketDetails:any[]=[];
  selectedMarket:any;
  showFilterIcons:boolean=false;

  filterSelectedValue;
  filterSelectedType:string;

 // assetPath: string=environment.assetBasePath;

  constructor(private datePipe:DatePipe,public appCommonFunctions: AppCommonFunctions, private _dashboardService:DashboardService,
    private _authService:AuthService, private appComponent: AppComponent) { }

  ngOnInit(): void {
    if(!this.appCommonFunctions.getResourceMessages()) {
      this.appComponent
      .getResouceMessage()
      .subscribe((isResouceSuccessSuccess) => {
        this.resourceMessage = this.appCommonFunctions.getResourceMessages();
        this.loadMarket();
      });
    } else {
      this.resourceMessage = this.appCommonFunctions.getResourceMessages();
      this.loadMarket();
    }
    //this.ngOnChanges();
    this.isloaded=false;
    this.activeprogramOrderDetails=[];
    this.loadOrderList(null);
  }

   /**
   * To load order list.
   * @param searchval search category value
   */
  loadOrderList(searchval, lmeid?:string, filterperiod?:string,filtertype?:string){
    // if(document.getElementById("Filtername") != null){
    //   document.getElementById("Filtername").innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
    //   document.getElementById("Filterid").innerHTML="0";
    //   this.filterSelectedValue = 0;
    // }

    // if(document.getElementById("marketname") != null && searchval){
    //   document.getElementById("marketname").innerHTML=this.resourceMessage && this.resourceMessage['FilterMarketlbl']
    //   document.getElementById("Filterid").innerHTML="0";
    //   this.filterSelectedValue = 0;
    // }
      document.getElementById('loadingSpinnerContainerdashboard').style.display='block'
      let tenentId = this._authService.getUserToken().tenantId
      let username= this._authService.getUserToken().userName
      this._dashboardService.getOrderDetails(tenentId,username,searchval,lmeid==undefined?null:lmeid,filterperiod == undefined?null:filterperiod,filtertype==undefined?null:filtertype).subscribe(data=>{
      this.isDataloaded=true;
      this.programOrderDetails=data.result;
      
      // if(this.buywindowlist.length == 0 &&(searchkey== null)){
      //   let rm=this.resourceMessage && this.resourceMessage['NoBuywindowWarning'];
      //   //this.openSnackBar(rm, 'warning');
      // }
      this.isloaded=true;

      this.filtersavedlist=this.programOrderDetails;

      this.activeprogramOrderDetails = this.programOrderDetails.filter(
        order => order.isActive)

      this.completedprogramOrderDetails = this.programOrderDetails.filter(
          order => !order.isActive)

      this.appCommonFunctions.hideLoader('loadingSpinnerContainerdashboard');

      },
      (err) => {
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerdashboard');
       // this.openSnackBar(err.error.message, 'error');
      });
  }

  showFilterIconsClicked(){
    this.showFilterIcons = !this.showFilterIcons
  }

  loadMarket(){
    let tenentId = this._authService.getUserToken().tenantId
    if(JSON.parse(sessionStorage.getItem('ConsolidatorConfig'))) {
      let hierarchyLevel = JSON.parse(
        sessionStorage.getItem('ConsolidatorConfig')
      )['hierarchyLevel'];
      this.appCommonFunctions.showLoader('loadingSpinnerContainerdashboard');
      this._dashboardService.getAllMarketsForUser(tenentId,hierarchyLevel).subscribe(data=>{
        this.marketDetails=data.result;
        this.marketDetails = this.marketDetails.sort((a,b) => a.clientId > b.clientId ? 1 : -1)
        //this.selectedMarket=this.marketDetails[0]
      },
      (err) => {
        this.appCommonFunctions.hideLoader('loadingSpinnerContainerdashboard');
      });
    }
  }

  selectMarket(element,searchval){
    document.getElementById('loadingSpinnerContainerdashboard').style.display='block'
   
    this.selectedMarket=element
    if(searchval == "")
    searchval=null;
    if(element == null){
      this.loadOrderList(searchval, null,this.filterSelectedValue, this.filterSelectedType)
      document.getElementById('marketname').innerHTML=this.resourceMessage && this.resourceMessage['FilterMarketlbl'];
      document.getElementById('marketid').innerHTML=null;
    }
    else{
      document.getElementById('marketname').innerHTML=element.clientId;
      document.getElementById('marketid').innerHTML=element.lmeId;
      this.loadOrderList(searchval, this.selectedMarket.lmeId,this.filterSelectedValue,this.filterSelectedType)
    }
    // if(document.getElementById("Filtername") != null){
    //   document.getElementById("Filtername").innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
    //   document.getElementById("Filterid").innerHTML="0";
    //   this.filterSelectedValue = 0;
    // }
  }

  downloadReport(event){
    event.preventDefault();
    let activeProgramdataForExcel=[];
    let completeProgramdataForExcel=[];
    let activeProgramexport:ProgramOrderDetails[]=[];
    let completeProgramexport:ProgramOrderDetails[]=[];
    this.activeprogramOrderDetails.forEach(item=>{

      let buwindowname:string=item.buyWindowName +'\n'+this.datePipe.transform(item.startDate, 'MM-dd-yyyy')+'-'+this.datePipe.transform(item.endDate);
      const excelitem: ProgramOrderDetails={        
        programName: item.programName,
        buyWindowName : buwindowname,
        itemCount: item.itemCount,
        quantity: item.quantity,
        totalCost: item.totalCost
      } 
      activeProgramexport.push(excelitem);
    });
    activeProgramexport.forEach((row: any) => {
      activeProgramdataForExcel.push(Object.values(row))
    })


    this.completedprogramOrderDetails.forEach(item=>{

      let buwindowname:string=item.buyWindowName +'\n'+this.datePipe.transform(item.startDate, 'MM-dd-yyyy')+'-'+this.datePipe.transform(item.endDate);
      const excelitem: ProgramOrderDetails={        
        programName: item.programName,
        buyWindowName : buwindowname,
        itemCount: item.itemCount,
        quantity: item.quantity,
        totalCost: item.totalCost
      } 
      completeProgramexport.push(excelitem);
    });
    completeProgramexport.forEach((row: any) => {
      completeProgramdataForExcel.push(Object.values(row))
    })

    let activeReportData ;
    let completeReportData ;
    let header=["Programs","BuyWindow","Items","Total Qty","Total Cost"]
    activeReportData = {
        title: 'ProgramOrder',
        data: activeProgramdataForExcel,
        headers: (header)
      }

      completeReportData = {
        title: 'ProgramOrder',
        data: completeProgramdataForExcel,
        headers: (header)
      }

      this.exportExcel(activeReportData,completeReportData)  
  }

  exportExcel(activeProgramdataForExcel,completeProgramdataForExcel) {
    //Title, Header & Data
    const title = activeProgramdataForExcel.title;
    const header = activeProgramdataForExcel.headers;
    const activedata = activeProgramdataForExcel.data;
    const completeddata=completeProgramdataForExcel.data;
  
    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet;// = workbook.addWorksheet('Sheet1','Sheet2');
   // worksheet=Workbook.addWorksheet('Sheet2')
   
   const sheetNames = ["Active Programs", "Completed Programs"];
   sheetNames.forEach(sheetName => {
    worksheet = workbook.addWorksheet(sheetName);
    // I believe this needs to be set to show in LibreOffice.
    worksheet.state = 'visible';
    let headerRow = worksheet.addRow(header);
    
    // Adding Data with Conditional Formatting
    if(sheetName == 'Active Programs' && activedata){
      activedata.forEach(d => {
        let row = worksheet.addRow(d);    
      }
      );
    }
    if(sheetName == 'Completed Programs' && completeddata){
      completeddata.forEach(d => {
        let row = worksheet.addRow(d);    
      }
      );
    }
    worksheet.getColumn(3).width = 20;
    worksheet.addRow([]);
  });

    //Adding Header Row
    
    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, title + '.xlsx');
    })
  
   }

   search(txtsearchval){
    // if(document.getElementById("Filtername") != null){
    //   document.getElementById("Filtername").innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
    //   document.getElementById("Filterid").innerHTML="0";
    //   this.filterSelectedValue = 0;
    // }
    // if(document.getElementById("marketname") != null){
    //   document.getElementById("marketname").innerHTML=this.resourceMessage && this.resourceMessage['FilterMarketlbl']
    //   document.getElementById("Filterid").innerHTML="0";
    //   this.filterSelectedValue = 0;
    // }
    if(txtsearchval == ""){
      txtsearchval=null;
    }
    if(txtsearchval == "" || txtsearchval == " "){
      txtsearchval=null;
    }

    if(txtsearchval != null){
      if (!txtsearchval.replace(/\s/g, '').length) {
        txtsearchval=null;
      }
    }
    this.loadOrderList(txtsearchval,(this.selectedMarket== undefined ? null :this.selectedMarket.lmeId), this.filterSelectedValue,this.filterSelectedType);
   }

   
/**
  * To filter buy-window-list.
  * @param event dropdown select event
  * @param value dropdown selected category value
  * @param type  selected category type
  */
 getFilter(event, value, type,searchval){
  document.getElementById('loadingSpinnerContainerdashboard').style.display='block'

  document.getElementById('Filtername').innerHTML=event.currentTarget.textContent;
  document.getElementById('Filterid').innerHTML=value;
  this.filterSelectedValue = value;
  this.filterSelectedType= type;

  if(searchval == "")
  searchval=null;

  this.loadOrderList(searchval,(this.selectedMarket== undefined ? null :this.selectedMarket.lmeId),this.filterSelectedValue,this.filterSelectedType)

  // if(document.getElementById("marketname") != null){
  //   document.getElementById("marketname").innerHTML=this.resourceMessage && this.resourceMessage['FilterMarketlbl']
  //   document.getElementById("Filterid").innerHTML="0";
  //   this.filterSelectedValue = 0;
  // }

  // var date1 = new Date();
  // var date2 = new Date();
  // //this.filterarchivedbuywindow = this.archivedbuywindowlist;
  // if(this.programOrderDetails.length == 0){
  //   this.programOrderDetails=this.filtersavedlist;
  // }
  // this.filtercompletedlist =[];
  // if(type != 'none'){
  // this.programOrderDetails.forEach(buy=>{
  //   var date2= new Date(buy.startDate);
  //   if(type == 'days') {           
  //     // To calculate the time difference of two dates
  //     var Difference_In_Time = date1.getTime() - date2.getTime();
        
  //     // To calculate the no. of days between two dates
  //     var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  //     if(Math.round(Difference_In_Days) <= value){
  //       this.filtercompletedlist.push(buy);
  //     }
  //   }
  //   else if(type == 'months'){
  //     let mdiff= this.monthDiff(date2,date1)
  //     if(mdiff <= value){
  //       this.filtercompletedlist.push(buy);
  //     }
  //   }
  //   else if(type == 'years'){
  //     if(date2.getFullYear() == value){
  //       this.filtercompletedlist.push(buy);
  //     }
  //   }
    
//   })
// }
// else {
//   this.filtercompletedlist=this.filtersavedlist;
// }
// this.programOrderDetails=this.filtercompletedlist;
// this.activeprogramOrderDetails = this.programOrderDetails.filter(
//   order => order.isActive)

// this.completedprogramOrderDetails = this.programOrderDetails.filter(
//     order => !order.isActive)
// document.getElementById('loadingSpinnerContaineritem').style.display='none'  
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

getElementLoading(){
  const loadingElement = document.getElementById('loadingSpinnerContainerdashboard').style.display;;
  if (loadingElement == 'block') {
    return false;
  } else {
    return true;
  }
}

}

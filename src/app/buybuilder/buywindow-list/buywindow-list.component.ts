import { Component,Input,OnInit ,Output, ViewChild,EventEmitter, AfterViewInit, OnChanges, TemplateRef } from '@angular/core';
import {animate, state, style,transition, trigger } from '@angular/animations';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { BuyWindowService } from '../services/buy-window.service';
import { AuthService } from '../../services/auth.service';
import { createBuyWindow } from '../_models/buywindow';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppComponent } from '../../app.component';
import { AppCommonFunctions } from '../../services/common/app-common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmPopupComponent } from '../../confirm-popup/confirm-popup.component';
import {ViewModelComponent} from '../../view-model/view-model.component'
import { popupSection } from '../../services/common/app-common';
import { popupViewData } from '../../services/common/app-common';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ToastMessageComponent} from '../../toast-message/toast-message.component'
import {ProgramDetails} from '../../programbuilder/_models/program'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
declare var $ : any
@Component({
  selector: 'app-buywindow-list',
  templateUrl: './buywindow-list.component.html',
  styleUrls: ['./buywindow-list.component.scss'],
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
export class BuywindowListComponent implements OnInit, OnChanges, AfterViewInit {

  // @ViewChild('archiveElement') archiveConfirmRef: TemplateRef<any>;
  programDetails:ProgramDetails[]=[]; 
  @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent ; 
  @ViewChild(ViewModelComponent) viewPopup: ViewModelComponent ; 
  @ViewChild('ViewDetailsTemplate') ViewDetailsTemplate: TemplateRef<any>;
  constructor( public dialog: MatDialog,private _snackBar: MatSnackBar,private router: Router,private _buyWindowService: BuyWindowService, private _authService: AuthService, private appComponent: AppComponent,
    public appCommonFunctions: AppCommonFunctions,private modalService: BsModalService,
  ) {}

  displayedColumns: string[] = [
    'recent',
    'buyWindowName',
    'startDate',
    'buyWindowId',
    'arrow'    
  ];

  @Input() status: string;
  @Input() assetPath: string;
  @Output() tabchange = new EventEmitter<string>();
  @Output() callBuyWindowList = new EventEmitter<string>();
  @Output() filterperiod = new EventEmitter<string>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() searchText;
  @Input() searchCategoryid;

  public resourceMessage: any;
  rows: any = [];
  @Input() buywindowlist: createBuyWindow[];
  @Input() activebuywindowlist: createBuyWindow[] = [];
  @Input() archivedbuywindowlist: createBuyWindow[] = [];
  dataSource: any;
  @Input() unFilteredbuywindowlist: createBuyWindow[];
  modalRef: BsModalRef;
  selectedArchiveElement: any;
  selectedViewElement:any;
  isloaded:boolean=false;
  popupDataObject: popupSection;
  popupViewData :popupViewData;

  selectedElement: any;
  noOfPages = 1;
  selectedPage = 1;
  startIndex = 0;
  endIndex = 0;
  itemListLength = 0;
  rights:any;
  canDelete:boolean=false;
  canPublishRole:boolean=false;
  ngOnInit() {
    if(!this.appCommonFunctions.getResourceMessages()) {
      this.appComponent
      .getResouceMessage()
      .subscribe((isResouceSuccessSuccess) => {
        this.resourceMessage = this.appCommonFunctions.getResourceMessages();
      });
    } else {
      this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    }

    this.rights= localStorage.getItem('rights');
    if(this.rights && ((typeof this.rights) === 'string')) {
      this.rights=this.rights.split(',')
      if(this.rights && (this.rights instanceof Array) && (this.rights.includes('ConsolidatorProgramBuilderInternalAdmin') || this.rights.includes('ConsolidatorProgramBuilderAdmin'))){
        this.canDelete=true;
      }
      if(this.rights && (this.rights instanceof Array) && this.rights.includes('ConsolidatorProgramBuilderCreator')){
        this.canPublishRole=true;
      }
    }
  }

  ngOnChanges() {
    this.startIndex = 1;
    this.selectedPage = 1;
    this.buywindowlist = this.buywindowlist.map(item => {
         item['isExpanded'] = 'false';
      return item;
    });
    this.dataSource=[];
    this.dataSource = new MatTableDataSource<createBuyWindow>(this.buywindowlist);
    if(this.buywindowlist.length >0)
      this.isloaded=true;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) =>
    {
      if(typeof data[sortHeaderId] === 'string' || data[sortHeaderId] instanceof String){
        return data[sortHeaderId].toLocaleLowerCase();
      }
      return data[sortHeaderId];
    }
    if (this.sort) {
      this.sort.direction = '';
    }
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.itemListLength = this.buywindowlist.length;
    // let expand=document.getElementsByClassName("expanded");
    // if(expand.length>0)
    //   expand[0].classList.remove("expanded");
    this.setPaginationChanges();
  }

 

  setPaginationChanges() {
    this.startIndex = 1;
    this.selectedPage = 1;
    this.noOfPages =Math.floor(this.itemListLength / 10);

    if (this.itemListLength < 10) {
      this.noOfPages = 1;
    }

    if (this.itemListLength > 10 && this.itemListLength % 10 !== 0) {
      this.noOfPages = this.noOfPages + 1;
    }
    if (this.noOfPages >= 6) {
      this.endIndex = 5;
    } else {
      this.endIndex = this.noOfPages;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    //if(document.getElementById("Filtername") != null){
      // document.getElementById("Filtername").innerHTML=this.resourceMessage && this.resourceMessage['Filterlbl']
      // document.getElementById("Filtername").innerHTML="0";
      this.filterperiod.next(tabChangeEvent.index.toString());
    //}
   this.changeTabPagination(tabChangeEvent.index)
   this.tabchange.next(tabChangeEvent.index.toString())
   
  }

  changeTabPagination(tabId) {
    this.selectedPage = 1;
    if (this.unFilteredbuywindowlist.length) {
      if (tabId === 0) {
        this.itemListLength = this.activebuywindowlist.length;
      } else {
        this.itemListLength = this.archivedbuywindowlist.length;
      }

      this.setPaginationChanges();
    }
    this.changePage(this.selectedPage);
  }


  checkItemExpanded(element): boolean {
    if (this.selectedElement && this.selectedElement.buyWindowId === element.buyWindowId){
      element.isExpanded = true
      return true;
    }
    element.isExpanded = false
    return false;
  }


  setExpandedElement(element) {
    if(!this.selectedElement){
      this.selectedElement = element;
      element.isExpanded = true
      return
    }
    if(this.selectedElement && this.selectedElement.buyWindowId === element.buyWindowId){
      this.selectedElement = null;
      element.isExpanded = false;
      return
    }
    element.isExpanded = true
    this.selectedElement = element;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  sortbyname() {
    this.dataSource.sort = this.sort;
    // this.rows= this.rows.sort((a,b) => a.buyWindowName.localeCompare(b.buyWindowName))
    // this.dataSource=new MatTableDataSource<createBuyWindow>(this.rows);
    this.dataSource.paginator = this.paginator;
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

  openArchivePopup(element: any){
    this.selectedArchiveElement = element;
    this.popupDataObject = new popupSection();
    this.popupDataObject.type = 'buy window'
    this.popupDataObject.selectedItem = this.selectedArchiveElement.buyWindowName;
    this.popupDataObject.title = this.resourceMessage && this.resourceMessage['Archivelbl'];
    this.popupDataObject.okButtonTitle = this.resourceMessage && this.resourceMessage['Archivelnk'];
    this.popupDataObject.cancelButtonTile = this.resourceMessage && this.resourceMessage['ArchiveCancel'];;
    this.confirmPopup.openPopup();
  }

  ngAfterViewInit() {
    this.changeTabPagination(0);
    // let expand=document.getElementsByClassName("expanded");
    // if(expand.length>0)
    //   expand[0].classList.remove("expanded");
  }

  cancelArchive() {
    this.selectedArchiveElement = null;
  }

  nextClicked() {
    if (this.endIndex === this.noOfPages) {
      return;
    }
    this.startIndex = this.startIndex + 5;
    if (this.endIndex + 5 > (this.noOfPages)) {
      this.endIndex = this.noOfPages;
    } else {
      this.endIndex = this.endIndex + 5;
    }
    this.changePage(this.startIndex);
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

  archiveApi() {
    document.getElementById('loadingSpinnerContaineritem').style.display='block'
    let tenentId = this._authService.getUserToken().tenantId
    this._buyWindowService.archiveBuyWindow(tenentId, this.selectedArchiveElement.buyWindowId).subscribe(data=>{
      let rms= this.resourceMessage && this.resourceMessage['BuyArchiveMessage'];
      let msg= '<b>'+this.selectedArchiveElement.buyWindowName+ '</b> <br>' + rms;
      this.openSnackBar(this.selectedArchiveElement.buyWindowName,rms, 'success');
      this.callBuyWindowList.next();
      this.confirmPopup.cancelClicked();
      }, (err) => {
        document.getElementById('loadingSpinnerContainerprogram').style.display='none';
        this.openSnackBar('',err.error, 'error');
      });
  }

  callbuy(event){
    this.isloaded=false;
    this.setExpandedElement(event);
    this.callBuyWindowList.next();
    
  }

  reloadBuywindow(event){
    event.preventDefault();
    this.callBuyWindowList.next();
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

  addProgram(event, element){
    event.preventDefault();
   // localStorage.setItem("buywindowname", element.buywindowName);
    //localStorage.setItem("buywindowid", element.buywindowId);
    let buywindowdata={
      buywindowName: element.buyWindowName,
      buywindowId : element.buyWindowId,
      endDate : element.endDate,
      startDate:element.startDate
    }
    localStorage.removeItem('adminProgramData');
    localStorage.removeItem('isAdminCompleteProgram');
    localStorage.setItem('buywindowData', JSON.stringify(buywindowdata));

    let url=`create-program/`
    
    //console.log(url);
    this.router.navigate([url]);
    $('html,body').animate({scrollTop:0});
    //let detailsrow= <HTMLElement> document.getElementsByClassName('cal-meeting');
  }

  view(buywindowName,buywindowId){
    localStorage.removeItem('adminProgramData');
    localStorage.removeItem('isAdminCompleteProgram');
    localStorage.setItem("buywindowname", buywindowName);
    localStorage.setItem("buywindowid", buywindowId);
    let url=`create-program/`
    
    //console.log(url);
    this.router.navigate([url]);
  }

  

  publish(buywindowId,buywindowName) {
    document.getElementById('loadingSpinnerContaineritem').style.display='block';
    let tenentId = this._authService.getUserToken().tenantId;    
    this._buyWindowService.publish(tenentId,buywindowId).subscribe(data=>{ 
      //console.log(data)
      let rms= this.resourceMessage && this.resourceMessage['PublishSuccess'];
      let msg= '<b>'+buywindowName+ '</b> <br>' + rms;
      this.openSnackBar(buywindowName,rms, 'success');
      this.callBuyWindowList.next();
   }, (err) => {
      document.getElementById('loadingSpinnerContainerprogram').style.display='none';
      this.openSnackBar('',err.error, 'error');
    });
  }

  getElementLoading(){
    const loadingElement = document.getElementById('loadingSpinnerContaineritem').style.display;;
    if (loadingElement == 'block') {
      return false;
    } else {
      return true;
    }
  }
    

     loadProgramName(){
      let tenentId = this._authService.getUserToken().tenantId;    
      if(this.searchCategoryid === 1 || this.searchText === ''){
        this.searchText=null;
        this.searchCategoryid =null;
      }
      this._buyWindowService.getBuyWindowProgramsById(tenentId,this.selectedViewElement.buyWindowId, this.searchCategoryid, this.searchText).subscribe(data=>{      
        this.programDetails=data.result;
      });
     }

    openDialog(element): void { 
      this.selectedViewElement=element;
      const dialogRef = this.dialog.open(ViewModelComponent, {
        disableClose: false,
        width: '60%',
        data: {
            buyWindowName : this.selectedViewElement.buyWindowName,
            buywindowID: this.selectedViewElement.buyWindowId,
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


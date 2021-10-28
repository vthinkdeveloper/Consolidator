import { Component,Input,OnInit ,Output, ViewChild,EventEmitter, AfterViewInit, OnChanges, TemplateRef } from '@angular/core';
import {animate, state, style,transition, trigger } from '@angular/animations';
import { BuyWindowService } from '../../buybuilder/services/buy-window.service';
import { AuthService } from '../../services/auth.service';
import { createBuyWindow } from '../../buybuilder/_models/buywindow';
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
import {MatDialog} from '@angular/material/dialog';
import {ProgramOrderDetails} from '../_model/programOrderDetails'
declare var $ : any
@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss'],
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

export class ProgramListComponent implements OnInit, OnChanges, AfterViewInit {

  // @ViewChild('archiveElement') archiveConfirmRef: TemplateRef<any>;
 
  @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent ; 
  @ViewChild(ViewModelComponent) viewPopup: ViewModelComponent ; 
  @ViewChild('ViewDetailsTemplate') ViewDetailsTemplate: TemplateRef<any>;
  constructor( public dialog: MatDialog,private _snackBar: MatSnackBar,private router: Router,private _buyWindowService: BuyWindowService, private _authService: AuthService, private appComponent: AppComponent,
    public appCommonFunctions: AppCommonFunctions,private modalService: BsModalService,
  ) {}

  displayedColumns: string[] = [
    'programName',
    'buyWindowName',
    'itemCount',
    'quantity',
    'totalCost',
    'programId',
  ];

  displayedColumnsMobile: string[] = [
    'programName',
    'qty',
    'cost',
    'programId'
  ];

  @Input() status: string;
  @Input() assetPath: string;
  @Output() tabchange = new EventEmitter<string>();
  @Output() callBuyWindowList = new EventEmitter<string>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() searchText;
  @Input() searchCategoryid;

  public resourceMessage: any;
  rows: any = [];
  @Input() programorderlist: ProgramOrderDetails[];
  
  @Input() activeprogramorderlist: ProgramOrderDetails[] = [];
  @Input() completedprogramOrderDetails: ProgramOrderDetails[] = [];
  dataSource: any;
  @Input() unFilteredbuywindowlist: ProgramOrderDetails[];
  modalRef: BsModalRef;
  selectedArchiveElement: any;
  selectedViewElement:any;
  
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
  showFilterIcons:boolean=false;

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
    //document.getElementById('loadingSpinnerContaineritem').style.display='block';    
  }

  ngOnChanges() {
   // document.getElementById('loadingSpinnerContaineritem').style.display='block';
    this.startIndex = 1;
    this.selectedPage = 1;

    this.dataSource = new MatTableDataSource<ProgramOrderDetails>(this.programorderlist);
    // if(this.programorderlist.length >0)
    //   this.isloaded=true;
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
    this.itemListLength = this.programorderlist.length;
    this.setPaginationChanges();
    //if(this.programorderlist.length)
    //  document.getElementById('loadingSpinnerContaineritem').style.display='none';
  }

  setPaginationChanges() {
    this.startIndex = 1;
    this.selectedPage = 1;
    this.noOfPages = Number(this.itemListLength / 10);

    if (this.itemListLength < 10) {
      this.noOfPages = 1;
    }

    if (this.itemListLength > 10 && this.itemListLength % 10 !== 0) {
      this.noOfPages = this.noOfPages + 1;
    }
    if (this.noOfPages > 5) {
      this.endIndex = 5;
    } else {
      this.endIndex = this.noOfPages;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
   this.changeTabPagination(tabChangeEvent.index)
   this.tabchange.next(tabChangeEvent.index.toString())
   
  }

  changeTabPagination(tabId) {
    this.selectedPage = 1;
    if (this.unFilteredbuywindowlist.length) {
      if (tabId === 0) {
        this.itemListLength = this.unFilteredbuywindowlist.filter(
          (buywindow) => buywindow.isActive
        ).length;
      } else {
        this.itemListLength = this.unFilteredbuywindowlist.filter(
          (buywindow) => !buywindow.isActive
        ).length;
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

  ngAfterViewInit() {
    this.changeTabPagination(0);
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


  openSnackBar(message, type) {   
    this._snackBar.openFromComponent(ToastMessageComponent,{
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type],
      data: {
        html: message,
        type:type,
        assetpath:this.assetPath
      }
    });
  }

  editOrder(event, element){
    event.preventDefault();
   // localStorage.setItem("buywindowname", element.buywindowName);
    //localStorage.setItem("buywindowid", element.buywindowId);
    let orderData={
      programID: element.programId,
      userName : this._authService.getUserToken().userName,
      programName:element.programName,
      status:element.isActive
    }

    localStorage.setItem('orderData', JSON.stringify(orderData));

    let url=`program-order/`
    
    //console.log(url);
    this.router.navigate([url]);
    $('html,body').animate({scrollTop:0});
    //let detailsrow= <HTMLElement> document.getElementsByClassName('cal-meeting');
  }

    

     loadProgramName(){
      let tenentId = this._authService.getUserToken().tenantId;    
      if(this.searchCategoryid === 1 || this.searchText === ''){
        this.searchText=null;
        this.searchCategoryid =null;
      }
      this._buyWindowService.getBuyWindowProgramsById(tenentId,this.selectedViewElement.buyWindowId, this.searchCategoryid, this.searchText).subscribe(data=>{      
        this.programorderlist=data.result;
      });
     }

    openDialog(element): void { 
      this.selectedViewElement=element;
      const dialogRef = this.dialog.open(ViewModelComponent, {
        width: '100%',
        maxHeight: '90vh',
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

    getElementLoading(){
      const loadingElement = document.getElementById('loadingSpinnerContainerdashboard').style.display;;
      if (loadingElement == 'block') {
        return false;
      } else {
        return true;
      }
    }

    isToolTipExists(id) {
      let element = document.getElementById(id);
      if(element && (element.scrollHeight > element.clientHeight)) {
          return  element.id;
      }
      return ''
    }

}

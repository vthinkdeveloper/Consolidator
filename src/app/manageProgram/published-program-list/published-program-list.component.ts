import { Component, OnInit, Input, Output,EventEmitter,ViewChild } from '@angular/core';
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
import {ProgramOrderDetails} from '../../programDashboard/_model/programOrderDetails'
import { flatten } from '@angular/compiler';

@Component({
  selector: 'app-published-program-list',
  templateUrl: './published-program-list.component.html',
  styleUrls: ['./published-program-list.component.scss'],
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
export class PublishedProgramListComponent implements OnInit {

  constructor(private router: Router, private _authService: AuthService, private appComponent: AppComponent,
    public appCommonFunctions: AppCommonFunctions,private modalService: BsModalService,) { }

    displayedColumns: string[] = [
      'programName',
      'buyWindowName',
      'itemCount',
      'userCount',
      'locations',
      'programId',
    ];
    displayedColumnsMobile: string[] = [
      'programName',
      'userCount',
      'locations',
      'programId',
    ];
    @Input() status: string;
  @Input() assetPath: string;
  @Output() tabchange = new EventEmitter<string>();
  @Output() callBuyWindowList = new EventEmitter<string>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() programlist: ProgramOrderDetails[];
  
  @Input() activeprogramlist: ProgramOrderDetails[] = [];
  @Input() completedprogramDetails: ProgramOrderDetails[] = [];
  @Input() unFilteredprogramlist: ProgramOrderDetails[];
  dataSource: any;
  public resourceMessage: any;
  noOfPages = 1;
  selectedPage = 1;
  startIndex = 0;
  endIndex = 0;
  itemListLength = 0;
  rights:any;
  canModify:boolean=false;
  canView:boolean=false;
  ngOnInit(): void {
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
      if((this.rights.includes('ConsolidatorProgramBuilder') || this.rights.includes('ConsolidatorProgramBuilderAdmin') || this.rights.includes('ConsolidatorProgramBuilderInternalAdmin')) && this.rights.includes('ConsolidatorAdmin')){
        this.canModify=true;
      }
      if(!(this.rights.includes('ConsolidatorProgramBuilder') || this.rights.includes('ConsolidatorProgramBuilderAdmin') || this.rights.includes('ConsolidatorProgramBuilderInternalAdmin')) && this.rights.includes('ConsolidatorAdmin')){
        this.canView=true;
      }
    }
  }

  ngOnChanges() {
    // document.getElementById('loadingSpinnerContaineritem').style.display='block';
     this.startIndex = 1;
     this.selectedPage = 1;
 
     this.dataSource = new MatTableDataSource<ProgramOrderDetails>(this.programlist);
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
     this.itemListLength = this.programlist.length;
     this.setPaginationChanges();
     //if(this.programorderlist.length)
     //  document.getElementById('loadingSpinnerContaineritem').style.display='none';
   }

  sortbyname(){
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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

  changeTabPagination(tabId) {
    this.selectedPage = 1;
    if (this.unFilteredprogramlist.length) {
      if (tabId === 0) {
        this.itemListLength = this.unFilteredprogramlist.filter(
          (buywindow) => buywindow.isActive
        ).length;
      } else {
        this.itemListLength = this.unFilteredprogramlist.filter(
          (buywindow) => !buywindow.isActive
        ).length;
      }

      this.setPaginationChanges();
    }
    this.changePage(this.selectedPage);
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
  isToolTipExists(id) {
    let element = document.getElementById(id);
    if(element && (element.scrollHeight > element.clientHeight)) {
        return  element.id;
    }
    return ''
  }

  getElementLoading(){
    const loadingElement = document.getElementById('loadingSpinnerContainerProgram').style.display;;
    if (loadingElement == 'block') {
      return false;
    } else {
      return true;
    }
  }
  
  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.changeTabPagination(tabChangeEvent.index)
    this.tabchange.next(tabChangeEvent.index.toString())
    
   }
  
   modifyElement(element) {
    localStorage.removeItem('adminProgramData');
    localStorage.removeItem('isAdminCompleteProgram');
    localStorage.setItem('adminProgramData', JSON.stringify(element));
    element.buywindowId = element.buyWindowId
    delete element.buyWindowId;
    localStorage.setItem('buywindowData', JSON.stringify(element));
    let url=`create-program/`
    //console.log(url);
    this.router.navigate([url]);
   }

   viewElement(element) {
    localStorage.setItem('adminProgramData', JSON.stringify(element));
    localStorage.setItem('isAdminCompleteProgram', JSON.stringify(true));
    let buywindowdata={
      buywindowName: element.buyWindowName,
      buywindowId : element.buyWindowId,
      endDate : element.endDate,
      programID: element.programID,
      programIndex: element.programIndex,
      startDate:element.createdDate
    }
    localStorage.setItem('buywindowData', JSON.stringify(element));
    let url=`create-program/`
    //console.log(url);
    this.router.navigate([url]);
   }
}

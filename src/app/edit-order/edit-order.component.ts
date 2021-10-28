import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createBuyWindow } from '../buybuilder/_models/buywindow';
import {CurrencyPipe} from '@angular/common';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../programOrder/services/order.service';
import { AppCommonFunctions } from '../services/common/app-common';
import { OrderLineData } from '../programOrder/_model/OrderLineData';
import { HtmlAstPath } from '@angular/compiler';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {animate, state, style,transition, trigger } from '@angular/animations';
import { environment } from 'src/environments/environment';
import { NumberonlywithoutdotsDirective } from '../numberonlywithoutdots.directive';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss'],
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

export class EditOrderComponent implements OnInit {
  public resourceMessage: any;
  constructor(private currency: CurrencyPipe,
    private _orderService:OrderService,      
    private _authService:AuthService,
   public appCommonFunctions: AppCommonFunctions,private _location: Location,
   private route: ActivatedRoute,
   private router: Router,
   public dialogRef: MatDialogRef<EditOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private el: ElementRef) { }
   noOfPages = 1;
   selectedPage = 1;
   startIndex = 0;
   endIndex = 0;
   itemListLength = 0;
   dataSource: any;
   txtqtyvalue=0;
   unitprice:number=0;
   assetPath: string=environment.assetBasePath;
   orderLineData:OrderLineData[]=[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['companyName', 'quantity', 'totalCost'];
  orderData: any;

  ngOnInit(): void {

    this.orderData=JSON.parse(localStorage.getItem('orderData'));;

    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    // if (window.history.state && window.history.state.element) {
    //   this.data = window.history.state;
    // } else {
      let tenentId = this._authService.getUserToken().tenantId;

    // this.appCommonFunctions.getRoles(tenentId).subscribe(data=>{    
    //   localStorage.setItem('rights',data)
    //   let url=`buywindow/`
    //   this.router.navigate([url]);
    // });
  }

  ngAfterViewInit() {
    this.unitprice = this.data && this.data.element && this.data.element.unitPrice;
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    this.loadShippingDetails(null);  
  }

  loadShippingDetails(searchval){
    this._orderService.GetOrderLineShippingDetails(this.data.tenantId,this.data.userName,this.data.programID,this.data.programItemId,this.data.lmeId,searchval,!this.data.orderStatus).subscribe(data=>{
      // console.log(data.result)
       
       this.orderLineData=data.result;
       console.log(this.orderLineData)       
       this.orderLineData.forEach(function(arr,index){
         if(arr.quantity == undefined){
           arr.quantity="0";
         }
         if(arr.totalCost == undefined){
           arr.totalCost="0";
         }
       });
       this.orderLineData = this.orderLineData.sort((a,b) => (a.companyName.toLowerCase()  >  b.companyName.toLowerCase()) ? 1 : -1);
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
       this.dataSource.sort = this.sort;
       this.dataSource.paginator = this.paginator;
       this.itemListLength = this.orderLineData.length;
       this.setPaginationChanges();
        let element = document.getElementById('example-container')
        if(element) {
          element.style.height = "calc(100vh - 300px)"
        }
       document.getElementById('loadingSpinnerContainerOrder').style.display='none'
     })
  }

  restrictInputCharcters(event) {
    setTimeout(() => {
      event.target.value = event.target.value.replace(/[^0-9]/g, '')
    }, 100)
  }

  showItemList() {
    if((this.dataSource && this.dataSource && this.dataSource.data.length>0)){
      if((this.orderData && this.orderData.status === false) && (this.data.element.quantity  === 0)) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  setPaginationChanges() {
    this.startIndex = 1;
    this.selectedPage = 1;
    this.noOfPages = Number(this.itemListLength / 8);

    if (this.itemListLength < 8) {
      this.noOfPages = 1;
    }

    if (this.itemListLength > 8 && this.itemListLength % 8 !== 0) {
      this.noOfPages = this.noOfPages + 1;
    }
    if (this.noOfPages > 5) {
      this.endIndex = 5;
    } else {
      this.endIndex = this.noOfPages;
    }
  }

  search(searhvalue){
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    this.loadShippingDetails(searhvalue == ""? null: searhvalue)
  }

  removeDots($event) {
    if($event.key==='.'){
      $event.preventDefault();
    }
  }

  removeSpecialCharacters($event) {
    $event.value = $event.value.replace(/[^0-9]/g, '');
  }

  updateqty(id,type,index){
    let qty:number;
    qty= parseInt((document.getElementById('txtqty'+id) as HTMLInputElement).value); 
    if(!isNaN(qty)){
      if(type=='minus'){
        if(qty >= 1){
          qty--;
        }
        (<HTMLInputElement>document.getElementById('txtqty'+id)).value = qty.toString();
        (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((qty*this.unitprice).toString());
        this.dataSource.data.forEach(element => {
          if(element.lmeId === id) {
            element.quantity = qty;
            element.totalCost=(qty*this.unitprice);
          }
        });
        (<HTMLElement> document.getElementById('totalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
        (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
      }
      else if(type=='add'){
          qty++;
          (<HTMLInputElement>document.getElementById('txtqty'+id)).value = qty.toString();
          (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((qty*this.unitprice).toString());
          this.dataSource.data.forEach(element => {
            if(element.lmeId === id) {
              element.quantity = qty;
              element.totalCost=(qty*this.unitprice);
            }
          });
          (<HTMLElement> document.getElementById('totalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
          (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
      }
      else {     
          (<HTMLInputElement>document.getElementById('txtqty'+id)).value = qty.toString();
          (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((qty*this.unitprice).toString());
          this.dataSource.data.forEach(element => {
            if(element.lmeId === id) {
              element.quantity = qty;
              element.totalCost=(qty*this.unitprice);
            }
          });
          (<HTMLElement> document.getElementById('totalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
          (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
      }
    }
    else{
      (<HTMLInputElement>document.getElementById('txtqty'+id)).value = "0";
      (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((0*this.unitprice).toString());
      this.dataSource.data.forEach(element => {
        if(element.lmeId === id) {
          element.quantity = 0;
          element.totalCost=(0*this.unitprice);
        }
      });
      (<HTMLElement> document.getElementById('totalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
      (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
    }
     
  }
  sortbyname() {
    this.dataSource.sort = this.sort;
    // this.rows= this.rows.sort((a,b) => a.buyWindowName.localeCompare(b.buyWindowName))
    // this.dataSource=new MatTableDataSource<createBuyWindow>(this.rows);
    this.dataSource.paginator = this.paginator;
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
  savechanges(){
    document.getElementById('loadingSpinnerContainerOrder').style.display='block'
    // let arryadata=[];
    // arryadata=this.dataSource;
    // console.log(this.dataSource);
    // const QtygreaterZero=this.dataSource.data.filter((row:any) => {
    //   return row.quantity > 0
    // })
    //console.log(QtygreaterZero);
    const myData = this.dataSource.data.map((row: any) => {
      return {id: row.lmeId, qty: row.quantity}
    });
    const result = myData.map(obj => `<LMEIds><LMEData><ProgramItemId>${this.data.element.programItemId}</ProgramItemId><Qty>${obj.qty}</Qty><LMEId>${obj.id}</LMEId></LMEData></LMEIds>`).join('')
    // console.log(result);

    let createOrderRequest = {      
      createdBy: this._authService.getUserToken().userName,
      ProgramID: this.data.programID,
      CreatedFor:this.data.userName,
      OrderLineData: result
    }

    this._orderService.CreateOrder(this.data.tenantId,this.data.programID,createOrderRequest).subscribe(data=>{
      document.getElementById('loadingSpinnerContainerOrder').style.display='none';
      this.dialogRef.close(true);
    })

  }

  isCompanyToolTipExists(element) {
    let elementId = document.getElementById(element.companyName);
    if(elementId && (elementId.scrollHeight > elementId.clientHeight)) {
        return  element.companyName;
    }
    return ''
  }

  isContactToolTipExists(element) {
    let elementId = document.getElementById(element.contactName);
    if(elementId && (elementId.scrollHeight > elementId.clientHeight)) {
        return element.contactName;
    }
    return ''
  }

  isAddressToolTipExists(element) {
    let elementId = document.getElementById(element.lmeId);
    if(elementId && (elementId.scrollHeight > elementId.clientHeight)) {
        return element.addressLine1+' '+element.addressLine2+' '+
              element.city +' '+element.state+' '+element.postalCode;
    }
    return ''
  }

  clear(){
    let txtqty=document.getElementsByClassName('txtqty');
    for(let j=0; j< txtqty.length; j++){
       
      (txtqty[j] as HTMLInputElement).value="0"   ;
    }  

    this.dataSource.data.forEach(element => {
      element.quantity=0;
    });
  }

  cancelchanges(){
    this.dialogRef.close(false);
  }

  closeModel(){
    this.dialogRef.close(false);
  }

  

}

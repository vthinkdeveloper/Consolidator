import { Component, OnInit,Inject,ViewChild, ChangeDetectorRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createBuyWindow } from '../../buybuilder/_models/buywindow';
import {CurrencyPipe} from '@angular/common';
import { AuthService } from '../../services/auth.service';
import {OrderService} from '../services/order.service';
import { AppCommonFunctions } from '../../services/common/app-common';
import {OrderLineData} from '../_model/OrderLineData';
import { NumbersOnlyInputDirective } from '../../numbers-only-input.directive';

@Component({
  selector: 'app-modal-orderpage',
  templateUrl: './modal-orderpage.component.html',
  styleUrls: ['./modal-orderpage.component.scss']
})
export class ModalOrderpageComponent implements OnInit {
  public resourceMessage: any;
  constructor(private currency: CurrencyPipe,
     private _orderService:OrderService,      
     private _authService:AuthService, 
     public dialogRef: MatDialogRef<ModalOrderpageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public appCommonFunctions: AppCommonFunctions,private cdRef: ChangeDetectorRef) { }
    noOfPages = 1;
    selectedPage = 1;
    startIndex = 0;
    endIndex = 0;
    itemListLength = 0;
    dataSource: any;
    txtqtyvalue=0;
    unitprice:number=0;
    tooltipdata:string="Here is the tooltip"
    orderLineData:OrderLineData[]=[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['companyName', 'contactName', 'addressLine1', 'quantity', 'totalCost'];
  ngOnInit(): void {
    this.resourceMessage = this.appCommonFunctions.getResourceMessages();
    this.cdRef.detectChanges();
  }
  ngAfterViewInit() {
    this.unitprice=this.data.element.unitPrice;
    this.appCommonFunctions.showLoader('loadingSpinnerContainerOrderpopup');
    this.loadShippingDetails(null);  
    this.cdRef.detectChanges();
  }

  loadShippingDetails(searchval){
    this._orderService.GetOrderLineShippingDetails(this.data.tenantId,this.data.userName,this.data.programID,this.data.programItemId,this.data.lmeId,searchval,!this.data.orderStatus).subscribe(data=>{
      // console.log(data.result)
    
       this.orderLineData=data.result;
       this.cdRef.detectChanges();
       //console.log(this.orderLineData)       
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
       this.itemListLength = this.orderLineData.length;
       this.setPaginationChanges();
       this.setScrollBarHeight();
       setTimeout(() => {
        let element = document.querySelector('.order-container') as HTMLElement;
        if(element){
          element.style.minWidth = '70vw'
          this.setScrollBarHeight();
          this.cdRef.detectChanges();
        }
      }, 100);
       this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrderpopup');
      //  var message_lines = document.getElementsByClassName(".addressline")[0].getClientRects();
      //  console.log(message_lines.length);

     })
  }

  setScrollBarHeight() {
   let topHeadingRow = document.getElementById('elementrow');
   let topHeadingRowHeight = topHeadingRow && topHeadingRow.getBoundingClientRect() && topHeadingRow.getBoundingClientRect().height ? topHeadingRow.getBoundingClientRect().height : 0;
   let addressLabel = document.getElementById('selectedAddLbl');
   let addressLabelHeight = addressLabel && addressLabel.getBoundingClientRect() && addressLabel.getBoundingClientRect().height ? addressLabel.getBoundingClientRect().height : 0;
   let searchinputbox = document.getElementById('searchinputbox');
   let searchinputboxHeight = searchinputbox && searchinputbox.getBoundingClientRect() && searchinputbox.getBoundingClientRect().height ? searchinputbox.getBoundingClientRect().height : 0;
   let elementsHeight =  topHeadingRowHeight + addressLabelHeight + searchinputboxHeight;
   let containerRow = document.getElementById('containerrow');
   if(containerRow)
   containerRow.style.maxHeight = `calc(100vh - ${elementsHeight.toString()}px)`
   this.cdRef.detectChanges();
  }

  sortbyname() {
    this.dataSource.sort = this.sort;
    // this.rows= this.rows.sort((a,b) => a.buyWindowName.localeCompare(b.buyWindowName))
    // this.dataSource=new MatTableDataSource<createBuyWindow>(this.rows);
    this.dataSource.paginator = this.paginator;
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
    this.appCommonFunctions.showLoader('loadingSpinnerContainerOrderpopup');
    if(searhvalue == "" || searhvalue == " "){
      searhvalue=null;
    }

    if(searhvalue != null){
      if (!searhvalue.replace(/\s/g, '').length) {
        searhvalue=null;
      }
    }
    this.loadShippingDetails(searhvalue == ""? null: searhvalue)
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
        this.dataSource.data[index].quantity=qty;
        this.dataSource.data[index].totalCost=(qty*this.unitprice);
        (<HTMLElement> document.getElementById('TotalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
        (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
        //console.log(foundIndex)
        // this.elementRef.nativeElement.dispatchEvent(new CustomEvent('change', { bubbles: true }));
      }
      else if(type=='add'){
       // if(qty<availableqty){
          qty++;
          (<HTMLInputElement>document.getElementById('txtqty'+id)).value = qty.toString();
          (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((qty*this.unitprice).toString());
          this.dataSource.data[index].quantity=qty;
          this.dataSource.data[index].totalCost=(qty*this.unitprice);
          (<HTMLElement> document.getElementById('TotalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
          (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
          //}
      }
      else{
        //if(qty<=availableqty){          
          (<HTMLInputElement>document.getElementById('txtqty'+id)).value = qty.toString();
          (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((qty*this.unitprice).toString());
          this.dataSource.data[index].quantity=qty;
          this.dataSource.data[index].totalCost=qty*this.unitprice;
          (<HTMLElement> document.getElementById('TotalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
          (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
        //}  
        
      }
    }
    else{
      (<HTMLInputElement>document.getElementById('txtqty'+id)).value = "0";
      (<HTMLElement> document.getElementById('totalcost'+id)).innerHTML=this.currency.transform((0*this.unitprice).toString());
      this.dataSource.data[index].quantity=0;
      this.dataSource.data[index].totalCost=0*this.unitprice;
      (<HTMLElement> document.getElementById('TotalAmount')).innerHTML=this.currency.transform(this.dataSource.data.reduce((prev,next)=>prev+Number(next.totalCost),0));
      (<HTMLElement> document.getElementById('TotalQTY')).innerHTML=(this.dataSource.data.reduce((prev,next)=>prev+Number(next.quantity),0));
    }
     
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

  // sortbyname() {
  //   // dataSource.sort = this.sort;
  //   // // this.rows= this.rows.sort((a,b) => a.buyWindowName.localeCompare(b.buyWindowName))
  //   // // this.dataSource=new MatTableDataSource<createBuyWindow>(this.rows);
  //   // this.dataSource.paginator = this.paginator;
  // }

  savechanges(){
    this.appCommonFunctions.showLoader('loadingSpinnerContainerOrderpopup');
    const myData = this.dataSource.data.map((row: any) => {
      return {id: row.lmeId, qty: row.quantity}
    });
    const result = myData.map(obj => `<LMEIds><LMEData><ProgramItemId>${this.data.element.programItemId}</ProgramItemId><Qty>${obj.qty == undefined ? 0 : obj.qty}</Qty><LMEId>${obj.id}</LMEId></LMEData></LMEIds>`).join('')
   
    let createOrderRequest = {      
      createdBy: this._authService.getUserToken().userName,
      ProgramID: this.data.programID,
      CreatedFor:this.data.userName,
      OrderLineData: result
    }

    this._orderService.CreateOrder(this.data.tenantId,this.data.programID,createOrderRequest).subscribe(data=>{
      //console.log(data);
      this.appCommonFunctions.hideLoader('loadingSpinnerContainerOrderpopup');
      this.dialogRef.close(true);
    })

  }

  clear(){
    let txtqty=document.getElementsByClassName('txtqty');
    for(let j=0; j< txtqty.length; j++){
       
      (txtqty[j] as HTMLInputElement).value="0"   ;
    } 
    
    let totalcost=document.getElementsByClassName('totalcostspan');
    for(let j=0; j< totalcost.length; j++){
       
      (totalcost[j] as HTMLElement).innerHTML=this.currency.transform(0);
    }  

    (<HTMLElement> document.getElementById('TotalAmount')).innerHTML=this.currency.transform(0);
        (<HTMLElement> document.getElementById('TotalQTY')).innerHTML ="0"

    this.dataSource.data.forEach(element => {
      element.quantity=0;
      element.totalCost=0;
    });
  }
  cancelchanges(){
    this.dialogRef.close(false);
  }

  closeModel(){
    this.dialogRef.close(false);
  }


  isaddressToolTipExists(element){
    let elementId = document.getElementById(element.lmeId);
    if(elementId && (elementId.scrollHeight > elementId.clientHeight)) {
      return element.addressLine1+' '+element.addressLine2+' '+element.city +' '+element.state+', '+element.postalCode;
    }
    return ''
  }

  iscontactToolTipExists(element){
    let elementId = document.getElementById(element.contactName);
    if(elementId && (elementId.scrollHeight > elementId.clientHeight)) {
      return element.contactName;
    }
    return ''
  }

  iscompanyToolTipExists(element){
    let elementId = document.getElementById(element.companyName);
    if(elementId && (elementId.scrollHeight > elementId.clientHeight)) {
      return element.companyName;
    }
    return ''
  }

  fireevent(event)
  {
    var e1=document.getElementsByClassName("addressline")
    var e2=document.getElementsByClassName("cdk-column-addressLine1")
    if(e1.length>0)
    {
      for (let index = 0; index < e1.length; index++) {       
        if(e1[index].scrollHeight > e1[index].clientHeight){
        }
        else
        {
          e2[index].removeAttribute('data-title');
        }
      }
    }
  }   
}

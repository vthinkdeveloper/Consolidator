import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {OrderLineAPIResponse} from '../_model/response/OrderLineResponse'
import {OrderDetail} from '../_model/OrderDetail'

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  apiUrl: string;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }
  GetProgramsByUser(tenantId:any, buywindowID:number=0){
    const url = `${this.apiUrl}${tenantId}/programsbyuser/${buywindowID}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  GetOrderUsers(tenantId:any, programID:any){
    const url=`${this.apiUrl}${tenantId}/orderusers/${programID}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  GetUserMarkets(tenantId:any,programID:any,username:string,hierarchyLevel:string){
    const url=`${this.apiUrl}${tenantId}/usermarkets/${username}/${programID}/${hierarchyLevel}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  GetOrderLineDetails(tenantId:any, username:string, programID:any, searchval:string, lmeid:any): Observable<OrderLineAPIResponse> {
    const url = `${this.apiUrl}${tenantId}/orderlinedetails/${username}/${programID}/${encodeURIComponent(searchval)}/${lmeid}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  GetOrderLineShippingDetails(tenantId:any, username:string, programID:any,programItemID:any,lmeID:any, searchval:string, isactive:boolean): Observable<OrderLineAPIResponse> {
    const url = `${this.apiUrl}${tenantId}/orderlineshipping/${username}/${programID}/${programItemID}/${lmeID}/${encodeURIComponent(searchval)}/${isactive}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  CreateOrder(tenantId:any, programid:any, createOrderRequest:OrderDetail){
    const url=`${this.apiUrl}${tenantId}/order/${programid}/create`;
    return this.http.post<boolean>(url,createOrderRequest).pipe(catchError(this.handleError));
  }

   /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
    private handleError(error: any) {
      return throwError(error);
    }
}

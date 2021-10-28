import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  apiUrl: string;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  getOrderDetails(tenantId: any,username:string,searchval:string, lmeid:any,filterperiod:string, filtertype:string){
    const url = `${this.apiUrl}${tenantId}/orderdetails/${username}/${encodeURIComponent(searchval)}/${filterperiod}/${filtertype}/${lmeid}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  getAllMarketsForUser(tenantId: any, hierarchyLevel:string){
    const url = `${this.apiUrl}${tenantId}/markets/${hierarchyLevel}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
   private handleError(error: any) {
    return throwError(error);
  }

}

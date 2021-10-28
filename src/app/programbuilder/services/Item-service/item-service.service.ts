import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ItemServiceService {
  apiUrl: string;
  
  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  /**
   * To create new buy window.
   * @param tenantId tenantId value
   * @param createBuyWindowRequest create buy window request
   */
  getItemList(tenantId: any)  {
    const url = `${this.apiUrl}${tenantId}/tenantitem`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  } 

  createItem(tenantId: any,programId:any, createItemRequest) {
    const url = `${this.apiUrl}${tenantId}/programitem/${programId}/add`;
    return this.http.post<any>(url, createItemRequest).pipe(catchError(this.handleError));
  }

  getItemListByProgramId(tenantId: any, programId: any)  {
    const url = `${this.apiUrl}${tenantId}/programitem/${programId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  } 

  editItem(tenantId: any,programId:any, editItemRequest) {
    const url = `${this.apiUrl}${tenantId}/programitem/${programId}/update`;
    return this.http.post<any>(url, editItemRequest).pipe(catchError(this.handleError));
  }

  CopyItemToProgram(tenantId: any,fromprogramId:any,toprogramId:any, copyfromexist){
    const url = `${this.apiUrl}${tenantId}/copyprogramitem/${fromprogramId}/${toprogramId}`;
    return this.http.post<any>(url, copyfromexist).pipe(catchError(this.handleError));
  }

  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
  private handleError(error: any) {
    return throwError(error);
  }
}

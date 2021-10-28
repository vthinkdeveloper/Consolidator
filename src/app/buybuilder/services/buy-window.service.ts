import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment'
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { createBuyWindow } from '../_models/buywindow';
import {BuywindowApiResponse} from '../_models/response/buywindowApiResponse'
import {ProgramDeatilsApiResponse} from '../../programbuilder/_models/response/programDetailsApiResponse'

@Injectable({
  providedIn: 'root'
})
export class BuyWindowService {
  apiUrl: string;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  /**
   * To create new buy window.
   * @param tenantId tenantId value
   * @param createBuyWindowRequest create buy window request
   */
  create(tenantId: any,createBuyWindowRequest: createBuyWindow)  {
    const url = `${this.apiUrl}${tenantId}/buywindow/add`;
    return this.http.post<boolean>(url, createBuyWindowRequest).pipe(catchError(this.handleError));
  } 

  getBuyWindowList(tenantId:any,searchkey:any,searchval:any) : Observable<BuywindowApiResponse> {
    const url = `${this.apiUrl}${tenantId}/buywindows/${searchkey}/${encodeURIComponent(searchval)}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  getAllPublishedBuyWindows(tenantId) {
    const url = `${this.apiUrl}${tenantId}/publishedbuywindows`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  archiveBuyWindow(​​​​​​​​tenantId:any, buywindowId: any) {
    const url = `${this.apiUrl}${tenantId}/buywindow/archive/${​​​​​​​​buywindowId}`;
    return this.http.post<any>(url, null).pipe(catchError(this.handleError));
  }

  getBuyWindowProgramsById(tenantId:any, buywindowId: any, searchkey:any, searchval:any) : Observable<ProgramDeatilsApiResponse> {
    const url = `${this.apiUrl}${tenantId}/buywindow/programs/${buywindowId}/${searchkey}/${encodeURIComponent(searchval)}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  publish(tenantId:any, buywindowId: any){
    const url = `${this.apiUrl}${tenantId}/buywindow/publish/${​​​​​​​​buywindowId}`;
    return this.http.post<any>(url, null).pipe(catchError(this.handleError));
  }

  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
  private handleError(error: any) {
    return throwError(error);
  }
}

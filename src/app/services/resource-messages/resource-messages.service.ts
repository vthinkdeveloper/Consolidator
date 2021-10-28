import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResourceMessagesService {
  apiUrl: string;
  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  getResourceMessages(businessId: any): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${environment.resourceMessageUrl}ResourceMessages?BusinessUnitId=${businessId}&Group=ConsolidatorV2&locale=en`;
    return this.http.get(url);
  }

  getThemeApiResponse(tenantId:any): Observable<any>{
    const url = `${this.apiUrl}${tenantId}/styles`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  getConfigs(tenantId:any): Observable<any>{
    const url = `${this.apiUrl}${tenantId}/configs`;
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { UserList } from '../assign-users.component';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  apiUrl: string;
  constructor(private http: HttpClient) {
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  getProgramUsers(tenantId:any,programId: string) {
    const url = `${this.apiUrl}${tenantId}/programusers/${programId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  searchUsers(tenantId:any, searchUserRequest: any) {
    const url = `${this.apiUrl}${tenantId}/tenantusers`;
    return this.http.post<any>(url, searchUserRequest).pipe(catchError(this.handleError));
  }

  addUsers(tenantId:any,programId: string,addUserRequest: UserList[]) {
    const url = `${this.apiUrl}${tenantId}/programusers/${programId}/add`;
    return this.http.post<any>(url, addUserRequest).pipe(catchError(this.handleError));
  }

  getUserGroups(tenantId:any) {
    const url = `${this.apiUrl}${tenantId}/usergroups`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  getHierarchy(tenantId:any) {
    const url = `${this.apiUrl}${tenantId}/hierarchy`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  getHierarchyForProgram(tenantId:any,programId: string,hierarchyLevel: any) {
    const url = `${this.apiUrl}${tenantId}/hierarchy/${hierarchyLevel}/${programId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  addProgramLocations(tenantId:any,programId: string,addLocations: any) {
    const url = `${this.apiUrl}${tenantId}/programlocations/${programId}/add`;
    return this.http.post<any>(url, addLocations).pipe(catchError(this.handleError));
  }

  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
  private handleError(error: any) {
    return throwError(error);
  }
}

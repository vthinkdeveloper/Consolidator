import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ProgramDetails } from '../_models/program';
import {ProgramDeatilsApiResponse} from '../_models/response/programDetailsApiResponse'

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  apiUrl: string;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }
  /**
   * To create new buy window.
   * @param tenantId tenantId value
   * @param createProgramRequest create buy window request
   */
   create(tenantId: any,createProgramRequest: ProgramDetails)  {
    const url = `${this.apiUrl}${tenantId}/program/add`;
    return this.http.post<ProgramDeatilsApiResponse>(url, createProgramRequest).pipe(catchError(this.handleError));
  }
  
  delete(tenantId: any,programID: string)  {
    const url = `${this.apiUrl}${tenantId}/program/${programID}/delete`;
    return this.http.delete<boolean>(url).pipe(catchError(this.handleError));
  }

  getProgramDetailsById(tenantId:any,programID: string ){
    const url = `${this.apiUrl}${tenantId}/program/${programID}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  update(tenantId: any,createProgramRequest: ProgramDetails, programID:any)  {
    const url = `${this.apiUrl}${tenantId}/program/${programID}/update`;
    return this.http.post<ProgramDeatilsApiResponse>(url, createProgramRequest).pipe(catchError(this.handleError));
  }

  cloneProgram(tenantId:any,programID:any){
    const url = `${this.apiUrl}${tenantId}/program/clone/${programID}`;
    return this.http.post<ProgramDeatilsApiResponse>(url,programID).pipe(catchError(this.handleError));
  }

  
  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
   private handleError(error: any) {
    return throwError(error);
  }
}

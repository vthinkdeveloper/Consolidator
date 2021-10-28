import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ProgramDetails } from '../../programbuilder/_models/program'
import {ProgramDeatilsApiResponse} from '../../programbuilder/_models/response/programDetailsApiResponse'


@Injectable({
  providedIn: 'root'
})
export class ManageProgramService {

  apiUrl: string;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  GetAllPublishedPrograms(tenantId:any, searchval:any){
    const url = `${this.apiUrl}${tenantId}/publishedprograms/${encodeURIComponent(searchval)}`;
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

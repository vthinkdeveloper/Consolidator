import { Injectable } from '@angular/core';
import { catchError, shareReplay } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppCommonFunctions } from 'src/app/services/common/app-common';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FormioService {

  baseUrl: string;
  formDefinitionCache = {};
  apiUrl: string;

   constructor(private httpClient: HttpClient, private appConstants: AppCommonFunctions, private _authService:AuthService) {
    // this.baseUrl = "https://formio.app-i.dev.brandmuscle.net"; // ToDo: Get from config
    this.baseUrl = environment.formioBaseUrl;
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  getFormDefinition(formkey: string): Observable<any> {
    const url = `${this.baseUrl}${formkey}`;
    return this.httpClient.get<string>(url);
    /*
    return this.httpClient.get(url).pipe(
      catchError(this.handleError)
    );
    */
  }

  updateTenantForm(formData: any, formKey: string) {
    const url = `${this.apiUrl}UpdateTenantForm?formKey=${formKey}&tenantId=${this._authService.getUserToken().tenantId}`;
    return this.httpClient.post(url, formData).pipe(catchError(this.handleError));
  }

  /**
   * Handle error responses from server.
   * @param error Error to wrapped inside observable
   */
  private handleError(error) {
    console.log(error);
    return throwError(error);
  }
}

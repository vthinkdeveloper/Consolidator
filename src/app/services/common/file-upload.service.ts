import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  apiUrl: string;
  public readonly imageNotAvailableBase64 = `${environment.azureBlobBaseURL}consolidator-default-uploads/images/ImageNotavailable.png`; ;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.consolidatorGatewayApiUrl;
  }

  upload(tenentId:string,formData: FormData, type:string) {

    // ToDo: Create Api and pass link from config.
    // const url = `/FileUpload/Upload?foldername=${foldername}&directoryName=${directoryName}`;
    const url = `${this.apiUrl}${tenentId}/Upload/${type}`;

    return this.http.post(url, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError(this.handleError));

  }

  downloadFile(tenentId:string,filename:string , type:string){
    const url = `${this.apiUrl}${tenentId}/DownloadFile/${filename}/${type}`;

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

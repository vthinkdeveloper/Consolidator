import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth token from the service.
        const authToken = this.authService.getAuthorizationHeaderValue();

        // Clone the request and replace the original headers with cloned headers, updated with the authorization.
        if (authToken) {
            request = request.clone({ setHeaders: { Authorization: authToken } });
        }

        // Send cloned request with header to the next handler.
        return next.handle(request);
    }
}

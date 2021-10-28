
import { AuthService } from '../services/auth.service';
import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanLoad, Route, Router } from '@angular/router';


@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

    canLoad(route: Route): boolean {
        return this._authService.isUserAuthenticated();
    }

    constructor(private _authService: AuthService, private router: Router) { }

    canActivate() {
        const token = this._authService.getUserToken();
        if (token != null && this._authService.isValidUserToken()) {
            return true;
        }
        else {
            this.router.navigate(['/home'], {
                queryParams: {
                    errorStatus: '401',
                    errorStatusText: 'Access Denied'
                }
            });
            return false; 
        }
        
    }
}


import { UserToken } from  '../_models/usertoken';
import { Injectable, Inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AuthService {

    private jwtHelper: JwtHelperService = new JwtHelperService();
    private tokenObserver = new Subject<any>();

    removeToken() {
        sessionStorage.removeItem('brandmuscle_token');
        sessionStorage.removeItem('consolidator_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('consolidatorLogin');
        sessionStorage.removeItem('configToken');
        sessionStorage.removeItem('consolidator_formkeys');
    }

    isUserAuthenticated(): boolean {
        if (this.getUserToken() != null) {
            return true;
        } else {
            return false;
        }
    }

    getAuthorizationHeaderValue(): string {
        let token = this.getOriginalUserToken();
        return `Bearer ${token}`;
    }

    getUserToken(): UserToken {
        const tokenObject = {
            token: '',
            isSucceded: false
        };
        const token = this.getOriginalUserToken();
        if (token != null && token.length > 0) {
            const tokenpayLoad = this.jwtHelper.decodeToken(token);
            if (tokenpayLoad != null) {
                const userToken: UserToken = new UserToken();

                    userToken.userId = tokenpayLoad['bmi.userid'];
                    userToken.displayName = tokenpayLoad['bmi.firstname'] + ' ' + tokenpayLoad['bmi.lastname'];
                    userToken.tenantId = tokenpayLoad['tenantid'];
                    userToken.permissions = this.getUserRights();
                    userToken.businessUnitId = tokenpayLoad['tenantbusinessunitid'];
                    userToken.locale = sessionStorage.getItem('locale') != null ?
                        sessionStorage.getItem('locale') : (tokenpayLoad['bmi.locale'] == null ? '' : tokenpayLoad['bmi.locale']);
                    userToken.isInternal = tokenpayLoad['bmi.isinternal'] == null ? '' : tokenpayLoad['bmi.isinternal'];
                    userToken.userName = tokenpayLoad['bmi.username'] == null ? '' : tokenpayLoad['bmi.username'];
                    userToken.expiry = tokenpayLoad['exp'] == null ? 0 : tokenpayLoad['exp'];
                    userToken.preapprovalAllowed = 'no'
                    userToken.brandingAllowed = 'no';
                    tokenObject.token = token;
                    tokenObject.isSucceded = true;
                    this.tokenObserver.next(tokenObject);
                
                return userToken;
            }
        }
        tokenObject.token = '';
        tokenObject.isSucceded = false;
        this.tokenObserver.next(tokenObject); // token observer for failure.
        return null as any;
    }

    getOriginalUserToken(): string {
         /*** token-key hardcoded for local use ***/
        // var token_key="eyJhbGciOiJSUzI1NiIsImtpZCI6IkVDMDkxMzZEM0QwRjgzQkNBRDc0NzFGREEzQzI4NjM1N0I4QzA3QTciLCJ0eXAiOiJKV1QiLCJ4NXQiOiI3QWtUYlQwUGc3eXRkSEg5bzhLR05YdU1CNmMifQ.eyJuYmYiOjE2MjUxMjc1MjgsImV4cCI6MTYyNTEzNDcyOCwiaXNzIjoiaHR0cHM6Ly9jc2cudjVkZXYuYnJhbmRtdXNjbGUubmV0L2FwaS92NW9pZGMvdjEiLCJhdWQiOlsiaHR0cHM6Ly9jc2cudjVkZXYuYnJhbmRtdXNjbGUubmV0L2FwaS92NW9pZGMvdjEvcmVzb3VyY2VzIiwiYnJhbmRtdXNjbGVhcGkiXSwiY2xpZW50X2lkIjoiQnJhbmRtdXNjbGUiLCJzdWIiOiI0NzU3MzcwIiwiYXV0aF90aW1lIjoxNjI1MTI3NTI3LCJpZHAiOiJsb2NhbCIsImJtaS51c2VyaWQiOiI0NjUyMDcwIiwiYm1pLnVzZXJuYW1lIjoiS2FybmEuS3VtYXJAYnJhbmRtdXNjbGUuY29tIiwiYm1pLmZpcnN0bmFtZSI6IkZOQU1FMzkwMjQiLCJibWkubGFzdG5hbWUiOiJMTkFNRTM5MDI0IiwiYm1pLmlzaW50ZXJuYWwiOiJUcnVlIiwiYm1pLmVtYWlsIjoiS2FybmEuS3VtYXJAYWxsc3RhdGUuY29tIiwiYm1pLmxvY2FsZSI6ImVuIiwidGVuYW50aWQiOiJjYW1wYXJpYW1lcmljYSIsInRlbmFudGJ1c2luZXNzdW5pdGlkIjoiNTcwIiwianRpIjoiNTRiNDE1ZTQyZDFkYWY4MDJlNWNiYWJmNjAxMmM1ZTciLCJzY29wZSI6WyJvcGVuaWQiLCJidXNpbmVzc3VuaXQiLCJwcm9maWxlIiwidGVuYW50aWQiXSwiYW1yIjpbInB3ZCJdfQ.ZOQODrHHpKXxWGrrv0xfydEJVPadGoSkS2lrUKrMyt2j9ukoSIy2yPlHJiApmv0LYxNVi4jI7gLKmtZsz_PFpC9JCKTzEnNzP0msF6ceYSYmvBFrs-OD8PW9DuL0Cp3-ixf2YJ2MIlDep237iF7ho_JzE2tWPrFLUj7l5jmuCrbSZKhk1Ffgksl2ndy22euO6G8yOIkuO8mwmiH_09IMwWOjKLzTp9JeH1eHp_IJbG4GdSvisqtTzUm1JLtcLXgV3JrGsEwGvblkwnFwaPeNWlTfea0_fdb8SaabaWZN1wAfPvfo7AnYnYFcEV3o9jjd8InamKj1SsnPQc2H2DQP8Q"
        // sessionStorage.setItem('brandmuscle_token', token_key);

        // //get the sessionStorage token value from application for DEV, QA, STAGE, PROD        
        return sessionStorage.getItem('brandmuscle_token') || '{}';
    }

    

    

    // Tenant Configuration changes
    saveConfigurationToken(token: string) {
        sessionStorage.setItem('configToken', token);
    }    

    saveUserRights(encodedRights: string) {
        sessionStorage.setItem('rights', encodedRights);
    }

    removeConfigToken() {
        sessionStorage.removeItem('configToken');
    }

    removeTenantFormKeys() {
        sessionStorage.removeItem('consolidator_formkeys');
    }

    removeUserRights() {
        sessionStorage.removeItem('rights');
    }

    getUserRights() {
        const encodedRightsString = sessionStorage.getItem('rights');

        if (encodedRightsString != null && encodedRightsString !== 'undefined') {
            const decodedRightsString = atob(encodedRightsString);

            return decodedRightsString.split(',');
        } else {
            return [];
        }
    }

    isValidUserToken(): boolean {
        const usrToken = this.getUserToken();

        if (usrToken.businessUnitId == null || usrToken.businessUnitId.length === 0
             || usrToken.userId == null || usrToken.userId.length === 0
            || usrToken.locale == null || usrToken.locale.length === 0
            || usrToken.userName == null || usrToken.userName.length === 0
            || usrToken.businessUnitId == null || usrToken.businessUnitId.length === 0
            || usrToken.isInternal == null || usrToken.isInternal.length === 0
            || (Date.now() / 1000 > usrToken.expiry)) {
            return false;
        } else {
            return true;
        }

    }

    /**
     * Purpose - To create a new Observable for token api.
     * @returns ()
     *   created observer
     */
     getToken(): Observable<any> {
        return this.tokenObserver.asObservable();
    }
}

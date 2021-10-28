
import { Injectable, Inject } from '@angular/core';
import { UserManager, User, UserManagerSettings } from 'oidc-client';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

declare var Keycloak: any;
declare var LoginServiceType:string;
@Injectable()
export class LoginService {
    
    static auth: any = {};
    LoginServiceType ="v5openid";
    
    static init(): Promise<any> {


            const settings: UserManagerSettings = {
                authority: environment.oidcAuthority,
                client_id: 'Brandmuscle',
                redirect_uri: environment.oidcRedirectUrl,
                post_logout_redirect_uri: environment.oidcRedirectUrl,
                response_type: 'token',
                scope: 'authcookie businessunit profile tenantid',
                silent_redirect_uri: '',
                automaticSilentRenew: true,
                accessTokenExpiringNotificationTime: 10,
                filterProtocolClaims: true,
                loadUserInfo: false,
                prompt: 'login',
            };

            const mgr: UserManager = new UserManager(settings);

            LoginService.auth.loggedIn = false;
            let user:User;
            return new Promise<void>((resolve, reject) => {
                if (sessionStorage.getItem('consolidatorLogin') == null || sessionStorage.getItem('consolidatorLogin') !== 'true') {
                    this.signIn(mgr, settings);
                } else if (sessionStorage.getItem('_token') === 'undefined' || sessionStorage.getItem('brandmuscle_token') == null) {
                    mgr.signinRedirectCallback()
                        .then((user) => {
                            sessionStorage.setItem('brandmuscle_token', user['access_token']);
                            sessionStorage.setItem('id_token', user['id_token']);
                            LoginService.auth.loggedIn = true;
                            resolve();
                        })
                } else if (sessionStorage.getItem('brandmuscle_token') != null && this.isTokenExpired()) {
                    sessionStorage.clear();
                    this.signIn(mgr, settings);
                } else {
                    resolve();
                }

            });
        
    }

    static getUsername(): string {
        return LoginService.auth.authz.tokenParsed.preferred_username;
    }

    static getFullName(): string {
        return LoginService.auth.authz.tokenParsed.name;
    }

    static getToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (LoginService.auth.authz.token) {
                LoginService.auth.authz.updateToken(5)
                    .success(() => {
                        resolve(<string>LoginService.auth.authz.token);
                    })
                    .error(() => {
                        reject('Failed to get token');
                    });
            }
        });
    }

    static logout() {
        console.log('*** LOGOUT');
        LoginService.auth.loggedIn = false;
        LoginService.auth.authz = null;

        window.location.assign(LoginService.auth.logoutUrl);
    }

    static signIn(mgr: UserManager, settings: UserManagerSettings) {
        mgr.signinRedirect({ scope: settings.scope, response_type: settings.response_type })
        .then(() => {
            sessionStorage.setItem('consolidatorLogin', 'true');
        })
        .catch((e) => {
            console.log(e);
            sessionStorage.removeItem('consolidatorLogin');
        });
    }

    static isTokenExpired() {
        const token = sessionStorage.getItem('consolidator_token');
        if (token != null && token.length > 0) {
            const jwtHelper: JwtHelperService  = new JwtHelperService ();
            const tokenpayLoad = jwtHelper.decodeToken(token);

            const expiryTime = tokenpayLoad['exp'] == null ? 0 : tokenpayLoad['exp'];
            if (Date.now() / 1000 > expiryTime) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
}

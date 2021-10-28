// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appName: 'consolidator',
  envName: 'local',
  baseHref: '/',
  assetBasePath: '/assets/',
  consolidatorGatewayApiUrl: '/api/consolidator/v1/',
  resourceMessageUrl: `https://campari.v5qa.brandmuscle.net/api/resourcemessages/v1/`,
  // oidcAuthority: `${document.location.origin}/api/v5oidc/v1/`,
  // oidcRedirectUrl: `${document.location.origin}/auth/callback`,
   oidcAuthority: `https://campariamerica.v5qa.brandmuscle.net/api/v5oidc/v1`,
   oidcRedirectUrl:`http://localhost:4200/auth/callback`,
   azureBlobBaseURL:`https://azfs01u.blob.core.windows.net/consolidator/`,
   backUrl:"http://rel4.dev.instantimpact.com/",
   formioBaseUrl: 'https://formio.app-i.qa.brandmuscle.net/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

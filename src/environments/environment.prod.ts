export const environment = {
  production: true,
  appName: 'consolidator',
  envName: 'prod',
  baseHref: '/',
  assetBasePath: 'assets/',
  consolidatorGatewayApiUrl: `${document.location.origin}/api/consolidator/v1/`,
  resourceMessageUrl: `${document.location.origin}/api/resourcemessages/v1/`,
  oidcAuthority: `${document.location.origin}/api/v5oidc/v1/`,
  oidcRedirectUrl: `${document.location.origin}/app/consolidator/v1/`,
  azureBlobBaseURL:`https://azfs01p.blob.core.windows.net/consolidator/`,
  backUrl:`${document.location.origin}/`,
  formioBaseUrl: 'https://formio.app-i.qa.brandmuscle.net/',
};
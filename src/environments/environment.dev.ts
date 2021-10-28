export const environment = {
  production: false,
  appName: 'consolidator',
  envName: 'dev',
  baseHref: '/',
  assetBasePath: 'assets/',
  consolidatorGatewayApiUrl: `${document.location.origin}/api/consolidator/v1/`,
  resourceMessageUrl: `https://campari.v5qa.brandmuscle.net/api/resourcemessages/v1/`,
  oidcAuthority: `${document.location.origin}/api/v5oidc/v1/`,
  oidcRedirectUrl: `${document.location.origin}/app/consolidator/v1/`,
  azureBlobBaseURL:`https://azfs01d.blob.core.windows.net/consolidator/`,
  backUrl:`${document.location.origin}/`,
  formioBaseUrl: 'https://formio.app-i.dev.brandmuscle.net/',
};

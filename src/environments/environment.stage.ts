export const environment = {
  production: true,
  appName: 'consolidator',
  envName: 'stage',
  baseHref: '/',
  assetBasePath: 'assets/',
  consolidatorGatewayApiUrl: `${document.location.origin}/api/consolidator/v1/`,
  resourceMessageUrl: `${document.location.origin}/api/resourcemessages/v1/`,
  oidcAuthority: `${document.location.origin}/api/v5oidc/v1/`,
  oidcRedirectUrl: `${document.location.origin}/app/consolidator/v1/`,
  azureBlobBaseURL:`https://brandbuilderstagebmi.blob.core.windows.net/consolidator/`,
  backUrl:`${document.location.origin}/`,
  formioBaseUrl: 'https://formio.app-i.stage.brandmuscle.net',
};

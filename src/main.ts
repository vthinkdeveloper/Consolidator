import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LoginService } from './app/services/login.service';

if (environment.production) {
  enableProdMode();
}
//platformBrowserDynamic().bootstrapModule(AppModule);

let isBrandMuscleTokenAvailable = (sessionStorage.getItem('brandmuscle_token') !== undefined && sessionStorage.getItem('brandmuscle_token') !== null && sessionStorage.getItem('brandmuscle_token') !== '')
  if (!isBrandMuscleTokenAvailable) {
    LoginService.init()
      .then(() => {
        platformBrowserDynamic().bootstrapModule(AppModule);
      });
  } else {
    platformBrowserDynamic().bootstrapModule(AppModule);
  }

// // LoginService.init()
// //   .then(() => {
// //     platformBrowserDynamic().bootstrapModule(AppModule);
// //   })
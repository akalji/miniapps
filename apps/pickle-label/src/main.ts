import { bootstrapApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { App } from './app/app';

bootstrapApplication(App, { providers: [provideBrowserGlobalErrorListeners()] })
  .catch(error => console.error(error));

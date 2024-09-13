import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { FormAndTableComponent } from './app/form-and-table/form-and-table.component';

bootstrapApplication(FormAndTableComponent, appConfig)
  .catch((err) => console.error(err));

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';

// Custom
import { MDBBootstrapModule } from 'angular-bootstrap-md';

// Views
import { MainView } from './views/MainView';
import { MainController } from './controllers/MainController';


@NgModule({
  declarations: [
    AppComponent,
    MainView
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    HttpClientModule
  ],
  providers: [
    MainController,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

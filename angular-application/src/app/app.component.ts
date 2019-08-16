import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MainView } from "./views/MainView";

@Component({
  providers: [MainView],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Vesti.si';

  constructor(private router: Router, private mMainView: MainView) {}

  refresh(){
    console.log('done');
    this.mMainView.loadArticles();
  }

}

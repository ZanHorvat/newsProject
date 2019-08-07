import { Component, OnInit } from "@angular/core";
import { MainController } from "../controllers/MainController";

@Component({
  selector: "MainView",
  templateUrl: "./MainView.html"
})
export class MainView implements OnInit {
  constructor(private mMainController: MainController) {}

  articles = []

  ngOnInit() {
    this.mMainController.getArticles().subscribe(aArticles => this.articles = aArticles);
  }


}

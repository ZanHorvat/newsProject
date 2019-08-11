import { Component, OnInit } from "@angular/core";
import { MainController } from "../controllers/MainController";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map
} from "rxjs/operators";
import { Article } from "../models/Article";

@Component({
  selector: "MainView",
  templateUrl: "./MainView.html"
})
export class MainView implements OnInit {
  constructor(private mMainController: MainController) {}

  Articles: any = [];

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    return this.mMainController.articles$.subscribe((data: {}) => {
      this.Articles = data;
    });
  }

  getColor(category: String) {
    2;

    category = category.toLowerCase();

    console.log(category);

    switch (category) {
      default:
        return 'grey';
    }
  }
}

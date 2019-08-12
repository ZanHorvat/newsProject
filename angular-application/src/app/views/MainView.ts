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
  selectedArticle: Article;
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
    category = category.toLowerCase();

    switch (category) {
      case "slovenija":
        return "light-green";
      case "tujina":
        return "amber";
      case "politika":
        return "grey";
      case "gospodarstvo":
        return "blue-grey";
      case "šport":
        return "lime";
      case "kultura":
        return "purple";
      case "znanost in tehnologija":
        return "cyan"
      default:
        return "grey";
    }
  }

  selectArticle(article: Article) {
    console.log(article);
    this.selectedArticle = article;
  }

  // https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  extractHostname(url) {
    let hostname;
    // find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
      hostname = url.split("/")[2];
    } else {
      hostname = url.split("/")[0];
    }

    // find & remove port number
    hostname = hostname.split(":")[0];
    // find & remove "?"
    hostname = hostname.split("?")[0];

    hostname = hostname.replace("www.", "");

    return hostname;
  }
}

import {
  Component,
  OnInit,
  ChangeDetectorRef,
  EventEmitter,
  Input
} from "@angular/core";
import { MainController } from "../controllers/MainController";
import { Router, ActivatedRoute } from "@angular/router";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map
} from "rxjs/operators";
import { Article } from "../models/Article";
import { RefreshServiceService } from '../services/refresh-service.service';

@Component({
  selector: "MainView",
  templateUrl: "./MainView.html"
})
export class MainView implements OnInit {
  selectedArticle: Article;

  call: any;

  constructor(
    private mMainController: MainController,
    private ref: ChangeDetectorRef,
    private r: Router,
    private refreshService: RefreshServiceService,
    private activatedRoute: ActivatedRoute
  ) {}

  @Input() Articles: any = [];
  category: String;

  ngOnInit() {
    this.refreshService.getRefresh().subscribe((value: boolean) => {
      if (value) {
        this.loadArticles();
      }
    });

    this.activatedRoute.params.subscribe(params => {
      this.category = params['category'];
      this.loadArticles();
    });
  }

  async loadArticles() {
    this.mMainController.getAllArticles(this.category).subscribe(
      data => {
        this.Articles = data;
      },
      error => {},
      () => {
        new EventEmitter<Article>().emit();
      }
    );
  }

  customTB(index, article) {
    return `${index}-${article._id}`;
  }

  customLetters(category){
    if(category == 'šport') return 'šport'
    return category;
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
      case "sport":
        return "lime";
      case "kultura":
        return "purple";
      case "znanost in tehnologija":
        return "cyan";
      default:
        return "grey";
    }
  }

  public trackItem(index: number, item: any) {
    return item.trackId;
  }

  selectArticle(article: Article) {
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

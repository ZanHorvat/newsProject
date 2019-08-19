import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { MainController } from "./controllers/MainController";
import { RefreshServiceService } from "./services/refresh-service.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Novice";

  updated = new Date();

  formatDate = function(date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const sec = date.getSeconds();

    const leadingZeroHours = hour > 9 ? '' : '0';
    const leadingZeroMinutes = minute > 9 ? '' : '0';
    const leadingZeroSeconds = sec > 9 ? '' : '0';

    return (
      leadingZeroHours +
      hour +
      ':' +
      leadingZeroMinutes +
      minute +
      ':' +
      leadingZeroSeconds +
      sec
    );
  };

  constructor(
    private router: Router,
    private mMainController: MainController,
    private refreshService: RefreshServiceService
  ) {}

  public refresh() {
    this.updated = new Date();
    this.refreshService.setRefresh(true);
  }
}

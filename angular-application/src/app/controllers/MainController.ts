import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError, of } from "rxjs";
import { Article } from "../models/Article";
import { retry, catchError } from "rxjs/operators";

import {
  map,
  tap,
  take,
  filter,
  switchMap,
  first,
  shareReplay
} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MainController {
  public _url: string = "http://localhost:3000/";
  public articles$: Observable<any[]> = this.getAllArticles().pipe(
    shareReplay(1)
  );

  constructor(public http: HttpClient) {}

  public getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this._url).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Error handling
  handleError(error) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}

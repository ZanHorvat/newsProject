import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainController {

  public _url: string = "http://localhost:3000/";

  constructor(public http: HttpClient) {}

  getArticles() {
    console.log(this.http.get(this._url));
   return this.http.get(this._url);
 }
}

import { map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiRoutes } from "../constants/api-routes";
import { CatFact } from "./models/cat-fact.interface";
import { TableData } from '../models/table-data.interface';

@Injectable({
  providedIn: 'root'
})
export class CatsApiService extends HttpClient {

  constructor(handler: HttpHandler) {
    super(handler)
  }

  public getCatFacts(): Observable<Array<TableData>> {
    return this.get<Array<CatFact>>(ApiRoutes.catFacts).pipe(
      map(
        (x) => {
          return x.map(
            (catFact) => {
              return { id: catFact._id, text: catFact.text } as TableData
            })
        }
      ))
  }
}


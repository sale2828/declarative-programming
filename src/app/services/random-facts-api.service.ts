import { map } from 'rxjs/operators';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { ApiRoutes } from "../constants/api-routes";
import { CatFact } from "./models/cat-fact.interface";
import { RandomFact } from './models/random-fact.interface';
import { TableData } from '../models/table-data.interface';

@Injectable({
  providedIn: 'root'
})
export class RandomFactApiService extends HttpClient {

  constructor(handler: HttpHandler) {
    super(handler)
  }

  public getRandomFact(): Observable<Array<TableData>> {
    return forkJoin([
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts),
      this.get<RandomFact>(ApiRoutes.dogFacts)
    ])
  }
}

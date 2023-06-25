import { map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiRoutes } from "../constants/api-routes";
import { CatFact } from "./models/cat-fact.interface";
import { TableData } from '../models/table-data.interface';
import { Monster } from './models/monster.interface';

@Injectable({
  providedIn: 'root'
})
export class MonsterApiService extends HttpClient {

  constructor(handler: HttpHandler) {
    super(handler)
  }

  public getMonsters(): Observable<Array<TableData>> {
    return this.get<Monster>(ApiRoutes.music).pipe(
      map(
        (x) => {
          return x.results.map(
            (monster, i) => {
              return { id: i.toString(), text: monster.name } as TableData
            })
        }
      ))
  }
}


import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { Observable, Subject, catchError, of, takeUntil, tap } from 'rxjs';
import { Pagination } from 'src/app/models/pagination';
import { TableData } from 'src/app/models/table-data.interface';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { transformData } from 'src/app/utils';
import { MonsterApiService } from './../../services/monster-api.service';
import { TableModel } from './models/table-model.interface';

@Component({
  selector: 'app-imperative-table',
  templateUrl: './imperative-table.component.html',
  styleUrls: ['./imperative-table.component.scss'],
})
export class ImperativeTableComponent implements OnInit, OnDestroy {
  tableData: TableModel<TableData> = { dataSource: [], length: 0 }
  pagination: Pagination = { page: 0, pageSize: 3 };
  sort: Sort = { active: '', direction: '' };
  unsubscribe: Subject<void> = new Subject();
  spinnerVisible: boolean = true;


  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'monsters'];

  protected filter: string = '';
  protected chosenApi: string = 'cats';

  constructor(
    private catsApiService: CatsApiService,
    private monsterApiService: MonsterApiService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.getData();
  }

  private setApi(selectedOption: string): Observable<TableData[]> {
    switch (selectedOption) {
      case 'cats':
        return this.catsApiService.getCatFacts()
      case 'monsters':
        return this.monsterApiService.getMonsters()
      default:
        return this.catsApiService.getCatFacts()
    }
  }

  protected getData(): void {
    this.unsubscribe.next()
    this.spinnerVisible = true;
    this.setApi(this.chosenApi).pipe(takeUntil(this.unsubscribe),
      tap((x) => {
        let data = transformData(x, this.sort, this.pagination, this.filter)
        this.tableData = { dataSource: data, length: x.length };
      }),
      catchError((error: Error) => {
        this.tableData = { dataSource: [], length: 0 }

        //handle error here
        this.snackBar.open(error.message,'Error', {duration: 3000} )

        return of(error);
      })).subscribe(() => this.spinnerVisible = false);
  }

  protected chooseApi(): void {
    this.pagination = { page: 0, pageSize: 3 };
    this.sort = { active: '', direction: '' };
    this.getData();
  }

  protected onPage(pageEvent: PageEvent) {
    this.pagination = { page: pageEvent.pageIndex, pageSize: pageEvent.pageSize };
    this.getData();
  }
  protected onSort(sort: Sort) {
    this.sort = sort;
    this.getData();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}

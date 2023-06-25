import { Component } from '@angular/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { TableData } from 'src/app/models/table-data.interface';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { MonsterApiService } from './../../services/monster-api.service';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { Pagination } from 'src/app/models/pagination';
import { TableModel } from './models/table-model.interface';

@Component({
  selector: 'app-imperative-table',
  templateUrl: './imperative-table.component.html',
  styleUrls: ['./imperative-table.component.scss']
})
export class ImperativeTableComponent {
  tableData: TableModel<TableData> = { dataSource: [], length: 0 }
  pagination: Pagination = { page: 0, pageSize: 3 };
  sort: Sort = { active: '', direction: '' };
  unsubscribe: Subject<void> = new Subject();


  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'monsters'];

  protected filter: string = '';
  protected chosenApi: string = '';

  constructor(private catsApiService: CatsApiService, private monsterApiService: MonsterApiService) {
  }

  protected chooseApi(): void {
    this.pagination = { page: 0, pageSize: 3 };
    this.sort = { active: '', direction: '' };
    this.getData();
  }

  private sortData(data: Array<TableData>, sort: Sort): Array<TableData> {
    if (sort.direction === '') {
      return data;
    }
    const columnName = sort.active;
    if (sort.direction === 'asc') {
      return data.sort((a, b) => {
        return a[columnName as keyof TableData].localeCompare(b[columnName as keyof TableData]);
      })
    }

    return data.sort((a, b) => {
      return b[columnName as keyof TableData].localeCompare(a[columnName as keyof TableData]);
    })
  }

  private setPagination(data: Array<TableData>, pageSize: number, page: number): Array<TableData> {
    return data.slice(page * pageSize, page * pageSize + pageSize)
  }

  protected onPage(pageEvent: PageEvent) {
    this.pagination = { page: pageEvent.pageIndex, pageSize: pageEvent.pageSize };
    this.getData();
  }
  protected onSort(sort: Sort) {
    this.sort = sort;
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

  private getData(): void {
    this.unsubscribe.next()
    this.setApi(this.chosenApi).pipe(takeUntil(this.unsubscribe),
      tap((x) => {
      this.tableData = { dataSource: x, length: x.length };
      this.tableData.dataSource = this.setPagination(x, this.pagination.pageSize, this.pagination.page);
      this.tableData.dataSource = this.sortData(this.tableData.dataSource, this.sort);
    })).subscribe();
  }
}

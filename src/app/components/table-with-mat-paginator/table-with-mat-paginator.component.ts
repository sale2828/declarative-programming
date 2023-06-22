import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { TableData } from 'src/app/models/table-data.interface';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { TablePaginationModel } from 'src/app/services/models/table-pagination-model';
import { RandomFactApiService } from 'src/app/services/random-facts-api.service';

@Component({
  selector: 'app-table-with-mat-paginator',
  templateUrl: './table-with-mat-paginator.component.html',
  styleUrls: ['./table-with-mat-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableWithMatPaginator {
  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatSort) sort!: MatSort;

  private _sort!: MatSort;
  @ViewChild('sort') set sort(sort: MatSort) {
    this._sort = sort;
    if (this._paginator) {
      this.setUpEvents();
    }
  }
  private _paginator!: MatPaginator;
  @ViewChild('paginator') set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    if (this._sort) {
      this.setUpEvents();
    }
  }


  private _apiRawData = new BehaviorSubject<Array<TableData>>([]);

  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'random']

  protected filter = new FormControl<string | null>(null);
  protected chosenApi = new FormControl<string | null>(null);

  protected chosenApi$ = this.chosenApi.valueChanges.pipe(
    tap(x => this.setApi(x || '')
      .pipe(tap((data) =>
        this._apiRawData.next(data)))
      .subscribe()))
    .subscribe();

  protected filter$ = this.filter.valueChanges.pipe(debounceTime(500), startWith(''));
  private dataTransformation$?: Observable<[PageEvent, Sort]>
  protected dataSource$?: Observable<TablePaginationModel<TableData>> = new Observable<TablePaginationModel<TableData>>()
    .pipe(startWith({ dataSource: [], length: 0 }))

  constructor(private catsApiService: CatsApiService, private randomFactApiService: RandomFactApiService) {

  }

  private setUpEvents(): void {
    this.dataTransformation$ = combineLatest([this._paginator.page, this._sort.sortChange]);
    this.dataSource$ = combineLatest([this.filter$, this.dataTransformation$, this._apiRawData])
      .pipe(
        switchMap(([filter, [paginator, sort], rawData]) => {
          let data = rawData.filter(data => data.text.toLowerCase().includes(filter?.toLowerCase() || ''))
          data = this.setPagination(data, paginator.pageSize, paginator.pageIndex)
          return of({ dataSource: this.sortData(data, sort), length: rawData.length } as TablePaginationModel<TableData>)
        }))
    this.dataSource$.subscribe();
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

  private setApi(selectedOption: string): Observable<TableData[]> {
    switch (selectedOption) {
      case 'cats':
        return this.catsApiService.getCatFacts()
      case 'random':
        return this.randomFactApiService.getRandomFact()
      default:
        return this.catsApiService.getCatFacts()
    }
  }
}

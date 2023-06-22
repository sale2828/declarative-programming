import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { DataChange } from 'src/app/models/data-change.model';
import { Pagination } from 'src/app/models/pagination';
import { TableData } from 'src/app/models/table-data.interface';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { TablePaginationModel } from 'src/app/services/models/table-pagination-model';
import { RandomFactApiService } from 'src/app/services/random-facts-api.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  private _pagination = new BehaviorSubject<Pagination>({ page: 0, pageSize: 3 });
  private _sort = new BehaviorSubject<Sort>({ active: '', direction: '' });
  private _apiToCall = new BehaviorSubject<Observable<TableData[]>>(of([]));

  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'random']

  protected filter = new FormControl<string | null>(null);
  protected chosenApi = new FormControl<string>('cats');

  // protected chosenApi$ = this.chosenApi.valueChanges
  //   .pipe(
  //     tap((x) =>
  //       this._apiToCall.next(this.setApi(x || ''))
  //     )
  //   ).subscribe();


private onApiChange$ = this.chosenApi.valueChanges.pipe(startWith(this.chosenApi.value),
tap(() => {
  this.filter.setValue(null, { emitEvent: false });

  this.dataChange$.next({
    filter: this.filter.value,
    pagination: { page: 0, pageSize: 3 },
    sort: { active: '', direction: '' }
  });

  // this.filter.setValue(null, { emitEvent: false });
  // this._pagination.next({ page: 0, pageSize: 3 })
  // this._sort.next({ active: '', direction: '' })
}))


  // protected filter$ = this.filter.valueChanges.pipe(debounceTime(500), startWith(''));
  // private dataTransformation$ = combineLatest({pagination: this._pagination, sort: this._sort});

  private dataChange$ = new BehaviorSubject<DataChange>({
    filter: this.filter.value,
    pagination: { page: 0, pageSize: 3 },
    sort: { active: '', direction: '' }
  });

  protected dataSource$ = combineLatest({
    // filter: this.filter$,
    // dataTransformation: this.dataTransformation$,
    dataChange: this.dataChange$,
    apiToChoose: this.onApiChange$})
  .pipe(
    debounceTime(0),
    switchMap(({dataChange, apiToChoose}) => {
    let apiCall = apiToChoose === 'cats' ? this.catsApiService.getCatFacts()
    : this.randomFactApiService.getRandomFact();
    return apiCall.pipe(map((rawData) => { return { rawData, dataChange} }))
  }
  ), map(({ rawData, dataChange}) => {
    let data = rawData.filter(data => data.text.toLowerCase().includes(dataChange.filter?.toLowerCase() || ''))
    data = this.setPagination(data, dataChange.pagination)
    return { dataSource: this.sortData(data, dataChange.sort), length: rawData.length } as TablePaginationModel<TableData>
  }))

  // inputChange = new BehaviorSubject<{ filter: string, pagination:  }>({});


  // protected dataSource$ = combineLatest([this.filter$, this.dataTransformation$, this._apiToCall])
  //   .pipe(
  //     switchMap(([filter, [pagination, sort], apiToCall]) => {
  //       return apiToCall.pipe(switchMap((rawData) => {
  //         let data = rawData.filter(data => data.text.toLowerCase().includes(filter?.toLowerCase() || ''))
  //         data = this.setPagination(data, pagination)
  //         return of({ dataSource: this.sortData(data, sort), length: rawData.length } as TablePaginationModel<TableData>)
  //       }))
  //     }))

  constructor(private catsApiService: CatsApiService, private randomFactApiService: RandomFactApiService) {
    this.filter.valueChanges.pipe(debounceTime(500), tap((x) => {
      this.dataChange$.next({ ...this.dataChange$.value, filter: x });
    }))
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

  private setPagination(data: Array<TableData>, pagination: Pagination): Array<TableData> {
    return data.slice(pagination.page * pagination.pageSize, pagination.page * pagination.pageSize + pagination.pageSize)
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

  protected sort(sort: Sort): void {
      this.dataChange$.next({ ...this.dataChange$.value, sort });
      // this._sort.next(sort)
  }

  protected onPage($event: PageEvent): void {
      this.dataChange$.next({ ...this.dataChange$.value, pagination: { page: $event.pageIndex, pageSize: $event.pageSize } });
      // this._pagination.next({ page: $event.pageIndex, pageSize: $event.pageSize })
  }

}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ApiResponse, ApiStatus } from 'src/app/models/api-response';
import { DataTransformation } from 'src/app/models/data-transformation.interface';
import { TableData } from 'src/app/models/table-data.interface';
import { TablePaginationModel } from 'src/app/models/table-pagination-model';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { transformData } from 'src/app/utils';
import { MonsterApiService } from '../../services/monster-api.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'monsters'];
  spinnerVisible: boolean = true;
  apiStatus = ApiStatus;

  protected filter = new FormControl<string | null>(null);
  protected chosenApi = new FormControl<string>('cats');

  private onApiChange$ = this.chosenApi.valueChanges.pipe(startWith(this.chosenApi.value),
    tap(() => {
      this.filter.setValue(null, { emitEvent: false });
      this.dataTransformation$.next({
        filter: this.filter.value,
        pagination: { page: 0, pageSize: 3 },
        sort: { active: '', direction: '' }
      });
    }))

  private dataTransformation$ = new BehaviorSubject<DataTransformation>({
    filter: this.filter.value,
    pagination: { page: 0, pageSize: 3 },
    sort: { active: '', direction: '' }
  });

  protected dataSource$: Observable<ApiResponse<TablePaginationModel<TableData>>> = combineLatest({
    dataTransformation: this.dataTransformation$,
    apiToChoose: this.onApiChange$
  }).pipe(
    tap(() => this.spinnerVisible = true),
    debounceTime(0),
    switchMap(({  dataTransformation, apiToChoose }) =>
      this.getData(dataTransformation, apiToChoose)
    ),
    tap(() => this.spinnerVisible = false)
  );

  private getData(dataTransformation: DataTransformation, apiToChoose: string | null): Observable<ApiResponse<TablePaginationModel<TableData>>> {
    let apiCall = apiToChoose === 'cats'
      ? this.catsApiService.getCatFacts() :
      this.monsterApiService.getMonsters();

    return apiCall.pipe(
      map((rawData) => {
        let data = transformData(rawData, dataTransformation.sort, dataTransformation.pagination, dataTransformation.filter)
        return {
          status: ApiStatus.success,
          data: {
            dataSource: data,
            length: rawData.length,
            pagination: dataTransformation.pagination,
            sort: dataTransformation.sort
          },
          error: undefined
        }
      }),
      catchError((error) => {
        return of({
          status: ApiStatus.error,
          data: undefined,
          error: error
        })
      }))
  }

  constructor(private catsApiService: CatsApiService, private monsterApiService: MonsterApiService) {
    this.filter.valueChanges.pipe(debounceTime(500), tap((x) => {
      this.dataTransformation$.next({ ...this.dataTransformation$.value, filter: x });
    })).subscribe();
  }

  protected sort(sort: Sort): void {
    this.dataTransformation$.next({ ...this.dataTransformation$.value, sort });
  }

  protected onPage($event: PageEvent): void {
    this.dataTransformation$.next({ ...this.dataTransformation$.value, pagination: { page: $event.pageIndex, pageSize: $event.pageSize } });
  }

}

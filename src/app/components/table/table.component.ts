import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { DataTransformation } from 'src/app/models/data-transformation.interface';
import { Pagination } from 'src/app/models/pagination';
import { TableData } from 'src/app/models/table-data.interface';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { TablePaginationModel } from 'src/app/models/table-pagination-model';
import { MonsterApiService } from '../../services/monster-api.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'monsters']

  protected filter = new FormControl<string | null>(null);
  protected chosenApi = new FormControl<string>('cats');

  private onApiChange$ = this.chosenApi.valueChanges.pipe(startWith(this.chosenApi.value),
    tap(() => {
      this.filter.setValue(null, { emitEvent: false });

      this.dataChange$.next({
        filter: this.filter.value,
        pagination: { page: 0, pageSize: 3 },
        sort: { active: '', direction: '' }
      });
    }))

  private dataChange$ = new BehaviorSubject<DataTransformation>({
    filter: this.filter.value,
    pagination: { page: 0, pageSize: 3 },
    sort: { active: '', direction: '' }
  });

  protected dataSource$ = combineLatest({
    dataChange: this.dataChange$,
    apiToChoose: this.onApiChange$
  })
    .pipe(
      debounceTime(0),
      switchMap(({ dataChange: dataTransformation, apiToChoose }) => {
        let apiCall = apiToChoose === 'cats' ? this.catsApiService.getCatFacts()
          : this.monsterApiService.getMonsters();
        return apiCall.pipe(map((rawData) => { return { rawData, dataChange: dataTransformation } }))
      }
      ), map(({ rawData, dataChange: dataTransformation }) => {
        let data = rawData.filter(data => data.text.toLowerCase().includes(dataTransformation.filter?.toLowerCase() || ''))
        data = this.setPagination(data, dataTransformation.pagination);
        data = this.sortData(data, dataTransformation.sort);
        return { dataSource: data, length: rawData.length, pagination: dataTransformation.pagination, sort: dataTransformation.sort } as TablePaginationModel<TableData>
      }))

  constructor(private catsApiService: CatsApiService, private monsterApiService: MonsterApiService) {
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

  protected sort(sort: Sort): void {
    this.dataChange$.next({ ...this.dataChange$.value, sort });
  }

  protected onPage($event: PageEvent): void {
    this.dataChange$.next({ ...this.dataChange$.value, pagination: { page: $event.pageIndex, pageSize: $event.pageSize } });
  }

}

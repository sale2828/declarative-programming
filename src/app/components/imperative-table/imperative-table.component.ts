import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable, map, merge, of as observableOf, tap } from 'rxjs';
import { TableData } from 'src/app/models/table-data.interface';
import { CatsApiService } from 'src/app/services/cats-api.service';
import { RandomFactApiService } from 'src/app/services/random-facts-api.service';

@Component({
  selector: 'app-imperative-table',
  templateUrl: './imperative-table.component.html',
  styleUrls: ['./imperative-table.component.scss']
})
export class ImperativeTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TableData>;
  dataSource: MatTableDataSource<TableData>;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'text'];
  availableAPIs = ['cats', 'random'];

  protected filter: string = '';
  protected chosenApi: string = '';

  constructor(private catsApiService: CatsApiService, private randomFactApiService: RandomFactApiService) {
    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  protected chooseApi(): void {
    this.setApi(this.chosenApi).pipe(
      tap((data) => {
        this.dataSource.data = data
        this.table.dataSource = this.dataSource
      })).subscribe()
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

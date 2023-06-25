import { Sort } from "@angular/material/sort";
import { Pagination } from "./pagination";

export interface TablePaginationModel<T> {
  dataSource: T[],
  length: number,
  pagination: Pagination,
  sort: Sort
}

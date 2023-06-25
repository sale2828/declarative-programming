import { Sort } from '@angular/material/sort';
import { Pagination } from './pagination';

export interface DataTransformation {
  filter: string | null;
  pagination: Pagination;
  sort: Sort
}

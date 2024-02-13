import { Sort } from "@angular/material/sort";
import { Pagination } from "../models/pagination";
import { TableData } from "../models/table-data.interface";

export function transformData(data: Array<TableData>, sort: Sort, pagination: Pagination, filter: string | null): Array<TableData> {
  let response = data.filter(data => data.text.toLowerCase().includes(filter?.toLowerCase() || ''))
  response = setPagination(response, pagination);
  response = sortData(response, sort);
  return response;
}

function sortData(data: Array<TableData>, sort: Sort): Array<TableData> {
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

function setPagination(data: Array<TableData>, pagination: Pagination): Array<TableData> {
  return data.slice(pagination.page * pagination.pageSize, pagination.page * pagination.pageSize + pagination.pageSize)
}

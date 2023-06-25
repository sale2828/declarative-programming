import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './components/table/table.component';
import { AppRoutes } from './constants/app-routes';
import { SlideshowComponent } from './components/slideshow/slideshow.component';
import { ImperativeTableComponent } from './components/imperative-table/imperative-table.component';

const routes: Routes = [
  {
    path: AppRoutes.Table,
    component: TableComponent,
  },
  {
    path: AppRoutes.Slideshow,
    component: SlideshowComponent,
  },
  {
    path: AppRoutes.ImperativeTable,
    component: ImperativeTableComponent,
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

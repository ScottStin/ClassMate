import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { FilterCardComponent } from './filter-card.component';

@NgModule({
  declarations: [FilterCardComponent],
  imports: [CommonModule, MatTabsModule],
  exports: [FilterCardComponent],
})
export class FilterCardModule {}

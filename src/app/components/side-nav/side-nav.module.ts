import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { SideNavComponent } from './side-nav.component';

@NgModule({
  declarations: [SideNavComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    RouterModule,
  ],
  exports: [SideNavComponent],
})
export class SideNavModule {}

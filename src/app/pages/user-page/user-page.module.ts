import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditUserDialogModule } from 'src/app/components/edit-user-dialog/edit-user-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/pages/lesson-page/lesson-card/lesson-card.module';
import { UserCardModule } from 'src/app/pages/user-page/user-card/user-card.module';
import { UserTableModule } from 'src/app/pages/user-page/user-table/user-table.module';

import { UserPageComponent } from './user-page.component';
import { UserPageRoutingModule } from './user-page-routing.module';

@NgModule({
  declarations: [UserPageComponent],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTabsModule,
    HeaderCardModule,
    UserPageRoutingModule,
    LessonCardModule,
    UserCardModule,
    UserTableModule,
    EditUserDialogModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [UserPageComponent],
})
export class UserPageModule {}

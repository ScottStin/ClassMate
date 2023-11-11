import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { EditUserDialogModule } from 'src/app/components/edit-user-dialog/edit-user-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/components/lesson-card/lesson-card.module';
import { UserCardModule } from 'src/app/components/user-card/user-card.module';
import { UserTableModule } from 'src/app/components/user-table/user-table.module';

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
  ],
  exports: [UserPageComponent],
})
export class UserPageModule {}

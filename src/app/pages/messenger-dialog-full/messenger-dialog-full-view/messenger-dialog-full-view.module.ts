import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateMessagegroupDialogModule } from 'src/app/components/create-messagegroup-dialog/create-messagegroup-dialog.module';

import { MessengerDialogFullViewComponent } from './messenger-dialog-full-view.component';

@NgModule({
  declarations: [MessengerDialogFullViewComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatListModule,
    MatChipsModule,
    ReactiveFormsModule,
    FormsModule,
    CreateMessagegroupDialogModule,
  ],
  exports: [MessengerDialogFullViewComponent],
})
export class MessengerDialogFullViewModule {}

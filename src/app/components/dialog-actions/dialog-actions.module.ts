import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { DialogActionsComponent } from './dialog-actions.component';

@NgModule({
  declarations: [DialogActionsComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [DialogActionsComponent],
})
export class DialogActionsModule {}

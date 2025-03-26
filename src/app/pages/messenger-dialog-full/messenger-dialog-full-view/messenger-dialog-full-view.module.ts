import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { MessengerDialogFullViewComponent } from './messenger-dialog-full-view.component';

@NgModule({
  declarations: [MessengerDialogFullViewComponent],
  imports: [CommonModule, MatTabsModule],
  exports: [MessengerDialogFullViewComponent],
})
export class MessengerDialogFullViewModule {}

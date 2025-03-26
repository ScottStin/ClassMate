import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DialogHeaderModule } from 'src/app/components/dialog-header/dialog-header.module';

import { MessengerDialogFullComponent } from './messenger-dialog-full.component';
import { MessengerDialogFullViewModule } from './messenger-dialog-full-view/messenger-dialog-full-view.module';

@NgModule({
  declarations: [MessengerDialogFullComponent],
  imports: [CommonModule, MessengerDialogFullViewModule, DialogHeaderModule],
  exports: [MessengerDialogFullComponent],
})
export class MessengerDialogFullModule {}

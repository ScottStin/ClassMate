import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ErrorMessageComponent } from './error-message.component';

@NgModule({
  declarations: [ErrorMessageComponent],
  imports: [CommonModule],
  exports: [ErrorMessageComponent],
})
export class ErrorMessageModule {}

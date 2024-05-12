import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss'],
})
export class DialogHeaderComponent {
  @Input() dialogTitle: string;
  @Input() hideCloseButton: boolean | undefined;
  @Input() showArrowButton: boolean | undefined;
  @Output() closeAction = new EventEmitter<boolean>();

  onCloseBtnClick(): void {
    this.closeAction.emit(true);
  }
}

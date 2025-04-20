import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-actions',
  templateUrl: './dialog-actions.component.html',
  styleUrls: ['./dialog-actions.component.scss'],
})
export class DialogActionsComponent {
  @Input() disabled?: boolean;
  @Input() saveButtonName?: string | undefined;
  @Input() cancelButtonName?: string | undefined;
  @Input() hideSaveButton: boolean | undefined;
  @Input() loading: boolean | undefined;
  @Output() saveAction = new EventEmitter<boolean>();
  @Output() cancelAction = new EventEmitter<boolean>();

  onSaveBtnClick(): void {
    this.saveAction.emit(true);
  }

  onCancelBtnClick(): void {
    this.cancelAction.emit(true);
  }
}

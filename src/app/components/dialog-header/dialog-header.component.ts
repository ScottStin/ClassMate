import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss'],
})
export class DialogHeaderComponent implements OnInit, OnDestroy {
  @Input() dialogTitle: string;
  @Input() hideCloseButton: boolean | undefined;
  @Input() showArrowButton: boolean | undefined;
  @Output() closeAction = new EventEmitter<boolean>();

  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

  defaultStyles = defaultStyles;
  primaryButtonBackgroundColor =
    this.defaultStyles.primaryButtonBackgroundColor;
  primaryButtonTextColor = this.defaultStyles.primaryButtonTextColor;

  constructor(private readonly schoolService: SchoolService) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.getCurrentSchoolDetails();
  }

  getCurrentSchoolDetails(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        if (currentSchool) {
          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;

          if (primaryButtonBackgroundColor !== undefined) {
            this.primaryButtonBackgroundColor = primaryButtonBackgroundColor;
          }
          if (primaryButtonTextColor !== undefined) {
            this.primaryButtonTextColor = primaryButtonTextColor;
          }
        }
      }
    );
  }

  onCloseBtnClick(): void {
    this.closeAction.emit(true);
  }

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
  }
}

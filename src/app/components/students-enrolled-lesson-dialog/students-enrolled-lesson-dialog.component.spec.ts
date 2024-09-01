import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { StudentsEnrolledLessonDialogComponent } from './students-enrolled-lesson-dialog.component';

describe('StudentsEnrolledLessonDialogComponent', () => {
  let component: StudentsEnrolledLessonDialogComponent;
  let fixture: ComponentFixture<StudentsEnrolledLessonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsEnrolledLessonDialogComponent],
      imports: [
        MatButtonModule,
        MatDialogModule,
        MatGridListModule,
        MatIconModule,
        MatListModule,
        MatTooltipModule,
        DialogActionsModule,
        DialogHeaderModule,
        HttpClientTestingModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (): unknown => ({}),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsEnrolledLessonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

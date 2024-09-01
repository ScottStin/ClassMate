import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { LessonCardComponent } from './lesson-card.component';

describe('LessonCardComponent', () => {
  let component: LessonCardComponent;
  let fixture: ComponentFixture<LessonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LessonCardComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

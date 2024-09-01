import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HomeworkFeedbackDialogModule } from 'src/app/components/homework-feedback-dialog/homework-feedback-dialog.module';

import { HomeworkCardComponent } from './homework-card.component';

describe('HomeworkCardComponent', () => {
  let component: HomeworkCardComponent;
  let fixture: ComponentFixture<HomeworkCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeworkCardComponent],
      imports: [
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatDividerModule,
        MatExpansionModule,
        MatIconModule,
        MatTooltipModule,
        HomeworkFeedbackDialogModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeworkCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';

import { ReorderSentenceQuestionComponent } from './reorder-sentence-question.component';

describe('ReorderSentenceQuestionComponent', () => {
  let component: ReorderSentenceQuestionComponent;
  let fixture: ComponentFixture<ReorderSentenceQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReorderSentenceQuestionComponent],
      imports: [DragDropModule, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReorderSentenceQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

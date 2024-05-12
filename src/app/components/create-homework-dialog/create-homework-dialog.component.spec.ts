import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHomeworkDialogComponent } from './create-homework-dialog.component';

describe('CreateHomeworkDialogComponent', () => {
  let component: CreateHomeworkDialogComponent;
  let fixture: ComponentFixture<CreateHomeworkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateHomeworkDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateHomeworkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

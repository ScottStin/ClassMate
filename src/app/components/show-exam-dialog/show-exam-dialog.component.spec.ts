import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExamDialogComponent } from './show-exam-dialog.component';

describe('ShowExamDialogComponent', () => {
  let component: ShowExamDialogComponent;
  let fixture: ComponentFixture<ShowExamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowExamDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowExamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

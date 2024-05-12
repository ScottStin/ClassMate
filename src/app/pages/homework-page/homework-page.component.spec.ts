import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeworkPageComponent } from './homework-page.component';

describe('HomeworkPageComponent', () => {
  let component: HomeworkPageComponent;
  let fixture: ComponentFixture<HomeworkPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeworkPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeworkPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

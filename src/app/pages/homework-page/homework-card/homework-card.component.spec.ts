import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeworkCardComponent } from './homework-card.component';

describe('HomeworkCardComponent', () => {
  let component: HomeworkCardComponent;
  let fixture: ComponentFixture<HomeworkCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeworkCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeworkCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

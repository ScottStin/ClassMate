import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLessonFormComponent } from './create-lesson-form.component';

describe('CreateLessonFormComponent', () => {
  let component: CreateLessonFormComponent;
  let fixture: ComponentFixture<CreateLessonFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLessonFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLessonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

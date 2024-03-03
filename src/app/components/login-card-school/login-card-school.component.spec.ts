import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCardSchoolComponent } from './login-card-school.component';

describe('LoginCardSchoolComponent', () => {
  let component: LoginCardSchoolComponent;
  let fixture: ComponentFixture<LoginCardSchoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginCardSchoolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCardSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

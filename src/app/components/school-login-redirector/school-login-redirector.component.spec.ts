import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolLoginRedirectorComponent } from './school-login-redirector.component';

describe('SchoolLoginRedirectorComponent', () => {
  let component: SchoolLoginRedirectorComponent;
  let fixture: ComponentFixture<SchoolLoginRedirectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolLoginRedirectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolLoginRedirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

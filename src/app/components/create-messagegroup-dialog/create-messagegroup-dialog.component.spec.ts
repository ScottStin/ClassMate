import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMessagegroupDialogComponent } from './create-messagegroup-dialog.component';

describe('CreateMessagegroupDialogComponent', () => {
  let component: CreateMessagegroupDialogComponent;
  let fixture: ComponentFixture<CreateMessagegroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMessagegroupDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMessagegroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

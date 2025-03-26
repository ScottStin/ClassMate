import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerDialogFullViewComponent } from './messenger-dialog-full-view.component';

describe('MessengerDialogFullViewComponent', () => {
  let component: MessengerDialogFullViewComponent;
  let fixture: ComponentFixture<MessengerDialogFullViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessengerDialogFullViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessengerDialogFullViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

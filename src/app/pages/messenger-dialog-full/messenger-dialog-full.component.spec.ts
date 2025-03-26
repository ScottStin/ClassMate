import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerDialogFullComponent } from './messenger-dialog-full.component';

describe('MessengerDialogFullComponent', () => {
  let component: MessengerDialogFullComponent;
  let fixture: ComponentFixture<MessengerDialogFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessengerDialogFullComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessengerDialogFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

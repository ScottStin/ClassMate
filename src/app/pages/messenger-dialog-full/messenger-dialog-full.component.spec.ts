import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Socket } from 'ngx-socket-io';
import { DialogHeaderModule } from 'src/app/components/dialog-header/dialog-header.module';

import { MessengerDialogFullComponent } from './messenger-dialog-full.component';
import { MessengerDialogFullViewModule } from './messenger-dialog-full-view/messenger-dialog-full-view.module';

describe('MessengerDialogFullComponent', () => {
  let component: MessengerDialogFullComponent;
  let fixture: ComponentFixture<MessengerDialogFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessengerDialogFullComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        DialogHeaderModule,
        MessengerDialogFullViewModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (): unknown => ({}),
        },
        {
          provide: Socket,
          useValue: {
            on: jasmine.createSpy('on'),
            off: jasmine.createSpy('off'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessengerDialogFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

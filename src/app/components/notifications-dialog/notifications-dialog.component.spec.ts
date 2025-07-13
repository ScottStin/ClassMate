import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { NotificationsDialogComponent } from './notifications-dialog.component';

describe('NotificationsDialogComponent', () => {
  let component: NotificationsDialogComponent;
  let fixture: ComponentFixture<NotificationsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationsDialogComponent],
      imports: [
        MatIconModule,
        MatToolbarModule,
        MatDialogModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        MatCardModule,
        MatTooltipModule,
        DialogHeaderModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

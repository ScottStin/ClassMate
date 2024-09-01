import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DialogHeaderComponent } from './dialog-header.component';

describe('DialogHeaderComponent', () => {
  let component: DialogHeaderComponent;
  let fixture: ComponentFixture<DialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogHeaderComponent],
      imports: [
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatToolbarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

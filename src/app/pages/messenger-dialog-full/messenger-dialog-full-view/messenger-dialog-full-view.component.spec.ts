import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateMessagegroupDialogModule } from 'src/app/components/create-messagegroup-dialog/create-messagegroup-dialog.module';

import { MessengerDialogFullViewComponent } from './messenger-dialog-full-view.component';

describe('MessengerDialogFullViewComponent', () => {
  let component: MessengerDialogFullViewComponent;
  let fixture: ComponentFixture<MessengerDialogFullViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessengerDialogFullViewComponent],
      imports: [
        MatTabsModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatListModule,
        MatChipsModule,
        ReactiveFormsModule,
        FormsModule,
        CreateMessagegroupDialogModule,
        MatDividerModule,
        MatMenuModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessengerDialogFullViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

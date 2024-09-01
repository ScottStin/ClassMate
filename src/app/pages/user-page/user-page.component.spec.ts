import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { EditUserDialogModule } from 'src/app/components/edit-user-dialog/edit-user-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/components/lesson-card/lesson-card.module';
import { UserCardModule } from 'src/app/components/user-card/user-card.module';
import { UserTableModule } from 'src/app/components/user-table/user-table.module';

import { UserPageComponent } from './user-page.component';

describe('UserPageComponent', () => {
  let component: UserPageComponent;
  let fixture: ComponentFixture<UserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserPageComponent],
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatProgressBarModule,
        MatTabsModule,
        MatTooltipModule,
        EditUserDialogModule,
        HeaderCardModule,
        LessonCardModule,
        UserCardModule,
        UserTableModule,
        MatSnackBarModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

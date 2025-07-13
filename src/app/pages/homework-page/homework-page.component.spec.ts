import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Socket } from 'ngx-socket-io';
import { ConfirmDialogModule } from 'src/app/components/confirm-dialog/confirm-dialog.module';
import { CreateHomeworkDialogModule } from 'src/app/components/create-homework-dialog/create-homework-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';

import { HomeworkCardModule } from './homework-card/homework-card.module';
import { HomeworkPageComponent } from './homework-page.component';
import { HomeworkTableModule } from './homework-table/homework-table.module';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

describe('HomeworkPageComponent', () => {
  let component: HomeworkPageComponent;
  let fixture: ComponentFixture<HomeworkPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeworkPageComponent],
      imports: [
        MatSnackBarModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatBadgeModule,
        MatProgressBarModule,
        MatSelectModule,
        MatTabsModule,
        MatTooltipModule,
        ConfirmDialogModule,
        CreateHomeworkDialogModule,
        HeaderCardModule,
        HomeworkCardModule,
        BrowserAnimationsModule,
        HomeworkTableModule,
      ],
      providers: [{ provide: Socket, useValue: socketMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeworkPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

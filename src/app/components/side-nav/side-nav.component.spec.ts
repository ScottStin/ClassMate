import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { Socket } from 'ngx-socket-io';
import { EditUserDialogModule } from 'src/app/components/edit-user-dialog/edit-user-dialog.module';

import { SideNavComponent } from './side-nav.component';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SideNavComponent],
      imports: [
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatDividerModule,
        EditUserDialogModule,
        MatBadgeModule,
        MatMenuModule,
        RouterTestingModule,
        MatSnackBarModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: Socket, useValue: socketMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

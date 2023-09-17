import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';

import { HeaderCardComponent } from './header-card.component';

describe('HeaderCardComponent', () => {
  let component: HeaderCardComponent;
  let fixture: ComponentFixture<HeaderCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderCardComponent],
      imports: [MatCardModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

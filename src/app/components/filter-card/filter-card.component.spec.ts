import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FilterCardComponent } from './filter-card.component';

describe('FilterCardComponent', () => {
  let component: FilterCardComponent;
  let fixture: ComponentFixture<FilterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterCardComponent],
      imports: [MatTabsModule, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

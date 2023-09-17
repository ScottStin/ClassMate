import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.css'],
})
export class HeaderCardComponent implements OnInit {
  @Output() closeSideNav = new EventEmitter();
  // constructor() { }

  ngOnInit(): void {
    console.log('test header card');
  }

  closeSideNavClick(): void {
    this.closeSideNav.emit();
  }
}

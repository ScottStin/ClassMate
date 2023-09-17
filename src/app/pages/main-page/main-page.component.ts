import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  // constructor() { }
  showFiller = false;
  ngOnInit(): void {
    console.log('test main page');
  }

  closeSideNav(): void {
    this.drawer.toggle();
  }
}

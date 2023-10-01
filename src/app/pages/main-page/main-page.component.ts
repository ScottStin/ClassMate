import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;
  showFiller = false;

  // constructor() {}

  ngOnInit(): void {
    console.log('test main page');
  }

  async closeSideNav(): Promise<void> {
    await this.drawer.toggle();
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { CreateLessonDialogComponent } from 'src/app/components/create-lesson-dialog/create-lesson-dialog.component';
import { LessonDTO } from 'src/app/shared/models/lesson.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  showFiller = false;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    console.log('test main page');
  }

  async closeSideNav(): Promise<void> {
    await this.drawer.toggle();
  }

  headerButtonAction(action: string): void {
    console.log(action);
    if (action === 'addNewLesson') {
      this.addLessons(); // TODO - replace with call to lessoncomponent
    }
  }

  addLessons(): void {
    // TODO - move this function to lessoncomponent
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      data: {
        title: 'Create New Lesson',
        rightButton: 'Create',
        leftButton: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: LessonDTO | undefined) => {
      if (result) {
        console.log(result);
      }
    });
  }
}

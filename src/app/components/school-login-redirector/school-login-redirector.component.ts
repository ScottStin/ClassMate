import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { schools } from 'src/app/app-routing.module';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-school-login-redirector',
  templateUrl: './school-login-redirector.component.html',
  styleUrls: ['./school-login-redirector.component.css'],
})
export class SchoolLoginRedirectorComponent implements OnInit {
  redirectForm: FormGroup<{
    email: FormControl<string>;
  }>;
  schools = schools;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { email: string | null; schools: SchoolDTO[] },
    private readonly router: Router,
    private readonly dialogRef: MatDialogRef<SchoolLoginRedirectorComponent>,
    private readonly snackbarService: SnackbarService
  ) {}

  async confirmClick(): Promise<void> {
    const foundSchool = this.data.schools.find(
      (school) => school.email === this.redirectForm.controls.email.value
    );
    if (foundSchool) {
      const schoolName = foundSchool.name.replace(/ /gu, '-').toLowerCase();
      await this.router.navigateByUrl(`${schoolName}/school/login`);
    } else {
      this.snackbarService.openPermanent(
        'error',
        'image failed to load',
        'dismiss'
      );
    }
    this.dialogRef.close(true);
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    this.redirectForm = new FormGroup({
      email: new FormControl(this.data.email ?? '', {
        validators: [Validators.required, this.schoolMatchValidator()],
        nonNullable: true,
      }),
    });
  }

  schoolMatchValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (
        !this.data.schools
          .map((school) => school.email.toLocaleLowerCase())
          .includes(value.toLocaleLowerCase())
      ) {
        return { schoolNotFound: true };
      } else {
        return null;
      }
    };
  }
}

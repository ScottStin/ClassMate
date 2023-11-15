import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs/internal/Subject';
import { countryList } from 'src/app/shared/country-list';
import { demoLevels } from 'src/app/shared/demo-data';
import { LevelDTO, UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css'],
})
export class EditUserDialogComponent implements OnInit {
  userForm: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    phone: FormControl<string>;
    nationality: FormControl<string>;
    level: FormControl<LevelDTO | null>;
    // level: FormControl<string | null>;
    statement: FormControl<string>;
  }>;
  countryList = countryList;
  hidePassword = true;
  demoLevels = demoLevels;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      user: UserDTO | undefined;
      existingUsers: UserDTO[] | undefined;
      formType: string;
    }
  ) {}

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    this.userForm = new FormGroup({
      name: new FormControl(this.data.user?.name ?? '', {
        validators: [],
        nonNullable: true,
      }),
      email: new FormControl(this.data.user?.email ?? '', {
        validators: [Validators.required, this.emailValidator()],
        nonNullable: true,
      }),
      phone: new FormControl(this.data.user?.phone ?? '', {
        validators: [],
        nonNullable: true,
      }),
      nationality: new FormControl(this.data.user?.nationality ?? '', {
        validators: [],
        nonNullable: true,
      }),
      level: new FormControl(this.data.user?.level ?? null, {
        validators: [],
        nonNullable: false,
      }),
      statement: new FormControl(this.data.user?.statement ?? '', {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        validators: [this.wordCountValidator(10, 200)],
        nonNullable: true,
      }),
    });
    if (this.data.user?.level) {
      const level = this.demoLevels.find(
        (obj) => this.data.user?.level?.shortName === obj.shortName
      );
      this.userForm.get('level')?.patchValue(level as LevelDTO | null);
    }

    this.formPopulated.next(true);
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/u.test(value)) {
        return { invalidEmail: true }; // check if email is valid
      }
      if (this.data.existingUsers) {
        if (
          this.data.existingUsers
            .map((user: UserDTO) => user.email)
            .includes(value) &&
          value !== this.data.user?.email
        ) {
          return { existingEmail: true }; // check if email already exists
        } else {
          return null; // email meets all conditions
        }
      } else {
        return null; // email meets all conditions
      }
    };
  }

  wordCountValidator(minWords: number, maxWords: number): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      if (this.data.user?.userType.toLowerCase() === 'teacher') {
        const value = control.value as string;
        const words = value ? value.trim().split(/\s+/u) : [];
        const wordCount = words.length;
        if (wordCount < minWords) {
          return { tooFewWords: true };
        }
        if (wordCount > maxWords) {
          return { tooManyWords: true };
        }
        return null;
      } else {
        return null;
      }
    };
  }
}

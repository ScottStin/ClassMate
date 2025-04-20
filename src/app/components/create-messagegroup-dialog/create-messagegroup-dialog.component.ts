/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { finalize } from 'rxjs';
import {
  ConversationDto,
  ConversationService,
  CreateConversationDto,
} from 'src/app/services/conversation-service/conversation.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@UntilDestroy()
@Component({
  selector: 'app-create-messagegroup-dialog',
  templateUrl: './create-messagegroup-dialog.component.html',
  styleUrls: ['./create-messagegroup-dialog.component.css'],
})
export class CreateMessagegroupDialogComponent implements OnInit {
  messageGroupForm: FormGroup<{
    groupName: FormControl<string>;
    usersInput: FormControl<string>;
    image: FormControl<{
      url: string;
      filename: string;
    } | null>;
  }>;

  filteredUsers: UserDTO[];
  usersList: UserDTO[] = [];
  loading = false;

  imageChangedEvent: Event | string = '';
  imageCropper: ImageCropperComponent;
  photoLink: string | null | undefined;
  photoName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      currentUser: UserDTO;
      users: UserDTO[];
      existingGroup?: ConversationDto;
    },
    private readonly snackbarService: SnackbarService,
    private readonly conversationService: ConversationService,
    private readonly dialogRef: MatDialogRef<CreateMessagegroupDialogComponent>
  ) {}

  ngOnInit(): void {
    this.populateForm();
    this.filteredUsers = [...this.data.users];
    this.usersList.push(this.data.currentUser);
  }

  populateForm(): void {
    if (this.data.existingGroup) {
      const existingGroupUsers = this.data.users.filter(
        (users) => this.data.existingGroup?.participantIds.includes(users._id)
      );
      this.usersList = existingGroupUsers;
    }

    this.messageGroupForm = new FormGroup({
      groupName: new FormControl(this.data.existingGroup?.groupName ?? '', {
        validators: [Validators.maxLength(100)],
        nonNullable: true,
      }),

      usersInput: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),

      image: new FormControl<{
        url: string;
        filename: string;
      } | null>(null, {
        validators: [],
        nonNullable: false,
      }),
    });
  }

  /**
   * Add users to group
   */
  filterUsers(search: string): void {
    this.filteredUsers = this.data.users.filter(
      (obj: UserDTO) =>
        obj.name.toLowerCase().includes(search.toLowerCase()) &&
        !this.usersList.includes(obj)
    );
  }

  updateUsers(user: UserDTO): void {
    this.usersList.push(user);
    this.usersList.sort((a: UserDTO, b: UserDTO) =>
      a.name.localeCompare(b.name)
    );
    this.messageGroupForm.get('usersInput')?.setValue('');
  }

  removeUser(user: UserDTO): void {
    const index = this.usersList.indexOf(user);
    if (index >= 0) {
      this.usersList.splice(index, 1);
    }
    this.userValidator();
  }

  selectAllUsers(users: UserDTO[]): void {
    const newUsers = users.filter(
      (user) => !this.usersList.some((obj) => obj._id === user._id)
    );
    this.usersList.push(...newUsers);
    this.usersList.sort((a: UserDTO, b: UserDTO) =>
      a.name.localeCompare(b.name)
    );
  }

  unselectAllUsers(): void {
    this.usersList = [this.data.currentUser];
  }

  userValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      if (this.usersList.length < 2) {
        return { required: control.value };
      } else {
        return null;
      }
    };
  }

  /**
   * Photo Cropping and Upload
   */

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (this.validateImage(input.files[0])) {
        this.photoName = input.files[0].name;
      }
    }
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.photoLink = event.base64;
    if (this.photoLink !== null && this.photoLink !== undefined) {
      this.messageGroupForm.controls.image.setValue({
        url: this.photoLink,
        filename: this.photoName,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  imageLoaded(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  cropperReady(): void {}

  loadImageFailed(): void {
    this.snackbarService.openPermanent(
      'error',
      'image failed to load',
      'dismiss'
    );
  }

  validateImage(image: File): boolean {
    const types = ['image/png', 'image/gif', 'image/tiff', 'image/jpeg'];
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const maxSize = 1000 * 1024; // 1000 KB
    if (!types.includes(image.type)) {
      this.snackbarService.openPermanent(
        'error',
        'Picture must be .png/.gif/.tif/.jpg type',
        'dismiss'
      );
      return false;
    }
    if (image.size > maxSize) {
      this.snackbarService.openPermanent(
        'error',
        'File must be 1-1000 kb in size',
        'dismiss'
      );
      return false;
    }

    return true;
  }

  closeDialog(save?: boolean): void {
    if (save === false || save === undefined) {
      this.dialogRef.close();
    } else if (this.data.existingGroup) {
      this.updateGroup();
    } else {
      this.createNewGroup();
    }
  }

  createNewGroup(): void {
    this.loading = true;
    const messageGroupForm = this.messageGroupForm.getRawValue();

    const group: CreateConversationDto = {
      ...messageGroupForm,
      participantIds: this.usersList.map((user) => user._id),
      schoolId: this.data.currentUser.schoolId as string,
      groupAdminId: this.data.currentUser._id,
      groupAdminName: this.data.currentUser.name,
    };

    this.conversationService
      .createConversation(group)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (newgroup) => {
          this.dialogRef.close(newgroup);
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  updateGroup(): void {
    this.loading = true;
    const messageGroupForm = this.messageGroupForm.getRawValue();

    const group: ConversationDto = {
      ...messageGroupForm,
      participantIds: this.usersList.map((user) => user._id),
      schoolId: this.data.currentUser.schoolId as string,
      groupAdminId: this.data.currentUser._id,
      groupAdminName: this.data.currentUser.name,
      _id: this.data.existingGroup?._id ?? '',
    };

    this.conversationService
      .updateGroup(group)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (newgroup) => {
          this.dialogRef.close(newgroup);
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }
}

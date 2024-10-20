import { first, firstValueFrom, map, Observable } from 'rxjs';

import { UserDTO } from '../models/user.model';

async function getUserFromObservable(
  users$: Observable<UserDTO[]>,
  userId: string
): Promise<UserDTO | undefined> {
  return await firstValueFrom(
    users$.pipe(
      map((users) => users.find((user) => user._id === userId)),
      first()
    )
  );
}

export { getUserFromObservable };

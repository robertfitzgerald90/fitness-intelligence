import type { UserProfile } from '@/domain/models/profile';

export type UserProfileRepository = {
  get(): Promise<UserProfile>;
  save(profile: UserProfile): Promise<UserProfile>;
};

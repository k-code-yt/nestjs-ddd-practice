import { HttpService } from '@nestjs/axios';
import { Injectable, HttpServer } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

export interface ExternalUserData {
  id: string;
  email: string;
  userType: string;
  permissions: ExternalPermission[];
}

export interface ExternalPermission {
  type: string;
  resource: string;
}

@Injectable()
export class UserServiceClient {
  constructor(private readonly httpService: HttpService) {}

  async getUserById(userId: string): Promise<ExternalUserData | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<ExternalUserData | null>(`/api/users/${userId}`)
          .pipe(
            catchError((error: AxiosError) => {
              throw 'An error happened!';
            }),
          ),
      );
      return data;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async getPermissions(userId: string): Promise<ExternalPermission[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<ExternalPermission[]>(`/api/users/${userId}/permissions`)
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }

  async validateUserExists(userId: string): Promise<boolean> {
    try {
      await this.getUserById(userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

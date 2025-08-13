import { Injectable } from '@nestjs/common';
import { UserDataService } from '../../../payment/domain/services/user-data.service';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserServiceClient } from '../external-services/user-service.client';
import { UserDataTranslator } from './user-data.translator';
import { UserPermissionDto } from '../../../payment/application/dtos/user-permission.dto';
import { UserTypeDto } from '../../../payment/application/dtos/user-type.dto';

@Injectable()
export class UserServiceAdapter implements UserDataService {
  constructor(
    private readonly userClient: UserServiceClient,
    private readonly translator: UserDataTranslator,
  ) {}

  async validateUserExists(userId: UserId): Promise<boolean> {
    return this.userClient.validateUserExists(userId.value);
  }

  async getPermissions(userId: UserId): Promise<UserPermissionDto> {
    const externalUser = await this.userClient.getUserById(userId.value);
    if (!externalUser) {
      throw new Error(`User not found: ${userId.value}`);
    }

    const externalPermissions = await this.userClient.getPermissions(
      userId.value,
    );

    return this.translator.toPaymentPermissions(
      externalPermissions,
      externalUser.userType,
    );
  }

  async getUserType(userId: UserId): Promise<UserTypeDto> {
    const externalUser = await this.userClient.getUserById(userId.value);
    if (!externalUser) {
      throw new Error(`User not found: ${userId.value}`);
    }

    return this.translator.toPaymentUserType(externalUser.userType);
  }
}

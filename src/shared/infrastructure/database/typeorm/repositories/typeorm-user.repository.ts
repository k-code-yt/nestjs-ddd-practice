import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserPermissionDto } from '../../../../../payment/application/dtos/user-permission.dto';
import { Permission } from '../../../../../user/domain/value-objects/permission.vo';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { TypeOrmUser } from '../entities/typeorm-user';
import { IUserRepo } from '../../../../../payment/application/repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTypeDto } from '../../../../../payment/application/dtos/user-type.dto';
import { UserPermissionMapper } from '../../../mappers/user-permission.mapper';
import { UserTypeMapper } from '../../../mappers/user-type.mapper';

@Injectable()
export class TypeOrmUserRepository implements IUserRepo {
  constructor(
    @InjectRepository(TypeOrmUser)
    private readonly userRepo: Repository<TypeOrmUser>,
  ) {}

  async validateUserExists(userId: UserId): Promise<boolean> {
    const count = await this.userRepo.count({
      where: { id: userId.value },
    });
    return count > 0;
  }

  async getPermissions(userId: UserId): Promise<UserPermissionDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId.value },
      relations: ['permissions'],
    });

    if (!user) {
      throw new Error(`User not found: ${userId.value}`);
    }

    const domainPermissions = user.permissions.map(
      (p) => new Permission(p.type, p.resource),
    );

    return UserPermissionMapper.toPaymentPermissionDto(domainPermissions);
  }

  async getUserType(userId: UserId): Promise<UserTypeDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId.value },
      select: ['id', 'type'],
    });

    if (!user) {
      throw new Error(`User not found: ${userId.value}`);
    }

    return UserTypeMapper.toPaymentUserTypeDto(user.type);
  }
}

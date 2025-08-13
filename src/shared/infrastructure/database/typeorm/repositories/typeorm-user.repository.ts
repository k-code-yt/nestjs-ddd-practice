import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserPermissionDto } from '../../../../../payment/application/dtos/user-permission.dto';
import { Permission } from '../../../../../user/domain/value-objects/permission.vo';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { TypeOrmUser } from '../entities/typeorm-user';
import { IUserRepo } from '../../../../../payment/application/repositories/user.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserTypeDto } from '../../../../../payment/application/dtos/user-type.dto';
import { UserPermissionMapper } from '../../../mappers/user-permission.mapper';
import { UserTypeMapper } from '../../../mappers/user-type.mapper';
import {
  ISaveUserRepo,
  IUpdateUserRepo,
} from '../../../../../user/application/repositories/user.repository';
import { User } from '../../../../../user/domain/entities/user';

@Injectable()
export class TypeOrmUserRepository
  implements IUpdateUserRepo, ISaveUserRepo, IUserRepo
{
  private userRepo: Repository<TypeOrmUser>;
  constructor(
    @InjectEntityManager()
    private readonly manager: EntityManager,
  ) {
    this.userRepo = this.manager.getRepository(TypeOrmUser);
  }
  
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

  async update(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findById(id: UserId): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async save(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

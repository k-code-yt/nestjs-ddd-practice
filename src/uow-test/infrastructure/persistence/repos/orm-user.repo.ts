import { EntityManager } from 'typeorm';
import { IUserRepository } from '../../../application/repositories/repos';
import { UserTypeOrmEntity } from '../entities/orm-user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../../../domain/user.entity';

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private manager: EntityManager) {}

  async findById(id: string): Promise<any> {
    const entity = await this.manager.findOne(UserTypeOrmEntity, {
      where: { id },
      relations: ['orders'],
    });
    return entity && UserMapper.toDomain(entity);
  }

  async findByEmail(email: string): Promise<any> {
    const entity = await this.manager.findOne(UserTypeOrmEntity, {
      where: { email },
      relations: ['orders'],
    });
    return entity && UserMapper.toDomain(entity);
  }

  async save(user: User): Promise<void> {
    const entity = UserMapper.toTypeOrm(user);
    await this.manager.save(UserTypeOrmEntity, entity);
  }
}

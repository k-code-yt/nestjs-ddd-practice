import { Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
export interface IUOWInitializeOptions {
  prevTX?: EntityManager;
  isolationLevel:
    | 'READ UNCOMMITTED'
    | 'READ COMMITTED'
    | 'REPEATABLE READ'
    | 'SERIALIZABLE';
}
import { v4 as uuid } from 'uuid';

export abstract class BaseUnitOfWork {
  protected queryRunner: QueryRunner;
  protected manager: EntityManager;
  protected id: string;
  constructor(protected readonly dataSource: DataSource) {
    this.id = uuid();
  }

  async commit(): Promise<void> {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
    Logger.warn(`TX = ${this.id}`, 'TX:COMMIT');
  }

  async rollback(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
    Logger.warn(`TX = ${this.id}`, 'TX:ROLLBACK');
  }

  protected async initManager(options?: IUOWInitializeOptions) {
    this.queryRunner = options?.prevTX
      ? options.prevTX.connection.createQueryRunner()
      : this.dataSource.createQueryRunner();

    await this.queryRunner.connect();
    await this.queryRunner.startTransaction(
      options?.isolationLevel || 'READ COMMITTED',
    );
    this.manager = this.queryRunner.manager;
  }

  abstract initialize(options?: IUOWInitializeOptions): Promise<BaseUnitOfWork>;
}

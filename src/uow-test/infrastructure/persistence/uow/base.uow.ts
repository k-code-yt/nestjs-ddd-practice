import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { v4 as uuid } from 'uuid';

export abstract class BaseUnitOfWork {
  protected queryRunner: QueryRunner;
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

  abstract initialize(): Promise<BaseUnitOfWork>;
}

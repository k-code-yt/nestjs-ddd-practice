import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseUnitOfWork } from './uow/base.uow';

@Injectable()
export class ProxyUnitOfWorkFactory {
  constructor(private dataSource: DataSource) {}

  createTransactionalProxy<
    T extends { execute(...args: any[]): Promise<any> },
    K extends BaseUnitOfWork,
  >(useCase: T, cls: new (dataSource: DataSource) => K): T {
    return new Proxy(useCase, {
      get: (target, prop) => {
        if (prop === 'execute') {
          return async (...args: any[]) => {
            const uow = (target as any).unitOfWork;
            if (!uow) {
              return target.execute(...args);
            }

            const transactionalUow = new cls(this.dataSource);
            await transactionalUow.initialize();

            (target as any).unitOfWork = transactionalUow;

            try {
              const result = await target.execute(...args);
              await transactionalUow.commit();
              return result;
            } catch (error) {
              await transactionalUow.rollback();
              Logger.error(error);
            } finally {
              (target as any).unitOfWork = uow;
            }
          };
        }
        return target[prop];
      },
    });
  }
}

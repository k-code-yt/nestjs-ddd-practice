import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { User } from '../entities/user';
import { PermissionType, ResourceType } from '../value-objects/permission.vo';

export class WritePermissionSpecification implements ISpecification<User> {
  private readonly permittedTypes: PermissionType[] = [
    PermissionType.WRITE,
    PermissionType.ADMIN,
  ];

  constructor(private readonly resourceType: ResourceType) {
    this.validateResourceType(resourceType);
  }

  isSatisfiedBy(candidate: User): boolean {
    if (!candidate.permissions || candidate.permissions.length === 0) {
      return false;
    }

    return candidate.permissions.some(
      (permission) =>
        permission.resourceType === this.resourceType &&
        this.permittedTypes.includes(permission.permission),
    );
  }

  reason(candidate: User): string {
    return `User does not have write permissions for ${this.resourceType} resources. Required permissions: ${this.permittedTypes.join(' or ')}`;
  }

  private validateResourceType(resourceType: ResourceType): void {
    if (!resourceType) {
      throw new Error('Resource type is required for permission specification');
    }

    if (!Object.values(ResourceType).includes(resourceType)) {
      throw new Error(`Invalid resource type: ${resourceType}`);
    }
  }
}

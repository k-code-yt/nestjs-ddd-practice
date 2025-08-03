export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

export enum ResourceType {
  PAYMENT = 'payment',
  USER = 'user',
  SYSTEM = 'system',
}

export class Permission {
  private readonly _permission: PermissionType;
  private readonly _resourceType: ResourceType;

  constructor(permission: PermissionType, resourceType: ResourceType) {
    this.validatePermission(permission);
    this.validateResourceType(resourceType);
    this.validatePermissionResourceCombination(permission, resourceType);

    this._permission = permission;
    this._resourceType = resourceType;
  }

  get permission(): PermissionType {
    return this._permission;
  }

  get resourceType(): ResourceType {
    return this._resourceType;
  }

  equals(other: Permission): boolean {
    return (
      this._permission === other._permission &&
      this._resourceType === other._resourceType
    );
  }

  isAdminPermission(): boolean {
    return this._permission === PermissionType.ADMIN;
  }

  canRead(): boolean {
    return (
      this._permission === PermissionType.READ ||
      this._permission === PermissionType.WRITE ||
      this._permission === PermissionType.ADMIN
    );
  }

  canWrite(): boolean {
    return (
      this._permission === PermissionType.WRITE ||
      this._permission === PermissionType.ADMIN
    );
  }

  canDelete(): boolean {
    return (
      this._permission === PermissionType.DELETE ||
      this._permission === PermissionType.ADMIN
    );
  }

  toString(): string {
    return `${this._permission}:${this._resourceType}`;
  }

  toJSON() {
    return {
      permission: this._permission,
      resourceType: this._resourceType,
    };
  }

  private validatePermission(permission: PermissionType): void {
    if (!Object.values(PermissionType).includes(permission)) {
      throw new Error(`Invalid permission type: ${permission}`);
    }
  }

  private validateResourceType(resourceType: ResourceType): void {
    if (!Object.values(ResourceType).includes(resourceType)) {
      throw new Error(`Invalid resource type: ${resourceType}`);
    }
  }

  // TODO -> move to specs?
  private validatePermissionResourceCombination(
    permission: PermissionType,
    resourceType: ResourceType,
  ): void {
    // Business rule: Only SYSTEM resources can have ADMIN permissions
    if (
      permission === PermissionType.ADMIN &&
      resourceType !== ResourceType.SYSTEM
    ) {
      throw new Error(
        'ADMIN permission can only be granted on SYSTEM resources',
      );
    }

    // Business rule: DELETE permission not allowed on USER resources
    if (
      permission === PermissionType.DELETE &&
      resourceType === ResourceType.USER
    ) {
      throw new Error('DELETE permission is not allowed on USER resources');
    }
  }
}

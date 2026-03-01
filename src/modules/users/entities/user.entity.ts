type UserRole = 'ADMIN' | 'USER';

export type UserCreate = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

export type UserView = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastAccess?: Date;
  createdAt?: Date;
  updatedAt?: Date | null;
};

export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly password: string,
    readonly role: UserRole,
    readonly isActive: boolean,
    readonly lastAccess?: Date,
    readonly createdAt?: Date,
    readonly updatedAt?: Date | null,
  ) {}

  /* ---------- FACTORIES ---------- */

  static create(data: UserCreate): User {
    return new User(
      undefined,
      data.email,
      data.name,
      data.password,
      data.role,
      true,
      null,
    );
  }

  static fromPersistence(data: {
    id: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastAccess?: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.password,
      data.role,
      data.isActive,
      data.lastAccess,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateProfile(data: { name?: string; password?: string }): User {
    return new User(
      this.id,
      this.email,
      data.name ?? this.name,
      data.password ?? this.password,
      this.role,
      this.isActive,
      this.lastAccess,
      this.createdAt,
      new Date(),
    );
  }

  updateByAdmin(data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
  }): User {
    return new User(
      this.id,
      data.email ?? this.email,
      data.name ?? this.name,
      data.password ?? this.password,
      data.role ?? this.role,
      data.isActive ?? this.isActive,
      this.lastAccess,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      false,
      this.lastAccess,
      this.createdAt,
      new Date(),
    );
  }

  activate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      true,
      this.lastAccess,
      this.createdAt,
      new Date(),
    );
  }

  updateLastAccess(date: Date = new Date()): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      this.isActive,
      date,
      this.createdAt,
      this.updatedAt,
    );
  }

  toView(): UserView {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      lastAccess: this.lastAccess,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

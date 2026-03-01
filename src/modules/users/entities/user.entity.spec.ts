import { User } from './user.entity';

describe('User Entity', () => {
  it('deve criar um usuário ativo por padrão', () => {
    const user = User.create({
      email: 'test@email.com',
      name: 'Test User',
      password: 'hashed-password',
      role: 'USER',
    });

    expect(user.isActive).toBe(true);
    expect(user.id).toBeUndefined();
    expect(user.email).toBe('test@email.com');
    expect(user.lastAccess).toBeNull();
  });

  it('deve atualizar nome e senha e gerar updatedAt', () => {
    const user = User.create({
      email: 'test@email.com',
      name: 'Old Name',
      password: 'old-password',
      role: 'USER',
    });

    const updated = user.updateProfile({
      name: 'New Name',
    });

    expect(updated).not.toBe(user); // objeto novo
    expect(updated.name).toBe('New Name');
    expect(updated.password).toBe('old-password');
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it('deve desativar e ativar o usuário corretamente', () => {
    const user = User.create({
      email: 'test@email.com',
      name: 'Test',
      password: '123',
      role: 'USER',
    });

    const deactivated = user.deactivate();
    expect(deactivated.isActive).toBe(false);
    expect(deactivated.updatedAt).toBeInstanceOf(Date);

    const activated = deactivated.activate();
    expect(activated.isActive).toBe(true);
  });

  it('deve atualizar o lastAccess', () => {
    const user = User.create({
      email: 'test@email.com',
      name: 'Test',
      password: '123',
      role: 'USER',
    });

    const date = new Date('2024-01-01');

    const updated = user.updateLastAccess(date);

    expect(updated.lastAccess).toEqual(date);
  });

  it('não deve expor password no toView', () => {
    const user = User.create({
      email: 'test@email.com',
      name: 'Test',
      password: 'secret',
      role: 'USER',
    });

    const view = user.toView();

    expect(view).not.toHaveProperty('password');
    expect(view.email).toBe('test@email.com');
  });

  it('deve restaurar um usuário da persistência com todos os campos', () => {
    const now = new Date();
    const persistenceData = {
      id: 'uuid-123',
      email: 'persist@test.com',
      name: 'Persist User',
      password: 'hashed-password',
      role: 'ADMIN' as const,
      isActive: false,
      lastAccess: now,
      createdAt: now,
      updatedAt: now,
    };

    const user = User.fromPersistence(persistenceData);

    expect(user.id).toBe('uuid-123');
    expect(user.role).toBe('ADMIN');
    expect(user.isActive).toBe(false);
    expect(user.lastAccess).toEqual(now);
  });

  it('deve atualizar via admin todos os campos permitidos', () => {
    const user = User.create({
      email: 'old@test.com',
      name: 'Old',
      password: '123',
      role: 'USER',
    });

    const updated = user.updateByAdmin({
      name: 'New Name',
      email: 'new@test.com',
      role: 'ADMIN',
      isActive: false,
    });

    expect(updated.name).toBe('New Name');
    expect(updated.email).toBe('new@test.com');
    expect(updated.role).toBe('ADMIN');
    expect(updated.isActive).toBe(false);
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it('deve manter valores originais em updateByAdmin se dados forem omitidos', () => {
    const user = User.create({
      email: 'test@test.com',
      name: 'Test',
      password: '123',
      role: 'USER',
    });

    const updated = user.updateByAdmin({}); // Objeto vazio

    expect(updated.name).toBe(user.name);
    expect(updated.email).toBe(user.email);
    expect(updated.role).toBe(user.role);
    expect(updated.isActive).toBe(user.isActive);
  });

  it('deve usar a data atual no updateLastAccess se nenhuma data for passada', () => {
    const user = User.create({
      email: 'test@test.com',
      name: 'Test',
      password: '123',
      role: 'USER',
    });

    const updated = user.updateLastAccess();

    expect(updated.lastAccess).toBeInstanceOf(Date);
    expect(updated.lastAccess!.getTime()).toBeGreaterThan(Date.now() - 1000);
  });

  it('deve manter nome e senha originais em updateProfile se dados forem omitidos (Branch Coalescência)', () => {
    const user = User.create({
      email: 'test@test.com',
      name: 'Original Name',
      password: 'Original Password',
      role: 'USER',
    });

    const updated = user.updateProfile({});

    expect(updated.name).toBe('Original Name');
    expect(updated.password).toBe('Original Password');
  });
});

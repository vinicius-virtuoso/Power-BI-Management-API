import { User } from './user.entity';

describe('User Entity', () => {
  it('deve criar um usuário ativo por padrão', () => {
    const user = User.create({
      email: 'test@email.com',
      name: 'Test User',
      password: 'hashed-password',
      role: 'USER',
      lastAccess: null,
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
      lastAccess: null,
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
      lastAccess: null,
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
      lastAccess: null,
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
      lastAccess: null,
    });

    const view = user.toView();

    expect(view).not.toHaveProperty('password');
    expect(view.email).toBe('test@email.com');
  });
});

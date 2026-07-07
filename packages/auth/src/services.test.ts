import { AuthService } from './services';

describe('AuthService', () => {
  it('creates a session for valid login credentials', async () => {
    const service = new AuthService();
    const session = await service.login({ email: 'teacher@eduspell.ai', password: 'password123' });

    expect(session.user.email).toBe('teacher@eduspell.ai');
    expect(session.token).toContain('token-');
  });
});

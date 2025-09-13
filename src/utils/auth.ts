import { db } from './database';
import type { User } from '../types';

export class AuthManager {
  private static currentUser: User | null = null;

  static async login(username: string, password: string): Promise<User | null> {
    try {
      const users = await db.getAll('users');
      
      // Simple password validation (in production, use proper hashing)
      const validCredentials = [
        { username: 'secretary', password: 'secretary123' },
        { username: 'director', password: 'director123' }
      ];

      const credentials = validCredentials.find(c => 
        c.username === username && c.password === password
      );

      if (!credentials) return null;

      const user = users.find(u => u.username === username);
      if (user) {
        this.currentUser = user;
        localStorage.setItem('tcc_current_user', JSON.stringify(user));
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem('tcc_current_user');
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('tcc_current_user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(role: 'secretary' | 'director'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  static canWrite(): boolean {
    return this.hasRole('secretary');
  }
}
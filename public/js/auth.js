// Cliente de autenticación JWT
class AuthClient {
  constructor() {
    this.token = localStorage.getItem('jwt_token');
    this.user = null;
  }

  // Login
  async login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.token;
        this.user = data.usuario;
        localStorage.setItem('jwt_token', this.token);
        return { success: true, user: this.user };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Logout
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error en logout:', error);
    }
    this.token = null;
    this.user = null;
    localStorage.removeItem('jwt_token');
  }

  // Verificar token
  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    }
  }

  // Obtener perfil del usuario
  async getProfile() {
    if (!this.token) return null;

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        this.user = data.usuario;
        return data.usuario;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Instancia global
const authClient = new AuthClient();
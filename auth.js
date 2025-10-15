import { authService } from './supabase-client.js';

let authModalOverlay = null;

export function showAuthModal(mode = 'login') {
  if (authModalOverlay) {
    authModalOverlay.remove();
  }

  authModalOverlay = document.createElement('div');
  authModalOverlay.className = 'auth-modal-overlay';
  authModalOverlay.innerHTML = `
    <div class="auth-modal-container">
      <div class="auth-modal-header">
        <h2 id="authModalTitle">${mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <button class="close-auth-modal" id="closeAuthModal">×</button>
      </div>
      <div class="auth-modal-body">
        <form id="authForm">
          ${mode === 'register' ? `
            <div class="form-group">
              <label for="fullName">Nombre Completo</label>
              <input type="text" id="fullName" name="fullName" required>
            </div>
          ` : ''}
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required minlength="6">
          </div>
          <div class="auth-error" id="authError" style="display: none;"></div>
          <button type="submit" class="auth-submit-btn" id="authSubmitBtn">
            ${mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>
        <div class="auth-switch">
          ${mode === 'login'
            ? '<p>¿No tienes cuenta? <a href="#" id="switchToRegister">Regístrate aquí</a></p>'
            : '<p>¿Ya tienes cuenta? <a href="#" id="switchToLogin">Inicia sesión aquí</a></p>'
          }
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(authModalOverlay);

  const form = document.getElementById('authForm');
  const closeBtn = document.getElementById('closeAuthModal');
  const errorDiv = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmitBtn');

  closeBtn.addEventListener('click', () => {
    authModalOverlay.remove();
    authModalOverlay = null;
  });

  authModalOverlay.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) {
      authModalOverlay.remove();
      authModalOverlay = null;
    }
  });

  if (mode === 'login') {
    const switchToRegister = document.getElementById('switchToRegister');
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('register');
    });
  } else {
    const switchToLogin = document.getElementById('switchToLogin');
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('login');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'login' ? 'Iniciando...' : 'Registrando...';

    try {
      if (mode === 'register') {
        const fullName = document.getElementById('fullName').value;
        await authService.signUp(email, password, fullName);
        showNotification('¡Registro exitoso! Recargando...');
      } else {
        await authService.signIn(email, password);
        showNotification('¡Sesión iniciada! Recargando...');
      }

      authModalOverlay.remove();
      authModalOverlay = null;

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      errorDiv.textContent = getErrorMessage(error);
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Iniciar Sesión' : 'Registrarse';
    }
  });
}

function getErrorMessage(error) {
  if (error.message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos';
  }
  if (error.message.includes('User already registered')) {
    return 'Este email ya está registrado';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Por favor confirma tu email';
  }
  return error.message || 'Ha ocurrido un error. Por favor intenta de nuevo.';
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #d4af37;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    z-index: 9999;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

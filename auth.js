/**
 * auth.js
 * Funktionen für Registrierung und Login.
 */

/** Registrierung: Überprüft Passwörter und sendet Daten an /register. */
export async function handleRegister(event) {
  event.preventDefault();
  const form = document.getElementById('registerForm');
  const formData = new FormData(form);
  if (formData.get('password') !== formData.get('passwordRepeat')) {
    document.getElementById('registerError').textContent = 'Passwörter stimmen nicht überein.';
    return;
  } else {
    document.getElementById('registerError').textContent = '';
  }
  const body = {
    role: 'Kunde',
    vorname: formData.get('vorname'),
    gender: formData.get('gender'),
    customGender: formData.get('customGender') || '',
    username: formData.get('username'),
    strasse: formData.get('strasse'),
    ort: formData.get('ort'),
    email: formData.get('email'),
    password: formData.get('password')
  };
  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    if (res.ok) {
      alert(text);
      showSection('loginScreen');
    } else {
      document.getElementById('registerError').textContent = text;
    }
  } catch (err) {
    document.getElementById('registerError').textContent = 'Fehler beim Registrieren.';
  }
}

/** Login: Sendet Anmeldedaten an /login und gibt Rolle zurück. */
export async function handleLogin(event) {
  event.preventDefault();
  const form = document.getElementById('loginForm');
  const formData = new FormData(form);
  const body = {
    username: formData.get('username'),
    password: formData.get('password')
  };
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      alert(data.message + ' | Rolle: ' + data.role);
      // Setze die globale Variable im Fenster (für Module, die es benötigen)
      window.currentUserRole = data.role;
      return data.role;
    } else {
      const errMsg = await res.text();
      document.getElementById('loginError').textContent = errMsg;
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Fehler beim Einloggen.';
  }
}
/**
 * client.js
 * Enthält die Single-Page-Logik für die Lagersimulation:
 * - Navigation zwischen Sektionen
 * - Passwort-Toggle und Divers-Check
 * - Registrierung und Login mit rollenbasierter Weiterleitung
 * - Laden und Suchen von Artikeln
 * - Bestellvorgang: Bestellformular und Bestelldetail
 */

// Globale Variablen zur Verwaltung des Login-Zustandes
let currentUserRole = null;
let redirectToOrder = false;

/** Zeigt nur die gewünschte Section an, alle anderen werden ausgeblendet */
function showSection(sectionId) {
  const sections = document.querySelectorAll('main section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

/** Schaltet ein Passwortfeld zwischen "password" und "text" um */
function togglePassword(fieldId) {
  const pwField = document.getElementById(fieldId);
  pwField.type = (pwField.type === 'password') ? 'text' : 'password';
}

/** Zeigt das Custom-Geschlechtsfeld an, wenn "Divers" ausgewählt ist */
function checkDivers() {
  const genderSelect = document.getElementById('genderSelect');
  const customField = document.getElementById('customGenderField');
  customField.style.display = (genderSelect.value === 'Divers') ? 'block' : 'none';
}

/** Aktualisiert die Navigation für den Admin */
function updateNavForAdmin() {
  document.getElementById('guestNav').style.display = 'none';
  document.getElementById('adminNav').style.display = 'inline-block';
  document.getElementById('lageristNav').style.display = 'none';
}

/** Aktualisiert die Navigation für den Lageristen */
function updateNavForLagerist() {
  document.getElementById('guestNav').style.display = 'none';
  document.getElementById('adminNav').style.display = 'none';
  document.getElementById('lageristNav').style.display = 'inline-block';
}

/** Setzt die Navigation zurück (Gast-Modus) und zeigt den allgemeinen Startbildschirm */
function logoutUser() {
  document.getElementById('adminNav').style.display = 'none';
  document.getElementById('lageristNav').style.display = 'none';
  document.getElementById('guestNav').style.display = 'inline-block';
  // Stelle sicher, dass in guestNav Login und Registrierung sichtbar sind
  document.getElementById('btnLogin').style.display = 'inline-block';
  document.getElementById('btnRegister').style.display = 'inline-block';
  document.getElementById('btnLogout').style.display = 'none';
  currentUserRole = null;
  showSection('startScreen');
}

/** "Fake"-Bestellfunktion für Kunden.
 * Wenn der Benutzer nicht eingeloggt ist, wird er zuerst zum Login weitergeleitet.
 */
function handleOrder() {
  if (!currentUserRole) {
    // Nicht eingeloggt: Setze Flag und leite zum Login weiter
    redirectToOrder = true;
    showSection('loginScreen');
  } else {
    // Eingeloggt: Zeige Bestellformular
    showSection('orderForm');
    loadOrderForm();
  }
}

/** Lädt die Artikeldaten vom Server und füllt das Bestellformular */
async function loadOrderForm() {
  try {
    const res = await fetch('/articles');
    if (!res.ok) throw new Error('Fehler beim Laden der Artikel');
    const articles = await res.json();
    const orderFormContent = document.getElementById('orderFormContent');
    orderFormContent.innerHTML = ''; // Vorherigen Inhalt leeren
    articles.forEach(art => {
      const div = document.createElement('div');
      div.innerHTML = `
        <span><strong>${art.artikelNr} - ${art.bezeichnung}</strong> (${art.beschreibung}) - Bestand: ${art.bestand}</span>
        <label> Menge: <input type="number" min="0" max="${art.bestand}" value="0" data-artikel-nr="${art.artikelNr}" /></label>
      `;
      orderFormContent.appendChild(div);
    });
  } catch (error) {
    console.error(error);
  }
}

/** Sammelt die eingegebenen Mengen und zeigt eine Bestellbestätigung an */
function submitOrder(event) {
  event.preventDefault();
  const orderInputs = document.querySelectorAll('#orderFormContent input[type="number"]');
  let orderDetails = '<ul>';
  orderInputs.forEach(input => {
    const quantity = parseInt(input.value);
    if (quantity > 0) {
      const artikelNr = input.getAttribute('data-artikel-nr');
      orderDetails += `<li>Artikel ${artikelNr}: Menge ${quantity}</li>`;
    }
  });
  orderDetails += '</ul>';
  if (orderDetails === '<ul></ul>') {
    alert('Bitte geben Sie mindestens eine Menge ein.');
    return;
  }
  document.getElementById('orderDetailContent').innerHTML = orderDetails;
  showSection('orderDetail');
}

/** Registrierung: Überprüft die Passwörter und sendet die Daten an /register */
async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
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

/** Login: Sendet die Anmeldedaten an /login und leitet je nach Rolle weiter */
async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
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
      currentUserRole = data.role;
      if (data.role === 'Kunde') {
        document.getElementById('btnLogin').style.display = 'none';
        document.getElementById('btnRegister').style.display = 'none';
        document.getElementById('btnLogout').style.display = 'inline-block';
        // Falls der Benutzer wegen einer Bestellung zum Login kam, leite zur OrderForm weiter
        if (redirectToOrder) {
          redirectToOrder = false;
          showSection('orderForm');
          loadOrderForm();
        } else {
          showSection('startScreen');
        }
      } else if (data.role === 'Admin') {
        updateNavForAdmin();
        showSection('adminArtikelScreen');
      } else if (data.role === 'Lagerist') {
        updateNavForLagerist();
        showSection('lagerWareneingangScreen');
      } else {
        showSection('startScreen');
      }
    } else {
      const errMsg = await res.text();
      document.getElementById('loginError').textContent = errMsg;
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Fehler beim Einloggen.';
  }
}

/** Lädt Artikel vom Server und füllt die Artikel-Tabelle (für den Startbildschirm) */
async function loadArticles() {
  try {
    const res = await fetch('/articles');
    if (!res.ok) throw new Error('Fehler beim Laden der Artikel');
    const articles = await res.json();
    const tableBody = document.querySelector('#articleTable tbody');
    tableBody.innerHTML = '';
    articles.forEach(art => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${art.artikelNr}</td>
        <td>${art.bezeichnung}</td>
        <td>${art.beschreibung}</td>
        <td>${art.bestand}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
  }
}

/** Clientseitige Artikelsuche */
function searchArticles() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#articleTable tbody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

/** Beim Laden der Seite werden Artikel geladen */
window.onload = () => {
  loadArticles();
};

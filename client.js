/**
 * client.js
 * Vollständige Version mit aktualisiertem Login-Flow (loginWrapper) und Debug-Ausgaben.
 * Weitere Funktionen (Artikelverwaltung, Bestellvorgang, Benutzerverwaltung) sind ebenfalls enthalten.
 */

/* ---------------------------
   Globale Funktionen & Variablen
--------------------------- */
function showSection(sectionId) {
  const sections = document.querySelectorAll('main section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
  if (sectionId === 'startScreen') {
    loadArticles();
  }
}

function togglePassword(fieldId) {
  const pwField = document.getElementById(fieldId);
  pwField.type = (pwField.type === 'password') ? 'text' : 'password';
}

function checkDivers() {
  const genderSelect = document.getElementById('genderSelect');
  const customField = document.getElementById('customGenderField');
  customField.style.display = (genderSelect.value === 'Divers') ? 'block' : 'none';
}

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

function searchArticles() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#articleTable tbody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

/* ---------------------------
   Bestell-Funktionen
--------------------------- */
async function loadOrderForm() {
  try {
    const res = await fetch('/articles');
    if (!res.ok) throw new Error('Fehler beim Laden der Artikel');
    const articles = await res.json();
    const orderFormContent = document.getElementById('orderFormContent');
    orderFormContent.innerHTML = '';
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
  alert("Bestellung erfolgreich!");
}

function handleOrder() {
  if (!window.currentUserRole) {
    window.redirectToOrder = true;
    showSection('loginScreen');
  } else {
    showSection('orderForm');
    loadOrderForm();
  }
}

/* ---------------------------
   Auth-Funktionen (Registrierung / Login)
--------------------------- */
async function handleRegister(event) {
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

async function handleLogin(event) {
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
      window.currentUserRole = data.role;
      return data.role;  // Rolle zurückgeben
    } else {
      const errMsg = await res.text();
      document.getElementById('loginError').textContent = errMsg;
      return null;
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Fehler beim Einloggen.';
    return null;
  }
}

/**
 * loginWrapper: Ruft handleLogin auf und passt die UI je nach zurückgegebener Rolle an.
 */
async function loginWrapper(event) {
  const role = await handleLogin(event);
  console.log("Login result role:", role);
  if (role) {
    if (role === "Kunde") {
      document.getElementById('btnLogin').style.display = 'none';
      document.getElementById('btnRegister').style.display = 'none';
      document.getElementById('btnLogout').style.display = 'inline-block';
      if (window.redirectToOrder) {
        window.redirectToOrder = false;
        showSection('orderForm');
        loadOrderForm();
      } else {
        showSection('startScreen');
      }
    } else if (role === "Admin") {
      updateNavForAdmin();
      showSection('adminArtikelScreen');
      loadAdminArticles();
    } else if (role === "Lagerist") {
      updateNavForLagerist();
      showSection('lagerSimulationScreen');
      if (typeof initLagerSimulation === "function") {
        initLagerSimulation();
      }
    } else {
      showSection('startScreen');
    }
  } else {
    console.log("Kein Role-Wert zurückgegeben, Login fehlgeschlagen");
    showSection('loginScreen');
  }
}

/* ---------------------------
   Admin-Funktionen (Artikel- und Benutzerverwaltung)
   (Die folgenden Funktionen bleiben weitgehend unverändert)
--------------------------- */
async function loadAdminArticles() {
  try {
    const res = await fetch('/articles');
    if (!res.ok) throw new Error('Fehler beim Laden der Artikel');
    const articles = await res.json();
    const articleListDiv = document.getElementById('adminArticleList');
    articleListDiv.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Artikel-Nr.</th>
            <th>Bezeichnung</th>
            <th>Beschreibung</th>
            <th>Bestand</th>
            <th>Mindestbestand</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
    const tbody = articleListDiv.querySelector('tbody');
    articles.forEach(art => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${art.id || ''}</td>
        <td>${art.artikelNr}</td>
        <td>${art.bezeichnung}</td>
        <td>${art.beschreibung}</td>
        <td>${art.bestand}</td>
        <td>${art.mindestbestand || 0}</td>
        <td>
          <button onclick="editArticle(${art.id})">Bearbeiten</button>
          <button onclick="deleteArticle(${art.id})">Löschen</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
  }
}

async function addArticle(event) {
  event.preventDefault();
  const form = document.getElementById('addArticleForm');
  const formData = new FormData(form);
  const body = {
    artikelNr: formData.get('artikelNr'),
    bezeichnung: formData.get('bezeichnung'),
    beschreibung: formData.get('beschreibung'),
    bestand: formData.get('bestand'),
    mindestbestand: formData.get('mindestbestand')
  };
  try {
    const res = await fetch('/article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    alert(text);
    loadAdminArticles();
  } catch (error) {
    alert('Fehler beim Hinzufügen des Artikels.');
  }
}

async function deleteArticle(id) {
  if (!confirm("Artikel wirklich löschen?")) return;
  try {
    const res = await fetch(`/article/${id}`, { method: 'DELETE' });
    const text = await res.text();
    alert(text);
    loadAdminArticles();
  } catch (error) {
    alert("Fehler beim Löschen des Artikels.");
  }
}

async function editArticle(id) {
  const newBezeichnung = prompt("Neue Bezeichnung:");
  const newBeschreibung = prompt("Neue Beschreibung:");
  const newBestand = prompt("Neuer Bestand:");
  const newMindestbestand = prompt("Neuer Mindestbestand:");
  const body = {
    bezeichnung: newBezeichnung,
    beschreibung: newBeschreibung,
    bestand: newBestand,
    mindestbestand: newMindestbestand
  };
  try {
    const res = await fetch(`/article/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    alert(text);
    loadAdminArticles();
  } catch (error) {
    alert("Fehler beim Aktualisieren des Artikels.");
  }
}

async function loadUsers() {
  try {
    const res = await fetch('/users');
    if (!res.ok) throw new Error('Fehler beim Laden der Benutzer');
    const users = await res.json();
    window.userList = users;
    const userListDiv = document.getElementById('adminKundenList');
    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Benutzername</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Vorname</th>
            <th>Geschlecht</th>
            <th>Straße</th>
            <th>Ort</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
    `;
    users.forEach(user => {
      html += `
        <tr>
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.vorname || ''}</td>
          <td>${user.gender || ''}</td>
          <td>${user.strasse || ''}</td>
          <td>${user.ort || ''}</td>
          <td>
            <button onclick="openEditUser(${user.id})">Bearbeiten</button>
            <button onclick="deleteUser(${user.id})">Löschen</button>
          </td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
    userListDiv.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

function openEditUser(id) {
  const user = window.userList.find(u => u.id == id);
  if (!user) {
    alert("Benutzer nicht gefunden.");
    return;
  }
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUsername').value = user.username;
  document.getElementById('editEmail').value = user.email;
  document.getElementById('editRole').value = user.role;
  document.getElementById('editVorname').value = user.vorname || '';
  document.getElementById('editGender').value = user.gender || '';
  document.getElementById('editStrasse').value = user.strasse || '';
  document.getElementById('editOrt').value = user.ort || '';
  document.getElementById('editPassword').value = '';
  document.getElementById('editUserScreen').style.display = 'block';
}

function closeEditUser() {
  document.getElementById('editUserScreen').style.display = 'none';
}

async function handleEditUserSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('editUserForm');
  const formData = new FormData(form);
  const id = formData.get('id');
  const body = {
    username: formData.get('username'),
    email: formData.get('email'),
    role: formData.get('role'),
    vorname: formData.get('vorname'),
    gender: formData.get('gender'),
    strasse: formData.get('strasse'),
    ort: formData.get('ort')
  };
  const newPassword = formData.get('password');
  if (newPassword && newPassword.trim() !== '') {
    body.password = newPassword;
  }
  try {
    const res = await fetch(`/user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    alert(text);
    closeEditUser();
    loadUsers();
  } catch (error) {
    alert("Fehler beim Aktualisieren des Benutzers.");
  }
}

async function addUser(event) {
  event.preventDefault();
  const form = document.getElementById('addUserForm');
  const formData = new FormData(form);
  const body = {
    username: formData.get('username'),
    email: formData.get('email'),
    role: formData.get('role'),
    vorname: formData.get('vorname'),
    gender: formData.get('gender'),
    strasse: formData.get('strasse'),
    ort: formData.get('ort'),
    password: formData.get('password')
  };
  try {
    const res = await fetch('/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    alert(text);
    loadUsers();
  } catch (error) {
    alert("Fehler beim Hinzufügen des Benutzers.");
  }
}

async function deleteUser(id) {
  if (!confirm("Benutzer wirklich löschen?")) return;
  try {
    const res = await fetch(`/user/${id}`, { method: 'DELETE' });
    const text = await res.text();
    alert(text);
    loadUsers();
  } catch (error) {
    alert("Fehler beim Löschen des Benutzers.");
  }
}

/* ---------------------------
   Globaler Zustand & Navigation (Admin/Lagerist/Gast)
--------------------------- */
function updateNavForAdmin() {
  document.getElementById('guestNav').style.display = 'none';
  document.getElementById('adminNav').style.display = 'inline-block';
  document.getElementById('lageristNav').style.display = 'none';
}

function updateNavForLagerist() {
  document.getElementById('guestNav').style.display = 'none';
  document.getElementById('adminNav').style.display = 'none';
  document.getElementById('lageristNav').style.display = 'inline-block';
}

function logoutUser() {
  document.getElementById('adminNav').style.display = 'none';
  document.getElementById('lageristNav').style.display = 'none';
  document.getElementById('guestNav').style.display = 'inline-block';
  document.getElementById('btnLogin').style.display = 'inline-block';
  document.getElementById('btnRegister').style.display = 'inline-block';
  document.getElementById('btnLogout').style.display = 'none';
  window.currentUserRole = null;
  window.redirectToOrder = false;
  showSection('startScreen');
}



/* ---------------------------
   Exponiere Funktionen global für HTML-Eventhandler
--------------------------- */
window.showSection = showSection;
window.togglePassword = togglePassword;
window.checkDivers = checkDivers;
window.loadArticles = loadArticles;
window.searchArticles = searchArticles;
window.handleOrder = handleOrder;
window.loadOrderForm = loadOrderForm;
window.submitOrder = submitOrder;
window.handleRegister = handleRegister;
window.loginWrapper = loginWrapper;
window.loadAdminArticles = loadAdminArticles;
window.addArticle = addArticle;
window.deleteArticle = deleteArticle;
window.editArticle = editArticle;
window.loadUsers = loadUsers;
window.openEditUser = openEditUser;
window.closeEditUser = closeEditUser;
window.handleEditUserSubmit = handleEditUserSubmit;
window.addUser = addUser;
window.deleteUser = deleteUser;
window.logoutUser = logoutUser;

/* Beim Laden der Seite werden Artikel im Startbildschirm geladen */
window.onload = () => {
  loadArticles();
};
/**
 * Globale Variable zur Lager-Simulation:
 * selectedItem = null => kein Element ausgewählt
 */
let selectedItem = null;

/**
 * Klick-Logik: 
 * - Klicke zuerst z. B. auf eine "pallet" 
 * - Dann auf einen "lagerplatz" => "Lege palletX in lagerY ab!"
 */
function selectItem(itemId) {
  console.log("Clicked on:", itemId);
  if (!selectedItem) {
    selectedItem = itemId;
    console.log("Selected:", selectedItem);
  } else {
    // Aktion:
    if (selectedItem.startsWith('pallet') && itemId.startsWith('lager')) {
      alert("Lege " + selectedItem + " in " + itemId + " ab!");
    } else if (selectedItem.startsWith('good') && itemId.startsWith('pallet')) {
      alert("Packe " + selectedItem + " auf " + itemId + "!");
    } else {
      alert("Aktion zwischen " + selectedItem + " und " + itemId + " nicht definiert.");
    }
    selectedItem = null;
  }
}

/**
 * Initialisiert die Klick-Events für Wareneingang, Einlagerung usw.
 * Aufruf z. B. wenn man sich als Lagerist einloggt.
 */
function initLagerSimulation() {
  // Wareneingang
  const tor1 = document.getElementById('tor1');
  const tor2 = document.getElementById('tor2');
  const lkw1 = document.getElementById('lkw1');
  const lkw2 = document.getElementById('lkw2');
  const good1 = document.getElementById('good1');
  const good2 = document.getElementById('good2');

  if (tor1) tor1.addEventListener('click', () => selectItem('tor1'));
  if (tor2) tor2.addEventListener('click', () => selectItem('tor2'));
  if (lkw1) lkw1.addEventListener('click', () => selectItem('lkw1'));
  if (lkw2) lkw2.addEventListener('click', () => selectItem('lkw2'));
  if (good1) good1.addEventListener('click', () => selectItem('good1'));
  if (good2) good2.addEventListener('click', () => selectItem('good2'));

  // Einlagerung
  const pallet1 = document.getElementById('pallet1');
  const pallet2 = document.getElementById('pallet2');
  const lager1 = document.getElementById('lager1');
  const lager2 = document.getElementById('lager2');
  const lager3 = document.getElementById('lager3');

  if (pallet1) pallet1.addEventListener('click', () => selectItem('pallet1'));
  if (pallet2) pallet2.addEventListener('click', () => selectItem('pallet2'));
  if (lager1) lager1.addEventListener('click', () => selectItem('lager1'));
  if (lager2) lager2.addEventListener('click', () => selectItem('lager2'));
  if (lager3) lager3.addEventListener('click', () => selectItem('lager3'));

  // Umlagerung
  const umlagerung1 = document.getElementById('umlagerung1');
  const umlagerung2 = document.getElementById('umlagerung2');
  if (umlagerung1) umlagerung1.addEventListener('click', () => selectItem('umlagerung1'));
  if (umlagerung2) umlagerung2.addEventListener('click', () => selectItem('umlagerung2'));

  // Kommissionierung
  const lagerA = document.getElementById('lagerA');
  const lagerB = document.getElementById('lagerB');
  const fertig1 = document.getElementById('fertig1');

  if (lagerA) lagerA.addEventListener('click', () => selectItem('lagerA'));
  if (lagerB) lagerB.addEventListener('click', () => selectItem('lagerB'));
  if (fertig1) fertig1.addEventListener('click', () => selectItem('fertig1'));

  // Warenausgang
  const ausgangPalette1 = document.getElementById('ausgangPalette1');
  if (ausgangPalette1) ausgangPalette1.addEventListener('click', () => selectItem('ausgangPalette1'));
}

/**
 * Rufe initLagerSimulation() auf, sobald man sich als Lagerist einloggt.
 * (In loginWrapper, wenn role === "Lagerist".)
 */

/* Im loginWrapper ... */
async function loginWrapper(event) {
  const role = await handleLogin(event);
  if (role) {
    window.currentUserRole = role;
    if (role === "Kunde") {
      // ...
    } else if (role === "Admin") {
      // ...
    } else if (role === "Lagerist") {
      updateNavForLagerist();
      showSection('lagerWareneingangScreen');
      initLagerSimulation(); // <-- Hier die Simulation initialisieren
    } else {
      showSection('startScreen');
    }
  } else {
    // ...
  }
}

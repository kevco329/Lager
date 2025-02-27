/**
 * admin.js
 * Funktionen für den Admin-Bereich: Artikel- und Benutzerverwaltung.
 */

/* Artikelverwaltung */

/** Lädt Artikeldaten für den Admin-Bereich und zeigt sie in einer Tabelle an. */
export async function loadAdminArticles() {
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

/** Fügt einen neuen Artikel hinzu (Admin). */
export async function addArticle(event) {
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

/** Löscht einen Artikel (Admin). */
export async function deleteArticle(id) {
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

/** Bearbeitet einen Artikel (Admin). */
export async function editArticle(id) {
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

/* Benutzerverwaltung */

/** Lädt alle Benutzer für den Admin-Bereich und zeigt sie in einer Tabelle an. */
export async function loadUsers() {
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

/** Öffnet das vorgefüllte Bearbeitungsformular für einen Benutzer (Admin). */
export function openEditUser(id) {
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

/** Schließt das Bearbeitungsformular für einen Benutzer. */
export function closeEditUser() {
  document.getElementById('editUserScreen').style.display = 'none';
}

/** Sendet die aktualisierten Benutzerdaten aus dem Bearbeitungsformular an den Server. */
export async function handleEditUserSubmit(event) {
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

/** Fügt einen neuen Benutzer hinzu (Admin). */
export async function addUser(event) {
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

/** Löscht einen Benutzer (Admin). */
export async function deleteUser(id) {
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

/**
 * common.js
 * Gemeinsame Funktionen für die Lagersimulation.
 */

/** Zeigt nur die gewünschte Section an und lädt ggf. Artikel (bei startScreen). */
export function showSection(sectionId) {
  const sections = document.querySelectorAll('main section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
  if (sectionId === 'startScreen') {
    loadArticles();
  }
}

/** Schaltet ein Passwortfeld zwischen "password" und "text" um. */
export function togglePassword(fieldId) {
  const pwField = document.getElementById(fieldId);
  pwField.type = (pwField.type === 'password') ? 'text' : 'password';
}

/** Zeigt das Custom-Geschlechtsfeld an, wenn "Divers" ausgewählt ist. */
export function checkDivers() {
  const genderSelect = document.getElementById('genderSelect');
  const customField = document.getElementById('customGenderField');
  customField.style.display = (genderSelect.value === 'Divers') ? 'block' : 'none';
}

/** Lädt Artikeldaten vom Server und füllt die Tabelle im Startbildschirm. */
export async function loadArticles() {
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

/** Clientseitige Artikelsuche im Startbildschirm. */
export function searchArticles() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#articleTable tbody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}
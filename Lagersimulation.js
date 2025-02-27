/**
 * LagerSimulation.js
 * Enthält die Logik für die visuelle Lager-Simulation.
 */

/**
 * Zeigt nur die angeforderte Sektion an.
 */
function showSection(sectionId) {
  const sections = document.querySelectorAll('main section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

/**
 * Globale Variable für die aktuelle Auswahl.
 */
let selectedItem = null;

/**
 * Verarbeitet Klicks auf interaktive Elemente.
 */
function selectItem(itemId) {
  console.log("Clicked on:", itemId);
  if (!selectedItem) {
    selectedItem = itemId;
    console.log("Selected:", selectedItem);
  } else {
    if (selectedItem === 'stapler' && itemId.startsWith('tor')) {
      alert("Stapler nimmt Ware vom " + itemId + " auf!");
    } else if (selectedItem === 'stapler' && itemId.startsWith('lager')) {
      alert("Stapler legt Ware auf " + itemId + " ab!");
    } else {
      alert("Aktion zwischen " + selectedItem + " und " + itemId + " nicht definiert.");
    }
    selectedItem = null;
  }
}

/**
 * Initialisiert die Simulation, indem Klick-Listener auf interaktive Elemente gesetzt werden.
 */
function initLagerSimulation() {
  const tor1 = document.getElementById('tor1');
  const tor2 = document.getElementById('tor2');
  const lkw1 = document.getElementById('lkw1');
  const lkw2 = document.getElementById('lkw2');
  const good1 = document.getElementById('good1');
  const good2 = document.getElementById('good2');

  if (tor1) tor1.addEventListener('click', () => selectItem('tor1'));
  if (tor2) tor2.addEventListener('click', () => selectItem('tor2'));
  if (lkw1) lkw1.addEventListener('click', () => selectItem('lkw1')); // korrigiert
  if (lkw2) lkw2.addEventListener('click', () => selectItem('lkw2')); // korrigiert
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
 * Geht zurück zur Hauptseite (Lager.html).
 */
function goBack() {
  window.location.href = "Lager.html";
}

// Initialisiere die Simulation beim Laden der Seite.
window.onload = initLagerSimulation;
window.showSection = showSection;
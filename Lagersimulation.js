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
    const platz1 = document.getElementById('lager1'); // in Einlagerung als Beispiel
    const platz2 = document.getElementById('lager2');
    const platz3 = document.getElementById('lager3');
    const stapler = document.getElementById('stapler');
    const lkw1 = document.getElementById('lkw1');
    const lkw2 = document.getElementById('lkw2');
    const good1 = document.getElementById('good1');
    const good2 = document.getElementById('good2');
  
    if (tor1) tor1.addEventListener('click', () => selectItem('tor1'));
    if (tor2) tor2.addEventListener('click', () => selectItem('tor2'));
    if (lkw1) lkw1.addEventListener('click', () => selectItem('tor1'));
    if (lkw2) lkw2.addEventListener('click', () => selectItem('tor2'));
    if (platz1) platz1.addEventListener('click', () => selectItem('lager1'));
    if (platz2) platz2.addEventListener('click', () => selectItem('lager2'));
    if (platz3) platz3.addEventListener('click', () => selectItem('lager3'));
    if (stapler) stapler.addEventListener('click', () => selectItem('stapler'));
    if (good1) good1.addEventListener('click', () => selectItem('good1'));
    if (good2) good2.addEventListener('click', () => selectItem('good2'));
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
  
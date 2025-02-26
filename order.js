/**
 * order.js
 * Funktionen für den Bestellvorgang.
 *
 * KEIN handleOrder mehr hier,
 * da wir es nun in client.js als Wrapper definieren, 
 * um window.currentUserRole abzufragen.
 */

import { showSection } from "./common.js";

/** Lädt die Artikeldaten und füllt das Bestellformular. */
export async function loadOrderForm() {
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

/** Sammelt die eingegebenen Mengen und zeigt die Bestellzusammenfassung an. */
export function submitOrder(event) {
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

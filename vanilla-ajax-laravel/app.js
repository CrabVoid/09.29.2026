// app.js - Vanilla JavaScript AJAX using Fetch API
// Adjust the API_BASE_URL to match your Laravel backend URL
const API_BASE_URL = "http://localhost:8000/api"; // Laravel default dev server

/**
 * Fetch items from the Laravel API and render them.
 */
function loadData() {
  fetch(`${API_BASE_URL}/items`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status})`);
      }
      return response.json();
    })
    .then((data) => {
      renderData(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      const container = document.getElementById("dataContainer");
      container.innerHTML = `<p style="color:red;">Failed to load data: ${error.message}</p>`;
    });
}

/**
 * Render a JSON array of items into the DOM.
 * Expected format: [{id: 1, name: "Item 1", description: "..."}, ...]
 */
function renderData(items) {
  const container = document.getElementById("dataContainer");
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = "<p>No data received.</p>";
    return;
  }

  const html = items
    .map(
      (item) => `
    <div class="item">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description || "(no description)")}</p>
    </div>`
    )
    .join("");

  container.innerHTML = html;
}

/**
 * Simple HTML‑escaping to avoid XSS when inserting data.
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Bind button click
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loadBtn");
  btn.addEventListener("click", loadData);
});

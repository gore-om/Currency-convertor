// FINAL script.js — fixed bindings + dropdown behavior (box shows code, dropdown shows full name)

const apiKey = "a6e07ad36f977aeb3c644f69b21e7363";
const apiUrl = "https://api.exchangerate.host/convert";

// IDs in your HTML
const selFrom = document.getElementById("from");
const selTo = document.getElementById("to");
const fromFlag = document.getElementById("from-flag");
const toFlag = document.getElementById("to-flag");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convert");
const swapBtn = document.getElementById("swap");
const themeToggle = document.getElementById("theme-toggle");
const result = document.getElementById("result");

// Currency definitions with flag codes (flagcdn uses 2-letter country codes)
const currencies = [
  { code: "USD", name: "United States Dollar", flag: "us" },
  { code: "EUR", name: "Euro", flag: "eu" },
  { code: "GBP", name: "British Pound", flag: "gb" },
  { code: "INR", name: "Indian Rupee", flag: "in" },
  { code: "AUD", name: "Australian Dollar", flag: "au" },
  { code: "CAD", name: "Canadian Dollar", flag: "ca" },
  { code: "SGD", name: "Singapore Dollar", flag: "sg" },
  { code: "CHF", name: "Swiss Franc", flag: "ch" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "my" },
  { code: "JPY", name: "Japanese Yen", flag: "jp" },
  { code: "CNY", name: "Chinese Yuan", flag: "cn" },
  { code: "THB", name: "Thai Baht", flag: "th" },
  { code: "AED", name: "UAE Dirham", flag: "ae" },
  { code: "SAR", name: "Saudi Riyal", flag: "sa" },
  { code: "ZAR", name: "South African Rand", flag: "za" }
];

// Populate selects: each <option> stores both code and full name in dataset
function populateSelects() {
  currencies.forEach(cur => {
    const o1 = document.createElement("option");
    const o2 = document.createElement("option");

    o1.value = o2.value = cur.code;
    o1.dataset.code = cur.code;
    o1.dataset.full = `${cur.code} — ${cur.name}`;
    o1.dataset.flag = cur.flag;

    o2.dataset.code = cur.code;
    o2.dataset.full = `${cur.code} — ${cur.name}`;
    o2.dataset.flag = cur.flag;

    // initially show only the code in closed select
    o1.textContent = cur.code;
    o2.textContent = cur.code;

    selFrom.appendChild(o1);
    selTo.appendChild(o2);
  });

  selFrom.value = "USD";
  selTo.value = "INR";
  updateFlags();
}
populateSelects();

// Helper to update flag images
function updateFlags() {
  const f = currencies.find(c => c.code === selFrom.value);
  const t = currencies.find(c => c.code === selTo.value);
  fromFlag.src = f ? `https://flagcdn.com/w20/${f.flag}.png` : "";
  toFlag.src = t ? `https://flagcdn.com/w20/${t.flag}.png` : "";
  fromFlag.alt = selFrom.value;
  toFlag.alt = selTo.value;
}

// When user opens the select (pointerdown), show full names in the dropdown
function attachDropdownBehavior(selectEl) {
  // pointerdown works better than mousedown for some mobile browsers
  selectEl.addEventListener("pointerdown", () => {
    for (let opt of selectEl.options) {
      opt.textContent = opt.dataset.full || opt.value;
    }
  });

  // when selection changes (or the select loses focus), revert option labels to code-only
  function collapseToCodes() {
    for (let opt of selectEl.options) {
      // set visible text to code; store full name in dataset.full for dropdown
      opt.textContent = opt.dataset.code || opt.value;
    }
    // ensure selected option still shows code (it will)
    updateFlags();
  }

  selectEl.addEventListener("change", () => {
    // After change, collapse others to codes and update flags
    collapseToCodes();
  });

  // Also collapse when focus is lost (covers cases where user taps away)
  selectEl.addEventListener("blur", () => {
    // slight delay to allow change event to fire on some browsers
    setTimeout(collapseToCodes, 100);
  });
}

attachDropdownBehavior(selFrom);
attachDropdownBehavior(selTo);

// Convert function
async function convert() {
  const from = selFrom.value;
  const to = selTo.value;
  const amt = parseFloat(amountInput.value);
  if (!amt || amt <= 0) {
    result.innerHTML = "⚠️ Please enter a valid amount.";
    return;
  }

  result.innerHTML = "⏳ Converting...";

  try {
    const resp = await fetch(`${apiUrl}?from=${from}&to=${to}&amount=${amt}&access_key=${apiKey}`);
    const data = await resp.json();

    if (data && data.success && typeof data.result === "number") {
      result.innerHTML = `💰 ${amt} ${from} = <strong>${data.result.toFixed(2)}</strong> ${to}`;
    } else {
      console.error("API response:", data);
      result.innerHTML = "❌ Conversion failed. Try again.";
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = "⚠️ Network error. Try again.";
  }
}

// Swap handler
swapBtn.addEventListener("click", () => {
  const a = selFrom.value;
  selFrom.value = selTo.value;
  selTo.value = a;
  updateFlags();
});

// Convert button
convertBtn.addEventListener("click", convert);

// Allow pressing Enter in amount box to trigger conversion
amountInput.addEventListener("keyup", e => {
  if (e.key === "Enter") convert();
});

// Theme toggle (keeps previous behavior)
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Initialize flags once
updateFlags();

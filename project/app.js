const list = document.querySelector('#laptop-list');
const budgetInput = document.querySelector('#budget');
const sortSelect = document.querySelector('#sort');
const count = document.querySelector('#result-count');

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const formatWeight = (kg) => `${kg.toFixed(2)} kg`;

function metric(label, value) {
  return `<div class="metric"><span class="metric-label">${label}</span><span class="metric-value">${value}</span></div>`;
}

function render(laptops) {
  if (laptops.length === 0) {
    list.innerHTML = '<div class="empty-state">No laptops match that budget. Try increasing it or reset the filter.</div>';
    count.textContent = '0 laptops';
    return;
  }

  count.textContent = `${laptops.length} of 5 laptops`;
  list.innerHTML = laptops.map((laptop) => `
    <article class="laptop-card">
      <div>
        <span class="brand">${laptop.brand}</span>
        <h3 class="laptop-name">${laptop.name}</h3>
        <div class="price">${money.format(laptop.price)}</div>
        <div class="price-note">${laptop.priceLabel}</div>
      </div>
      ${metric('Weight', formatWeight(laptop.weightKg))}
      ${metric('Battery', laptop.batteryLabel)}
      ${metric('RAM', laptop.ramLabel)}
      <div class="source-links">
        <a class="source-link" href="${laptop.source}" target="_blank" rel="noopener noreferrer" aria-label="Open specifications source for ${laptop.name}">Specs ↗</a>
        ${laptop.priceSource ? `<a class="source-link" href="${laptop.priceSource}" target="_blank" rel="noopener noreferrer" aria-label="Open price source for ${laptop.name}">Price ↗</a>` : ''}
      </div>
    </article>
  `).join('');
}

function update() {
  const ceiling = budgetInput.value === '' ? Infinity : Number(budgetInput.value);
  const sortKey = sortSelect.value;
  let filtered = window.laptops.filter((laptop) => laptop.price <= ceiling);

  if (sortKey === 'price') filtered.sort((a, b) => a.price - b.price);
  if (sortKey === 'weight') filtered.sort((a, b) => a.weightKg - b.weightKg);
  if (sortKey === 'battery') filtered.sort((a, b) => (b.batteryHours ?? -1) - (a.batteryHours ?? -1));
  if (sortKey === 'ram') filtered.sort((a, b) => b.ramGb - a.ramGb);
  render(filtered);
}

budgetInput.addEventListener('input', update);
sortSelect.addEventListener('change', update);
document.querySelector('#reset').addEventListener('click', () => {
  budgetInput.value = '';
  sortSelect.value = 'recommended';
  update();
});

fetch('laptops.json')
  .then((response) => {
    if (!response.ok) throw new Error('Laptop data could not be loaded.');
    return response.json();
  })
  .then((laptops) => {
    window.laptops = laptops;
    update();
  })
  .catch(() => {
    list.innerHTML = '<div class="empty-state">Laptop data could not be loaded. Open this page through a local web server so the browser can read laptops.json.</div>';
    count.textContent = '';
  });

/* Format: ?format=4x5|16x9|9x16 (Default 4x5), ?guides=1 zeigt Story-Safe-Zones.
   Füllt die Slots eines Creatives aus window.AD.
   - [data-slot="name"]  → innerHTML aus AD[name] (HTML erlaubt, z. B. <span class="accent">)
   - [data-photo="key"]  → src + Fokus (object-position) aus AD.photos[key]
   - [data-list="key"]   → <li>-Liste aus AD[key] (Array), Icon-Template wird geklont
   Leerer Wert = Element wird ausgeblendet. */
(function () {
  const q = new URLSearchParams(location.search);
  const fmt = q.get('format') || (window.AD && window.AD.format) || '4x5';
  document.documentElement.dataset.format = fmt;
  document.querySelectorAll('.ad').forEach(a => a.dataset.format = fmt);
  if (q.get('guides')) document.documentElement.dataset.guides = '1';
  const AD = window.AD || {};
  document.querySelectorAll('[data-slot]').forEach(el => {
    const v = AD[el.dataset.slot];
    if (v == null || v === '') { el.hidden = true; return; }
    el.innerHTML = v;
  });
  document.querySelectorAll('[data-photo]').forEach(el => {
    const p = (AD.photos || {})[el.dataset.photo];
    if (!p) { el.hidden = true; return; }
    el.src = p.src;
    if (p.focus) el.style.setProperty('--focus', p.focus);
    if (p.alt) el.alt = p.alt;
  });
  document.querySelectorAll('[data-list]').forEach(ul => {
    const items = AD[ul.dataset.list];
    const tpl = ul.querySelector('li');
    if (!Array.isArray(items) || !tpl) return;
    ul.innerHTML = '';
    items.forEach(t => { const li = tpl.cloneNode(true); li.querySelector('.txt').innerHTML = t; ul.appendChild(li); });
  });
  document.querySelectorAll('[data-chips]').forEach(box => {
    const items = AD[box.dataset.chips];
    const tpl = box.querySelector('.chip');
    if (!Array.isArray(items) || !tpl) return;
    box.innerHTML = '';
    items.forEach(t => { const c = tpl.cloneNode(true); c.querySelector('.txt').textContent = t; box.appendChild(c); });
  });
  document.documentElement.dataset.ready = 'true';
})();

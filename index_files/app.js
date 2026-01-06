const LS_PRODUCTS_KEY = 'boteco_products_v1';
const WHATSAPP_NUMBER = '5549998358251'; // troque se precisar
const DELIVERY_FEE_DEFAULT = 0; // taxa padrão

let PRODUCTS = [];
let CART = [];

function formatMoney(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

async function loadProducts() {
  try {
    const ls = localStorage.getItem(LS_PRODUCTS_KEY);
    if (ls) {
      PRODUCTS = JSON.parse(ls);
      renderAll();
      return;
    }
  } catch (e) {
    console.error('Erro localStorage', e);
  }

  try {
    const res = await fetch('./assets/data/products.default.json', { cache: 'no-store' });
    if (res.ok) {
      PRODUCTS = await res.json();
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(PRODUCTS));
    } else {
      PRODUCTS = [];
    }
  } catch (e) {
    console.error('Erro carregando JSON de produtos', e);
    PRODUCTS = [];
  }

  renderAll();
}

function renderAll() {
  renderCategoryFilter();
  applyFilters();
  updateCartUI();
}

function renderCategoryFilter() {
  const sel = document.getElementById('catFilter');
  if (!sel) return;
  const current = sel.value;
  while (sel.options.length > 1) sel.remove(1);

  const cats = [...new Set((PRODUCTS || []).map(p => p.category).filter(Boolean))].sort();
  cats.forEach(cat => {
    const o = document.createElement('option');
    o.value = cat;
    o.textContent = cat;
    sel.appendChild(o);
  });

  if (current) sel.value = current;
}

function renderProducts(list) {
  const root = document.getElementById('menuRoot');
  const empty = document.getElementById('emptyState');
  if (!root) return;

  root.innerHTML = '';

  if (!list || list.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'productCard';

    const desc = p.description || '';
    const code = p.code ? `<div class="small">Cód: ${p.code}</div>` : '';

    card.innerHTML = `
      <div class="productBody">
        <div class="productName">${p.name || ''}</div>
        ${code}
        <div class="productDesc">${desc}</div>
        <div class="productPrice">${formatMoney(Number(p.price || 0))}</div>
        <button class="btn primary" style="width:100%" data-add="${p.code || ''}">
          Adicionar ao carrinho
        </button>
      </div>
    `;

    root.appendChild(card);
  });

  root.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-add');
      addToCartByCode(code);
    });
  });
}

function getProductByCode(code) {
  if (!code) return null;
  const c = String(code).trim().toUpperCase();
  return (PRODUCTS || []).find(p => String(p.code || '').toUpperCase() === c) || null;
}

function addToCartByCode(code) {
  const prod = getProductByCode(code);
  if (!prod) {
    alert('Produto não encontrado para o código: ' + code);
    return;
  }

  const existing = CART.find(i => i.code === prod.code);
  if (existing) {
    existing.qtd += 1;
  } else {
    CART.push({
      code: prod.code,
      name: prod.name,
      price: Number(prod.price || 0),
      qtd: 1
    });
  }

  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const bodyEl = document.getElementById('cartBody');
  const itemsTotalEl = document.getElementById('itemsTotal');
  const deliveryFeeEl = document.getElementById('deliveryFee');
  const grandTotalEl = document.getElementById('grandTotal');
  const typeEl = document.getElementById('cType');

  const totalItems = CART.reduce((s, i) => s + i.qtd, 0);
  if (countEl) countEl.textContent = totalItems;

  if (!bodyEl) return;

  if (CART.length === 0) {
    bodyEl.innerHTML = '<p class="muted">Seu carrinho está vazio.</p>';
  } else {
    bodyEl.innerHTML = '';
    CART.forEach(item => {
      const linha = document.createElement('div');
      linha.className = 'cartItem';
      const subtotalItem = item.price * item.qtd;
      linha.innerHTML = `
        <div class="cartItemHeader">
          <div class="cartItemName">${item.qtd}x ${item.name}</div>
          <div class="cartItemPrice">${formatMoney(subtotalItem)}</div>
        </div>
        <div class="small">Cód: ${item.code || '-'} • ${formatMoney(item.price)} cada</div>
        <div class="quantityControl">
          <button class="quantityBtn" data-dec="${item.code}">-</button>
          <span>${item.qtd}</span>
          <button class="quantityBtn" data-inc="${item.code}">+</button>
          <button class="iconBtn" data-del="${item.code}" style="margin-left:auto">Remover</button>
        </div>
      `;
      bodyEl.appendChild(linha);
    });

    bodyEl.querySelectorAll('[data-inc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-inc');
        const it = CART.find(i => i.code === code);
        if (it) {
          it.qtd++;
          updateCartUI();
        }
      });
    });

    bodyEl.querySelectorAll('[data-dec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-dec');
        const it = CART.find(i => i.code === code);
        if (it && it.qtd > 1) {
          it.qtd--;
          updateCartUI();
        }
      });
    });

    bodyEl.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-del');
        CART = CART.filter(i => i.code !== code);
        updateCartUI();
      });
    });
  }

  const subtotal = CART.reduce((s, i) => s + i.price * i.qtd, 0);
  const tipo = typeEl ? typeEl.value : 'Delivery';
  const taxa = tipo === 'Delivery' ? DELIVERY_FEE_DEFAULT : 0;
  const total = subtotal + taxa;

  if (itemsTotalEl) itemsTotalEl.textContent = formatMoney(subtotal);
  if (deliveryFeeEl) deliveryFeeEl.textContent = formatMoney(taxa);
  if (grandTotalEl) grandTotalEl.textContent = formatMoney(total);
}

function openCart() {
  const d = document.getElementById('drawer');
  const ov = document.getElementById('drawerOverlay');
  if (d) d.classList.add('active');
  if (ov) ov.classList.add('active');
}

function closeCart() {
  const d = document.getElementById('drawer');
  const ov = document.getElementById('drawerOverlay');
  if (d) d.classList.remove('active');
  if (ov) ov.classList.remove('active');
}

function buildWhatsappMessage() {
  const typeEl = document.getElementById('cType');
  const nameEl = document.getElementById('cName');
  const phoneEl = document.getElementById('cPhone');
  const addrEl = document.getElementById('cAddress');
  const bairroEl = document.getElementById('cBairro');
  const refEl = document.getElementById('cRef');
  const payEl = document.getElementById('cPay');
  const obsEl = document.getElementById('cObs');

  const tipo = typeEl?.value || 'Delivery';
  const nome = (nameEl?.value || '').trim();
  const fone = (phoneEl?.value || '').trim();
  const end = (addrEl?.value || '').trim();
  const bairro = (bairroEl?.value || '').trim();
  const ref = (refEl?.value || '').trim();
  const pag = payEl?.value || '';
  const obs = (obsEl?.value || '').trim();

  if (!nome) {
    alert('Preencha o nome para o pedido.');
    return null;
  }
  if (tipo === 'Delivery' && !end) {
    alert('Para delivery, preencha o endereço.');
    return null;
  }
  if (CART.length === 0) {
    alert('Seu carrinho está vazio.');
    return null;
  }

  const subtotal = CART.reduce((s, i) => s + i.price * i.qtd, 0);
  const taxa = tipo === 'Delivery' ? DELIVERY_FEE_DEFAULT : 0;
  const total = subtotal + taxa;

  let msg = '';
  msg += '*NOVO PEDIDO - Boteco do Belém*%0A%0A';
  msg += `*Nome:* ${nome}%0A`;
  msg += `*Tipo:* ${tipo}%0A`;
  if (fone) msg += `*Telefone:* ${fone}%0A`;
  if (tipo === 'Delivery') {
    msg += `*Endereço:* ${end}%0A`;
    if (bairro) msg += `*Bairro:* ${bairro}%0A`;
    if (ref) msg += `*Referência:* ${ref}%0A`;
  }
  msg += `*Pagamento:* ${pag}%0A`;
  if (obs) msg += `*Observações:* ${obs}%0A`;

  msg += `%0A*ITENS:*%0A`;
  CART.forEach(i => {
    msg += `%0A${i.qtd}x ${i.name} (cód: ${i.code || '-'})%0A`;
    msg += `${formatMoney(i.price)} cada = ${formatMoney(i.price * i.qtd)}%0A`;
  });

  msg += `%0A*Subtotal:* ${formatMoney(subtotal)}%0A`;
  msg += `*Taxa entrega:* ${formatMoney(taxa)}%0A`;
  msg += `*TOTAL:* ${formatMoney(total)}`;

  return msg;
}

function checkout() {
  const msg = buildWhatsappMessage();
  if (!msg) return;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, '_blank');
}

function applyFilters() {
  const searchEl = document.getElementById('search');
  const catEl = document.getElementById('catFilter');
  const search = (searchEl?.value || '').toLowerCase();
  const cat = catEl?.value || '';

  const filtered = (PRODUCTS || []).filter(p => {
    const txt = (String(p.name || '') + ' ' + String(p.description || '') + ' ' + String(p.code || '')).toLowerCase();
    if (search && !txt.includes(search)) return false;
    if (cat && p.category !== cat) return false;
    return true;
  });

  renderProducts(filtered);
}

function setupNavToggle() {
  const btn = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    if (links.style.display === 'flex') {
      links.style.display = 'none';
    } else {
      links.style.display = 'flex';
      links.style.flexDirection = 'column';
      links.style.gap = '8px';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  const searchEl = document.getElementById('search');
  const catEl = document.getElementById('catFilter');
  const fab = document.getElementById('cartFab');
  const closeBtn = document.getElementById('closeCart');
  const overlay = document.getElementById('drawerOverlay');
  const clearBtn = document.getElementById('clearCart');
  const typeEl = document.getElementById('cType');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const waHero = document.querySelector('[data-whatsapp], #waHero');

  if (searchEl) searchEl.addEventListener('input', applyFilters);
  if (catEl) catEl.addEventListener('change', applyFilters);
  if (fab) fab.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (confirm('Limpar carrinho?')) {
      CART = [];
      updateCartUI();
    }
  });
  if (typeEl) typeEl.addEventListener('change', updateCartUI);
  if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
  if (waHero) {
    waHero.addEventListener('click', e => {
      e.preventDefault();
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de fazer um pedido.')}`;
      window.open(url, '_blank');
    });
  }

  setupNavToggle();
});

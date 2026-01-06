const LS_PRODUCTS_KEY = 'boteco_products_v1';
const LS_CONFIG_KEY = 'boteco_config_v1';

function brl(v){
  try{ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  catch(e){ return 'R$ ' + (Math.round(v*100)/100).toFixed(2).replace('.',','); }
}

function parseFloatBRL(s){
  if(typeof s !== 'string') return Number(s||0);
  const v = s.replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,'');
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function loadProducts(){
  try{ return JSON.parse(localStorage.getItem(LS_PRODUCTS_KEY) || '[]'); }catch(e){ return []; }
}

function saveProducts(products){
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
}

function loadConfig(){
  try{ return JSON.parse(localStorage.getItem(LS_CONFIG_KEY) || 'null'); }catch(e){ return null; }
}

function saveConfig(cfg){
  localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(cfg));
}

function renderTable(){
  const tbody = document.getElementById('tbody');
  const products = loadProducts();
  tbody.innerHTML = '';

  const q = (document.getElementById('q')?.value || '').trim().toLowerCase();

  for(const p of products){
    if(q){
      const hay = `${p.code} ${p.name} ${p.category}`.toLowerCase();
      if(!hay.includes(q)) continue;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input value="${p.code}" data-k="code" data-code="${p.code}" disabled></td>
      <td><input value="${(p.name||'').replaceAll('"','&quot;')}" data-k="name" data-code="${p.code}"></td>
      <td><input value="${(p.category||'').replaceAll('"','&quot;')}" data-k="category" data-code="${p.code}"></td>
      <td><input value="${p.price}" data-k="price" data-code="${p.code}"></td>
      <td><input value="${(p.desc||'').replaceAll('"','&quot;')}" data-k="desc" data-code="${p.code}"></td>
      <td style="text-align:center"><input type="checkbox" ${p.active ? 'checked' : ''} data-k="active" data-code="${p.code}"></td>
      <td style="text-align:right"><button data-del="${p.code}">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  }

  // bind change
  tbody.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('change', ()=>{
      const code = inp.getAttribute('data-code');
      const k = inp.getAttribute('data-k');
      const products = loadProducts();
      const idx = products.findIndex(x=>x.code===code);
      if(idx<0) return;
      if(k==='price') products[idx][k] = parseFloatBRL(inp.value);
      else if(k==='active') products[idx][k] = inp.checked;
      else products[idx][k] = inp.value;
      saveProducts(products);
    });
  });

  tbody.querySelectorAll('button[data-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const code = btn.getAttribute('data-del');
      if(!confirm('Excluir produto ' + code + '?')) return;
      const products = loadProducts().filter(p=>p.code!==code);
      saveProducts(products);
      renderTable();
    });
  });
}

function exportJSON(){
  const data = {
    config: loadConfig(),
    products: loadProducts()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'boteco_backup.json';
  a.click();
}

function importJSON(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      if(data.config) saveConfig(data.config);
      if(Array.isArray(data.products)) saveProducts(data.products);
      alert('Importado com sucesso.');
      loadConfigToForm();
      renderTable();
    }catch(e){
      alert('Arquivo inválido.');
    }
  };
  reader.readAsText(file);
}

function loadConfigToForm(){
  const cfg = loadConfig();
  if(!cfg) return;
  document.getElementById('brandName').value = cfg.brand?.name || '';
  document.getElementById('tagline').value = cfg.brand?.tagline || '';
  document.getElementById('wa').value = cfg.brand?.whatsapp_number_e164 || '';
  document.getElementById('insta').value = cfg.brand?.instagram_url || '';
  document.getElementById('addr').value = cfg.brand?.address || '';
  document.getElementById('hours').value = cfg.brand?.hours || '';
  document.getElementById('fee').value = cfg.delivery?.default_fee ?? 0;
  document.getElementById('deliveryEnabled').checked = !!cfg.delivery?.enabled;
}

function saveConfigFromForm(){
  const cfg = loadConfig() || {brand:{}, delivery:{}};
  cfg.brand = cfg.brand || {};
  cfg.delivery = cfg.delivery || {};

  cfg.brand.name = document.getElementById('brandName').value.trim() || 'Boteco do Belém';
  cfg.brand.tagline = document.getElementById('tagline').value.trim() || '';
  cfg.brand.whatsapp_number_e164 = document.getElementById('wa').value.trim() || '';
  cfg.brand.instagram_url = document.getElementById('insta').value.trim() || '';
  cfg.brand.address = document.getElementById('addr').value.trim() || '';
  cfg.brand.hours = document.getElementById('hours').value.trim() || '';

  cfg.delivery.enabled = document.getElementById('deliveryEnabled').checked;
  cfg.delivery.default_fee = parseFloatBRL(document.getElementById('fee').value);

  saveConfig(cfg);
  alert('Configurações salvas.');
}

function addProduct(){
  const code = (document.getElementById('newCode').value || '').trim().toUpperCase();
  const name = (document.getElementById('newName').value || '').trim();
  const category = (document.getElementById('newCat').value || '').trim();
  const price = parseFloatBRL(document.getElementById('newPrice').value || '0');
  if(!code || !name){
    alert('Informe Código e Nome.');
    return;
  }
  const products = loadProducts();
  if(products.some(p=>p.code===code)){
    alert('Código já existe.');
    return;
  }
  products.push({code, name, category: category || 'Outros', price, desc:'', active:true});
  products.sort((a,b)=>a.code.localeCompare(b.code,'pt-BR',{numeric:true}));
  saveProducts(products);
  document.getElementById('newCode').value='';
  document.getElementById('newName').value='';
  document.getElementById('newCat').value='';
  document.getElementById('newPrice').value='';
  renderTable();
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('saveCfg').addEventListener('click', saveConfigFromForm);
  document.getElementById('exportBtn').addEventListener('click', exportJSON);
  document.getElementById('importFile').addEventListener('change', (e)=>{
    if(e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
  });
  document.getElementById('addBtn').addEventListener('click', addProduct);
  document.getElementById('q').addEventListener('input', renderTable);

  loadConfigToForm();
  renderTable();
});

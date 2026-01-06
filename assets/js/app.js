const LS_PRODUCTS_KEY = 'boteco_products_v1';
const LS_CONFIG_KEY   = 'boteco_config_v1';
const LS_PEDIDOS_KEY  = 'boteco_pedidos_v1';

function getDefaultConfig(){
  return {
    deliveryAtivo: true,
    taxaEntrega: 5,
    senhaAppAtiva: false,
    senhaAppValor: '',
    whatsapp: '5549998358251'
  };
}

function carregarConfiguracoes(){
  try{
    const raw = localStorage.getItem(LS_CONFIG_KEY);
    if(!raw) return getDefaultConfig();
    return Object.assign(getDefaultConfig(), JSON.parse(raw)||{});
  }catch(e){
    return getDefaultConfig();
  }
}

function salvarConfiguracoesObj(cfg){
  try{
    localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(cfg));
  }catch(e){}
}

let PRODUTOS = [];

async function carregarProdutosBase(){
  try{
    const ls = localStorage.getItem(LS_PRODUCTS_KEY);
    if(ls){
      PRODUTOS = JSON.parse(ls)||[];
      if(Array.isArray(PRODUTOS) && PRODUTOS.length) return;
    }
  }catch(e){}

  try{
    const r = await fetch('./assets/data/products.default.json',{cache:'no-store'});
    if(r.ok){
      PRODUTOS = await r.json();
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(PRODUTOS));
    }else{
      PRODUTOS = [];
    }
  }catch(e){
    PRODUTOS = [];
  }
}

function getCarrinho(){
  try{
    return JSON.parse(sessionStorage.getItem('boteco_cart_v1')||'[]');
  }catch(e){
    return [];
  }
}

function salvarCarrinho(cart){
  try{
    sessionStorage.setItem('boteco_cart_v1', JSON.stringify(cart||[]));
  }catch(e){}
}

// IMPORTANTE: agora o carrinho aceita observação por item.
// Regra: itens iguais COM A MESMA obs são agrupados. Se a obs for diferente, vira uma linha separada.
function addItemCarrinho(code){
  const prod = (PRODUTOS||[]).find(p=>String(p.code)===String(code));
  if(!prod) return;

  let cart = getCarrinho();

  // sempre adiciona um item "novo" com obs vazia (se o usuário quiser, edita na linha)
  // se já existir uma linha igual com obs vazia, soma nela.
  const idx = cart.findIndex(i => String(i.code)===String(prod.code) && String(i.obs||'').trim()==='');
  if(idx>=0){
    cart[idx].qtd += 1;
  }else{
    cart.push({
      code: String(prod.code),
      name: prod.name,
      price: Number(prod.price||0),
      qtd: 1,
      obs: ''
    });
  }

  salvarCarrinho(cart);
  return cart;
}

function getPedidos(){
  try{
    return JSON.parse(localStorage.getItem(LS_PEDIDOS_KEY)||'[]');
  }catch(e){
    return [];
  }
}

function salvarPedidos(lista){
  try{
    localStorage.setItem(LS_PEDIDOS_KEY, JSON.stringify(lista||[]));
  }catch(e){}
}

function registrarPedido(pedido){
  const lista = getPedidos();
  lista.push(pedido);
  salvarPedidos(lista);
}

function formatMoney(v){
  return 'R$ ' + Number(v||0).toFixed(2).replace('.',',');
}

function formatDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}

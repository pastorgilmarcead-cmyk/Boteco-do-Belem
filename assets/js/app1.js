// Chaves de armazenamento
const LS_PRODUCTS_KEY = 'boteco_products_v1';
const LS_CONFIG_KEY   = 'boteco_config_v1';
const LS_PEDIDOS_KEY  = 'boteco_pedidos_v1';

// Config padrão
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
    const c = JSON.parse(raw);
    return Object.assign(getDefaultConfig(), c || {});
  }catch(e){
    return getDefaultConfig();
  }
}

function salvarConfiguracoesObj(cfg){
  try{
    localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(cfg));
  }catch(e){}
}

// Produtos
let PRODUTOS = [];

async function carregarProdutosBase(){
  try{
    const ls = localStorage.getItem(LS_PRODUCTS_KEY);
    if(ls){
      PRODUTOS = JSON.parse(ls) || [];
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

// Carrinho (para index/comanda)
function getCarrinho(){
  try{
    const raw = sessionStorage.getItem('boteco_cart_v1');
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}
function salvarCarrinho(cart){
  try{
    sessionStorage.setItem('boteco_cart_v1', JSON.stringify(cart||[]));
  }catch(e){}
}
function addItemCarrinho(code){
  const prod = PRODUTOS.find(p=>String(p.code)===String(code));
  if(!prod) return;
  let cart = getCarrinho();
  const idx = cart.findIndex(i=>i.code===prod.code);
  if(idx>=0){
    cart[idx].qtd += 1;
  }else{
    cart.push({code:prod.code,name:prod.name,price:prod.price,qtd:1});
  }
  salvarCarrinho(cart);
  return cart;
}

// Pedidos (para relatórios/caixa)
function getPedidos(){
  try{
    const raw = localStorage.getItem(LS_PEDIDOS_KEY);
    return raw ? JSON.parse(raw) : [];
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

// Utilidades
function formatMoney(v){
  return 'R$ ' + Number(v||0).toFixed(2).replace('.',',');
}

BOTECO DO BELÉM - PACOTE COMPLETO ATUALIZADO (PWA + SOM + CONFIG ADMIN)

Site publicado: https://botecodobelem.netlify.app/

O que tem neste pacote:
- index.html (com PWA + senha opcional + som de pedido)
- admin.html (com senha admin + config delivery + senha app + ativo hoje nos produtos)
- assets/app.js (completo: carrinho + som + produtos ativos + delivery condicional)
- assets/icons/* (ícones 192/512 e maskable gerados do logo)
- assets/sounds/LEIA_AQUI.txt (instruções para adicionar o som novo-pedido.mp3)
- manifest.webmanifest (manifesto PWA completo)
- service-worker.js (cache inteligente)
- pwa.js (registro do service worker)
- offline.html (página de fallback offline)

COMO USAR (copiar e colar no seu projeto):

1) Substitua estes arquivos na raiz do seu projeto Netlify:
   - index.html
   - admin.html
   - manifest.webmanifest
   - service-worker.js
   - pwa.js
   - offline.html

2) Copie a pasta assets/icons/ para dentro de assets/icons/ no seu projeto.

3) Copie o arquivo assets/app.js (substitua o antigo).

4) (Opcional) Coloque um arquivo de som MP3 em:
   assets/sounds/novo-pedido.mp3
   (pode ser qualquer som curto de notificação, tipo campainha ou beep)

5) Faça deploy novamente no Netlify (arraste a pasta completa ou use o comando netlify deploy --prod).

TESTE PWA (app instalável):
- Abra no celular: https://botecodobelem.netlify.app/
- No Chrome: menu ⋮ -> "Instalar app" ou "Adicionar à tela inicial"
- Instale e abra pelo ícone (vai funcionar como app)

Novidades deste pacote:
✅ PWA instalável (ícones + manifest + service worker)
✅ Funciona offline (com fallback)
✅ Senha do admin configurável (Admin -> Alterar senha)
✅ Delivery liga/desliga + taxa configurável
✅ Senha opcional para clientes acessarem o cardápio
✅ Ativar/desativar produtos por dia (Admin -> Produtos)
✅ Som de notificação quando o pedido é enviado ao WhatsApp
✅ Produtos desativados não aparecem no cardápio público

Dúvidas ou ajustes:
- Se algo não funcionar, limpe o cache do navegador e recarregue.
- Para testar o PWA em desktop (Chrome): DevTools -> Application -> Manifest / Service Worker.

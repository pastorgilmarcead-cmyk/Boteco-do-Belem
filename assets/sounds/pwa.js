(function(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/service-worker.js').catch(function(){});
  });
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'visible' && navigator.serviceWorker.controller) {
      navigator.serviceWorker.getRegistration().then(function(reg){
        if (reg) reg.update().catch(function(){});
      });
    }
  });
})();

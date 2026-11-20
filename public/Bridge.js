(function(){
  if (window.__lmsBridge) return;
  window.__lmsBridge = true;
  var K = ['tugas','assessment','pengumpulan','hasil','nilai'];
  var ANAK = {tugas:'pengumpulan', assessment:'hasil'};
  var S = {}; K.forEach(function(k){ S[k] = {list:[], siap:false, json:''}; });
  function urut(k, l){ if(k==='tugas' || k==='assessment') l.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }); return l; }
  function kirim(k){ if(S[k].siap) window.postMessage({lms:'data', k:k, list:S[k].list}, '*'); }
  function muat(k){
    return fetch('/api/lms/'+k).then(function(r){ return r.json(); }).then(function(l){
      l = urut(k, l); var j = JSON.stringify(l);
      if(!S[k].siap || j !== S[k].json){ S[k].json = j; S[k].list = l; S[k].siap = true; kirim(k); }
    }).catch(function(){});
  }
  function muatSemua(){ K.forEach(muat); }
  muatSemua(); setInterval(muatSemua, 3000);
  function sama(a, b){ var ka = Object.keys(a); return ka.length === Object.keys(b).length && ka.every(function(x){ return JSON.stringify(a[x]) === JSON.stringify(b[x]); }); }
  function waktuSekarang(){
    var d = new Date(), B = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    function p(n){ return String(n).padStart(2,'0'); }
    return d.getDate()+' '+B[d.getMonth()]+' '+d.getFullYear()+', '+p(d.getHours())+':'+p(d.getMinutes());
  }
  function req(method, k, id, body){
    return fetch('/api/lms/'+k+'/'+encodeURIComponent(id), {method:method, headers:{'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined});
  }
  function simpanDaftar(k, list){
    var lama = {}; S[k].list.forEach(function(t){ lama[t.id] = t; });
    var ids = {}; list.forEach(function(t){ ids[t.id] = 1; });
    var jobs = [];
    list.forEach(function(t){
      if(!t.id) return;
      var prev = lama[t.id], doc = Object.assign({}, t);
      if(k !== 'nilai') doc.createdAt = prev ? prev.createdAt : Date.now();
      if(!prev || !sama(prev, doc)) jobs.push(req('PUT', k, t.id, doc));
    });
    S[k].list.forEach(function(t){ if(!ids[t.id]) jobs.push(req('DELETE', k, t.id)); });
    if(!jobs.length) return;
    Promise.all(jobs).then(function(){ muat(k); if(ANAK[k]) muat(ANAK[k]); });
  }
  window.addEventListener('message', function(e){
    if(e.source !== window) return;
    var m = e.data; if(!m || !m.lms) return;
    if(m.lms === 'ready') K.forEach(kirim);
    else if(m.lms === 'save' && Array.isArray(m.list)) simpanDaftar(m.k, m.list);
    else if(m.lms === 'put' && m.id && m.data) req('PUT', m.k, m.id, Object.assign({}, m.data, {waktu: waktuSekarang()})).then(function(){ muat(m.k); });
  });
})();
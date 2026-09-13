// Stub-ringan + jalankan app.js + test di dalam satu vm context,
// hasil tes dikumpulkan lewat __check(name, actual, expected).
const makeEl = () => ({ value:'', textContent:'', innerHTML:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} },
  addEventListener(){}, click(){}, focus(){}, dataset:{} });

const styleEl = Object.assign(makeEl(), { style: { setProperty(){} } });
const stubs = {
  localStorage: (() => { let m = {}; return {
    getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); },
    removeItem: k => { delete m[k]; } }; })(),
  alert: m => { throw new Error('ALERT: ' + m); },
  confirm: () => true,
  Chart: class { constructor(canvas, cfg){ this.cfg = cfg; } destroy(){} },
  document: { body: makeEl(), documentElement: styleEl, title:'',
    addEventListener(){}, createElement: () => ({ setAttribute(){}, style:{}, click(){} }),
    querySelector: () => makeEl(), getElementById: () => makeEl(), querySelectorAll: () => [] },
  location: { search: '' },
  URL: class { constructor(){ this.searchParams = { has(){ return false; } }; } },
  URLSearchParams: class { has(){ return false; } },
  addEventListener(){},
  acak: () => 'ABC123',
  firebase: {
    initializeApp: cfg => ({ _cfg: cfg, delete: () => Promise.resolve() }),
    database: () => ({ ref: () => ({ once: () => Promise.resolve({ val: () => null }), on(){}, off(){} }) }),
    auth: () => ({ onAuthStateChanged(){}, createUserWithEmailAndPassword: () => Promise.resolve(),
      signInWithEmailAndPassword: () => Promise.resolve(), signOut: () => Promise.resolve() })
  },
  XLSX: { utils: { book_new: () => ({}), aoa_to_sheet: () => ({}), book_append_sheet(){}, sheet_to_csv(){} }, writeFile(){} }
};

const vm = require('vm');
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const re = /<script>([\s\S]*?)<\/script>/g;
const m = []; let x; while ((x = re.exec(html))) m.push(x[1]);
const appJs = m.join('\n');

const tests = `
  const __r = [];
  function __ck(name, actual, expected){ __r.push([name, actual, expected]); }

  // 1) boot otomatis pakai DEFAULT_FB walau config belum pernah disimpan
  __ck('boot connected', !!fbApp, true);
  __ck('boot projectId', fbApp ? fbApp._cfg.projectId : null, 'catatan-keuangan-c9107');
  __ck('DEFAULT_FB apiKey', DEFAULT_FB ? DEFAULT_FB.apiKey.slice(0,7) : null, 'AIzaSyB');

  // 2) eksporExcel: 4 sheet terbentuk
  let wb2 = {};
  XLSX.utils.book_append_sheet = (wb, ws, name) => { wb2[name] = ws; };
  S = { settings: { kategori: { masuk:['Jualan'], keluar:['Transport'] }, lokasi:['Dompet'] },
    transaksi: [
      { id:'1', tanggal:'2026-09-01', tipe:'masuk', kategori:'Jualan', nominal:100000, lokasi:'Dompet', catatan:'' },
      { id:'2', tanggal:'2026-09-02', tipe:'keluar', kategori:'Transport', nominal:20000, lokasi:'Dompet', catatan:'' },
      { id:'3', tanggal:'2026-09-03', tipe:'beli', kategori:'Investasi', nominal:50000, lokasi:'Dompet', catatan:'' },
      { id:'4', tanggal:'2026-09-04', tipe:'asetawal', kategori:'Investasi', nominal:30000, lokasi:'Dompet', catatan:'' }
    ],
    aset: [ { nama:'GOTO', jenis:'Saham', hargaBeli:50, harga:55, warna:'#4f8cff' } ], target: [], lokasi: [] };
  eksporExcel();
  __ck('sheet Ringkasan', !!wb2['Ringkasan'], true);
  __ck('sheet Transaksi', !!wb2['Transaksi'], true);
  __ck('sheet Aset', !!wb2['Aset'], true);
  __ck('sheet Target', !!wb2['Target'], true);

  // 3) gambarGaris: chart 6 titik
  gambarGaris();
  __ck('gambarGaris chart', !!garisKekayaanChart, true);
  __ck('gambarGaris 6 titik', garisKekayaanChart ? garisKekayaanChart.cfg.data.labels.length : 0, 6);

  // 4) gambarDonut 3 kanvas: donutMasuk
  gambarDonut('donutMasuk', 'legendMasuk', [['Jualan', 100, '#a']]);
  __ck('donutMasuk tersimpan', !!donutMasukChart, true);

  // 5) renderDasbor menggambar donutMasuk + garis tanpa error
  renderDasbor();
  __ck('renderDasbor donutMasuk', !!donutMasukChart, true);
  __ck('renderDasbor garis', !!garisKekayaanChart, true);
  __ck('renderDasbor donutKategori', !!donutKategoriChart, true);

  // 6) hubungkanFirebase: config kosong -> pakai DEFAULT_FB; config diisi -> pakai itu
  var fbConfigEl = { value: '   ' };
  (function(){ var _orig = document.getElementById; document.getElementById = function(id){ if (id === 'fbConfig') return fbConfigEl; return _orig(id); }; })();
  hubungkanFirebase();
  __ck('hapus config', !!fbApp && fbApp._cfg.projectId === 'catatan-keuangan-c9107', true);
  fbConfigEl.value = JSON.stringify({ apiKey:'K1', authDomain:'A', databaseURL:'D', projectId:'P-XYZ' });
  hubungkanFirebase();
  __ck('config custom', !!fbApp && fbApp._cfg.projectId === 'P-XYZ', true);

  globalThis.__results = __r;
`;

try { vm.runInContext(appJs + '\n' + tests, ctx = vm.createContext(stubs)); }
catch (e) { console.error('LOAD ERROR', e.message); process.exit(1); }

const checks = ctx.__results;
const fails = checks.filter(c => c[1] !== c[2]);
if (fails.length) { console.log('FAIL'); fails.forEach(f => console.log('  ' + f[0] + ': got ' + JSON.stringify(f[1]) + ' want ' + f[2])); process.exit(1); }
console.log('HARNESS OK (' + checks.length + ' checks)');
// ================= STATE =================
const KEY = 'life-reset-rpg';
let db = JSON.parse(localStorage.getItem(KEY)) || {
  profile: { name: 'User', dob: '', avatar: '' }, // <-- avatar ditambahin
  stats: { totalExp: 0, streak: 0, lastSaveDate: '' },
  today: { sleep: null, wake: null, water: 0, pushup: 0, situp: 0, lari: 0, 
           kerjaHadir: false, kerjaJam: 0,
           baca: false, meditasi: false, detox: false, mandi: false, makan: 0, 
           journal: '', gratitude: ['','',''], saved: false }
};
const saveDB = () => localStorage.setItem(KEY, JSON.stringify(db));
const $ = id => document.getElementById(id);
const todayDate = new Date().toISOString().slice(0,10);

// Reset Harian jika beda tanggal
if (db.stats.lastSaveDate !== todayDate && db.stats.lastSaveDate !== '') {
    db.today = { sleep: null, wake: null, water: 0, pushup: 0, situp: 0, lari: 0, 
                 kerjaHadir: false, kerjaJam: 0,
                 baca: false, meditasi: false, detox: false, mandi: false, makan: 0, 
                 journal: '', gratitude: ['','',''], saved: false };
    let last = new Date(db.stats.lastSaveDate);
    let curr = new Date(todayDate);
    let diffDays = Math.ceil((curr - last) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) db.stats.streak = 0; // Streak putus
    saveDB();
}

// ================= TOAST NOTIFICATION =================
function showToast(message) {
  const toast = $('toast');
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ================= NAVIGASI =================
function switchView(viewName) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (viewName === 'home') {
    $('view-home').classList.remove('hidden');
    $('view-profile').classList.add('hidden');
    document.querySelectorAll('.nav-item')[0].classList.add('active');
  } else {
    $('view-home').classList.add('hidden');
    $('view-profile').classList.remove('hidden');
    document.querySelectorAll('.nav-item')[1].classList.add('active');
    updateProfileUI();
  }
}

// ================= LOGIKA HOME =================
function loadToday() {
  $('water-text').innerText = `${db.today.water} / 8 Gelas`;
  $('pushup').value = db.today.pushup || '';
  $('situp').value = db.today.situp || '';
  $('lari').value = db.today.lari || '';
  $('kerja-hadir').checked = db.today.kerjaHadir;
  $('kerja-jam').value = db.today.kerjaJam || '';
  $('baca').checked = db.today.baca;
  $('meditasi').checked = db.today.meditasi;
  $('detox').checked = db.today.detox;
  $('mandi').checked = db.today.mandi;
  $('makan').value = db.today.makan;
  $('journal').value = db.today.journal;
  $('g1').value = db.today.gratitude[0] || '';
  $('g2').value = db.today.gratitude[1] || '';
  $('g3').value = db.today.gratitude[2] || '';
  
  if(db.today.sleep) { $('btn-sleep').innerText = `Tidur: ${db.today.sleep}`; $('btn-sleep').classList.add('active'); }
  if(db.today.wake) { $('btn-wake').innerText = `Bangun: ${db.today.wake}`; $('btn-wake').classList.add('active'); }
  if(db.today.sleep && db.today.wake) $('sleep-status').innerText = "Waktu tidur & bangun sudah tercatat.";
  
  updateHUD();
}

window.changeWater = (val) => {
  db.today.water = Math.max(0, db.today.water + val);
  $('water-text').innerText = `${db.today.water} / 8 Gelas`;
  saveDB();
}

// Tombol Tidur & Bangun
$('btn-sleep').onclick = () => {
  const now = new Date();
  db.today.sleep = now.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
  $('btn-sleep').innerText = `Tidur: ${db.today.sleep}`;
  $('btn-sleep').classList.add('active');
  saveDB();
};
$('btn-wake').onclick = () => {
  const now = new Date();
  db.today.wake = now.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
  $('btn-wake').innerText = `Bangun: ${db.today.wake}`;
  $('btn-wake').classList.add('active');
  saveDB();
};

// Simpan & Klaim EXP
$('save-btn').onclick = () => {
  if (db.today.saved) { showToast("⚠️ Hari ini sudah diklaim!"); return; }
  
  let exp = 0;
  
  const hadir = $('kerja-hadir').checked;
  const jamKerja = parseFloat($('kerja-jam').value) || 0;
  if (hadir) exp += 10;
  exp += (jamKerja * 15);
  
  exp += (db.today.water * 2);
  if (db.today.water >= 8) exp += 10;
  
  const pu = parseInt($('pushup').value) || 0;
  const su = parseInt($('situp').value) || 0;
  const lari = parseFloat($('lari').value) || 0;
  exp += (Math.floor(pu / 25) * 5);
  exp += (Math.floor(su / 25) * 5);
  exp += (lari * 10);
  
  if ($('baca').checked) exp += 5;
  if ($('meditasi').checked) exp += 10;
  if ($('detox').checked) exp += 15;
  
  if ($('mandi').checked) exp += 5;
  const makanVal = parseInt($('makan').value);
  exp += makanVal;
  
  const jurnalIsi = $('journal').value.trim().length > 0;
  const syukurIsi = $('g1').value.trim() || $('g2').value.trim() || $('g3').value.trim();
  if (jurnalIsi && syukurIsi) exp += 15;
  
  if (db.today.sleep) exp += 10; 
  if (db.today.wake) exp += 10;
  
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toISOString().slice(0,10);
  
  if (db.stats.lastSaveDate === yDate) {
    db.stats.streak += 1;
  } else if (db.stats.lastSaveDate !== todayDate) {
    db.stats.streak = 1;
  }
  
  let multiplier = 1;
  if (db.stats.streak >= 60) multiplier = 3;
  else if (db.stats.streak >= 30) multiplier = 2;
  else if (db.stats.streak >= 14) multiplier = 1.5;
  else if (db.stats.streak >= 7) multiplier = 1.2;
  
  let finalExp = Math.floor(exp * multiplier);
  
  db.today = {
    sleep: db.today.sleep, wake: db.today.wake, water: db.today.water, 
    pushup: pu, situp: su, lari: lari,
    kerjaHadir: hadir, kerjaJam: jamKerja,
    baca: $('baca').checked, meditasi: $('meditasi').checked, detox: $('detox').checked, 
    mandi: $('mandi').checked, makan: makanVal, 
    journal: $('journal').value, gratitude: [$('g1').value, $('g2').value, $('g3').value], 
    saved: true
  };
  
  db.stats.totalExp += finalExp;
  db.stats.lastSaveDate = todayDate;
  saveDB();
  
  updateHUD();
  showToast(`🔥 Mantap! +${finalExp} EXP (Streak: ${db.stats.streak})`);
  loadToday();
};

// ================= LOGIKA HUD & PROFILE (UPDATED) =================
function updateHUD() {
  let lvl = 1;
  let expNeeded = 250;
  let expLeft = db.stats.totalExp;
  
  while (expLeft >= expNeeded) {
    expLeft -= expNeeded;
    lvl++;
    expNeeded = lvl * 250;
  }
  
  $('hud-level').innerText = lvl;
  $('hud-streak').innerText = db.stats.streak;
  $('hud-exp-fill').style.width = `${(expLeft / expNeeded) * 100}%`;
  
  // Logika Tampil Foto HUD
  if (db.profile.avatar) {
    $('hud-avatar-img').src = db.profile.avatar;
    $('hud-avatar-img').classList.remove('hidden');
    $('hud-avatar-initial').classList.add('hidden');
  } else {
    $('hud-avatar-img').classList.add('hidden');
    $('hud-avatar-initial').classList.remove('hidden');
    if(db.profile.name) $('hud-avatar-initial').innerText = db.profile.name.charAt(0).toUpperCase();
  }
}

function getTier(lvl) {
  if (lvl >= 50) return "Legend";
  if (lvl >= 25) return "Master";
  if (lvl >= 10) return "Discipline";
  if (lvl >= 5) return "Fighter";
  return "Rookie";
}

function updateProfileUI() {
  $('profile-name').value = db.profile.name;
  $('profile-dob').value = db.profile.dob;
  
  // Logika Tampil Foto Profil
  if (db.profile.avatar) {
    $('profile-avatar-img').src = db.profile.avatar;
    $('profile-avatar-img').classList.remove('hidden');
    $('avatar-initial').classList.add('hidden');
  } else {
    $('profile-avatar-img').classList.add('hidden');
    $('avatar-initial').classList.remove('hidden');
    if(db.profile.name) $('avatar-initial').innerText = db.profile.name.charAt(0).toUpperCase();
  }
  
  let lvl = 1;
  let expNeeded = 250;
  let expLeft = db.stats.totalExp;
  
  while (expLeft >= expNeeded) {
    expLeft -= expNeeded;
    lvl++;
    expNeeded = lvl * 250;
  }
  
  $('display-level').innerText = `Level ${lvl}`;
  $('display-total-exp').innerText = db.stats.totalExp;
  $('exp-fill').style.width = `${(expLeft / expNeeded) * 100}%`;
  $('exp-text').innerText = `${expLeft} / ${expNeeded} EXP ke Lvl ${lvl+1}`;
  $('display-tier').innerText = getTier(lvl);
}

$('save-profile').onclick = () => {
  db.profile.name = $('profile-name').value || 'User';
  db.profile.dob = $('profile-dob').value;
  saveDB();
  updateProfileUI();
  updateHUD();
  showToast("✅ Profil berhasil disimpan!");
};

// Ticker Umur Realtime
setInterval(() => {
  if (!db.profile.dob) {
    $('age-display').innerText = "Isi tanggal lahir dulu.";
    return;
  }
  const now = new Date();
  const birth = new Date(db.profile.dob);
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  let hours = now.getHours() - birth.getHours();
  let mins = now.getMinutes() - birth.getMinutes();
  let secs = now.getSeconds() - birth.getSeconds();

  if (secs < 0) { secs += 60; mins--; }
  if (mins < 0) { mins += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) { 
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonth; months--; 
  }
  if (months < 0) { months += 12; years--; }

  $('age-display').innerHTML = `${years} Thn, ${months} Bln, ${days} Hari<br>${hours} Jam, ${mins} Mnt, ${secs} Dtk`;
}, 1000);

// ================= LOGIKA UPLOAD FOTO PROFIL =================
$('avatar-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const base64String = canvas.toDataURL('image/jpeg', 0.8);
      
      db.profile.avatar = base64String;
      saveDB();
      
      updateHUD();
      updateProfileUI();
      showToast("📸 Foto profil berhasil diperbarui!");
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Inisialisasi awal
loadToday();
updateProfileUI();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

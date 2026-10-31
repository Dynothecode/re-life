const KEY = 'life-reset-rpg-v2'; 
const $ = id => document.getElementById(id);

// ================= QUOTES =================
const QUOTES = [
  "Disiplin adalah jembatan antara tujuan dan pencapaian.",
  "Jangan hitung hari-harinya, buatlah hari-harimu berarti.",
  "Kamu tidak harus hebat untuk memulai, tapi kamu harus memulai untuk menjadi hebat.",
  "Kualitas hidupmu ditentukan oleh kualitas kebiasaanmu.",
  "Satu langkah kecil hari ini lebih baik dari rencana besar besok.",
  "Rasa sakit dari disiplin jauh lebih ringan daripada rasa sakit dari penyesalan."
];

// ================= STATE & DATA =================
let db = JSON.parse(localStorage.getItem(KEY)) || {
  profile: { name: 'User', dob: '', avatar: '' },
  stats: { totalExp: 0, streak: 0, lastSaveDate: '' },
  quests: {
    daily: [
      { id: 'd1', text: 'Minum 8 Gelas Air', exp: 20, done: false },
      { id: 'd2', text: 'Olahraga / Workout', exp: 30, done: false },
      { id: 'd3', text: 'Baca Buku 10 Halaman', exp: 15, done: false },
      { id: 'd4', text: 'Digital Detox 2 Jam', exp: 25, done: false },
      { id: 'd5', text: 'Tidur Sebelum Jam 12', exp: 20, done: false }
    ],
    weekly: [
      { id: 'w1', text: 'Workout 3x dalam seminggu', exp: 100, done: false },
      { id: 'w2', text: 'Selesaikan 1 Buku', exp: 150, done: false },
      { id: 'w3', text: 'Bersih-bersih Kamar / Kos', exp: 80, done: false }
    ],
    monthly: [
      { id: 'm1', text: 'Lari jarak total 20 KM', exp: 300, done: false },
      { id: 'm2', text: 'Hemat uang minimal 20% dari gaji', exp: 400, done: false },
      { id: 'm3', text: 'Belajar 1 Skill/Topik Baru', exp: 350, done: false }
    ],
    event: [
      { id: 'e1', text: 'Golden Week: Klaim 500 EXP', exp: 500, done: false },
      { id: 'e2', text: 'Golden Week: Streak 7 Hari', exp: 700, done: false }
    ],
    yearly: [
      { id: 'y1', text: 'Self Reward: Traveling / Cuti', exp: 2000, done: false },
      { id: 'y2', text: 'Self Reward: Beli Gadget Baru', exp: 3000, done: false },
      { id: 'y3', text: 'Baca 12 Buku dalam setahun', exp: 1500, done: false }
    ]
  },
  lastReset: { daily: '', weekly: '', monthly: '', yearly: '' },
  milestones: [
    { text: "Level 5 Tercapai", unlocked: false },
    { text: "Streak 7 Hari", unlocked: false },
    { text: "Total 1000 EXP", unlocked: false }
  ]
};

const saveDB = () => localStorage.setItem(KEY, JSON.stringify(db));
const todayDate = new Date().toISOString().slice(0,10);

// ================= LOGIKA RESET WAKTU =================
function checkResets() {
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  
  if (db.lastReset.daily !== today) {
    db.quests.daily.forEach(q => q.done = false);
    db.lastReset.daily = today;
    saveDB();
  }

  if (now.getDay() === 1) {
    const lastW = db.lastReset.weekly ? new Date(db.lastReset.weekly) : new Date(0);
    if (now.getTime() - lastW.getTime() > 6 * 24 * 60 * 60 * 1000) {
      db.quests.weekly.forEach(q => q.done = false);
      db.lastReset.weekly = today;
      saveDB();
    }
  }

  if (now.getDate() === 1 && db.lastReset.monthly !== today) {
    db.quests.monthly.forEach(q => q.done = false);
    db.lastReset.monthly = today;
    saveDB();
  }

  if (now.getMonth() === 0 && now.getDate() === 1 && db.lastReset.yearly !== today) {
    db.quests.yearly.forEach(q => q.done = false);
    db.lastReset.yearly = today;
    saveDB();
  }
}

// ================= LOGIKA GOLDEN WEEK =================
function getGoldenWeekMultiplier() {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const isGoldenWeek = now.getDate() > (lastDayOfMonth - 7);
  
  if (!isGoldenWeek) return { active: false, multiplier: 1 };

  let mult = 2; 
  if (db.stats.streak >= 7) mult = 4;
  else if (db.stats.streak >= 5) mult = 3;

  return { active: true, multiplier: mult };
}

// ================= LOGIKA LEVEL & TIER =================
function getLevelData() {
  let lvl = 1;
  let expNeeded = 250;
  let expLeft = db.stats.totalExp;

  while (expLeft >= expNeeded && lvl < 100) {
    expLeft -= expNeeded;
    lvl++;
    expNeeded = lvl * 250;
  }
  return { lvl, expLeft, expNeeded };
}

function getTier(lvl) {
  if (lvl >= 100) return "SSS";
  if (lvl >= 90) return "SS";
  if (lvl >= 80) return "S";
  if (lvl >= 70) return "A";
  if (lvl >= 50) return "B";
  if (lvl >= 30) return "C";
  if (lvl >= 15) return "D";
  return "E";
}

// ================= RENDER UI =================
function updateHUD() {
  const { lvl, expLeft, expNeeded } = getLevelData();
  const tier = getTier(lvl);
  
  $('hud-level').innerText = lvl;
  $('hud-streak').innerText = db.stats.streak;
  $('hud-exp-fill').style.width = `${(expLeft / expNeeded) * 100}%`;
  
  if (db.profile.avatar) {
    $('hud-avatar-img').src = db.profile.avatar;
    $('hud-avatar-img').classList.remove('hidden');
    $('hud-avatar-initial').classList.add('hidden');
  } else {
    $('hud-avatar-img').classList.add('hidden');
    $('hud-avatar-initial').classList.remove('hidden');
    if(db.profile.name) $('hud-avatar-initial').innerText = db.profile.name.charAt(0).toUpperCase();
  }

  $('home-level').innerText = `Lv. ${lvl}`;
  $('home-tier').innerText = `TIER ${tier}`;
  $('home-total-exp').innerText = db.stats.totalExp;
  $('home-exp-fill').style.width = `${(expLeft / expNeeded) * 100}%`;
  $('home-exp-text').innerText = `${expLeft} / ${expNeeded} EXP ke Lvl ${lvl+1}`;
}

function renderQuests() {
  const renderList = (listId, questList, isEvent = false) => {
    const container = $(listId);
    container.innerHTML = '';
    const gw = getGoldenWeekMultiplier();
    
    questList.forEach(q => {
      let actualExp = q.exp;
      let expText = `+${actualExp} EXP`;

      if (isEvent) {
         if (!gw.active) {
             actualExp = 0;
             expText = "LOCKED";
         } else {
             actualExp = q.exp * gw.multiplier;
             expText = `+${actualExp} EXP (x${gw.multiplier})`;
         }
      }

      const div = document.createElement('div');
      div.className = `quest-item ${q.done ? 'done' : ''}`;
      div.innerHTML = `
        <span class="quest-title">${q.text}</span>
        <span class="quest-exp">${q.done ? '✅ Selesai' : expText}</span>
      `;
      
      if (!q.done && (!isEvent || gw.active)) {
        div.onclick = () => claimQuest(q, actualExp);
      }
      container.appendChild(div);
    });
  };

  renderList('list-daily', db.quests.daily);
  renderList('list-weekly', db.quests.weekly);
  renderList('list-monthly', db.quests.monthly);
  renderList('list-event', db.quests.event, true);
  renderList('list-yearly', db.quests.yearly);

  const gw = getGoldenWeekMultiplier();
  if (gw.active) {
    $('golden-week-status').innerText = `AKTIF! EXP x${gw.multiplier}`;
    $('golden-week-status').style.color = '#FF453A';
    $('golden-week-status').style.fontWeight = 'bold';
  } else {
    $('golden-week-status').innerText = `Belum aktif (Aktif tgl 24-31)`;
    $('golden-week-status').style.color = 'var(--text-secondary)';
  }
}

function renderMilestones() {
  const container = $('milestone-list');
  container.innerHTML = '';
  db.milestones.forEach(m => {
    const li = document.createElement('li');
    li.innerText = `${m.unlocked ? '✅' : '🔒'} ${m.text}`;
    if(m.unlocked) li.style.color = 'var(--accent-green)';
    container.appendChild(li);
  });
}

// ================= LOGIKA KLAIM EXP =================
function claimQuest(quest, expGained) {
  quest.done = true;
  db.stats.totalExp += expGained;
  saveDB();
  
  showToast(`🔥 Mantap! +${expGained} EXP`);
  updateHUD();
  renderQuests();
  checkMilestones();
}

function checkMilestones() {
  let changed = false;
  const { lvl } = getLevelData();
  
  if (lvl >= 5 && !db.milestones[0].unlocked) { db.milestones[0].unlocked = true; changed = true; }
  if (db.stats.streak >= 7 && !db.milestones[1].unlocked) { db.milestones[1].unlocked = true; changed = true; }
  if (db.stats.totalExp >= 1000 && !db.milestones[2].unlocked) { db.milestones[2].unlocked = true; changed = true; }

  if (changed) {
    saveDB();
    renderMilestones();
  }
}

// ================= NAVIGASI & INIT =================
function switchView(viewName) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  ['home', 'quests', 'profile'].forEach(v => $(`view-${v}`).classList.add('hidden'));
  
  $(`view-${viewName}`).classList.remove('hidden');
  const navIdx = viewName === 'home' ? 0 : viewName === 'quests' ? 1 : 2;
  document.querySelectorAll('.nav-item')[navIdx].classList.add('active');
  
  if (viewName === 'profile') updateProfileUI();
  if (viewName === 'quests') {
    renderQuests();
    setTimeout(updateCardRotations, 50); // Delay sedikit biar render CSS selesai
  }
}

function showToast(message) {
  const toast = $('toast');
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function setRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  $('daily-quote').innerText = `"${q}"`;
}

function updateProfileUI() {
  $('profile-name').value = db.profile.name;
  $('profile-dob').value = db.profile.dob;
  
  if (db.profile.avatar) {
    $('profile-avatar-img').src = db.profile.avatar;
    $('profile-avatar-img').classList.remove('hidden');
    $('avatar-initial').classList.add('hidden');
  } else {
    $('profile-avatar-img').classList.add('hidden');
    $('avatar-initial').classList.remove('hidden');
    if(db.profile.name) $('avatar-initial').innerText = db.profile.name.charAt(0).toUpperCase();
  }
  
  const { lvl, expLeft, expNeeded } = getLevelData();
  $('display-level').innerText = `Level ${lvl}`;
  $('display-tier').innerText = `Tier ${getTier(lvl)}`;
  $('display-total-exp').innerText = db.stats.totalExp;
  $('exp-fill').style.width = `${(expLeft / expNeeded) * 100}%`;
  $('exp-text').innerText = `${expLeft} / ${expNeeded} EXP`;
}

$('save-profile').onclick = () => {
  db.profile.name = $('profile-name').value || 'User';
  db.profile.dob = $('profile-dob').value;
  saveDB();
  updateProfileUI();
  updateHUD();
  showToast("✅ Profil disimpan!");
};

$('avatar-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 200;
      let width = img.width, height = img.height;
      if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
      else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      db.profile.avatar = canvas.toDataURL('image/jpeg', 0.8);
      saveDB();
      updateHUD(); updateProfileUI();
      showToast("📸 Foto profil diperbarui!");
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

$('export-btn').onclick = () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `backup-life-reset-${todayDate}.json`;
  a.click();
  showToast("📥 Data berhasil di-backup!");
};

$('import-btn').onclick = () => $('import-file').click();

$('import-file').addEventListener('change', function(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.profile && imported.stats) {
        db = imported; saveDB();
        updateHUD(); updateProfileUI(); renderQuests(); renderMilestones();
        showToast("📤 Data berhasil di-restore!");
      } else { showToast("❌ File backup tidak valid!"); }
    } catch (err) { showToast("❌ Gagal membaca file!"); }
  };
  reader.readAsText(file);
});

setInterval(() => {
  if (!db.profile.dob) { $('age-display').innerText = "Isi tanggal lahir dulu."; return; }
  const now = new Date(); const birth = new Date(db.profile.dob);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  let hours = now.getHours() - birth.getHours();
  let mins = now.getMinutes() - birth.getMinutes();
  let secs = now.getSeconds() - birth.getSeconds();
  if (secs < 0) { secs += 60; mins--; } if (mins < 0) { mins += 60; hours--; }
  if (hours < 0) { hours += 24; days--; } if (days < 0) { const pm = new Date(now.getFullYear(), now.getMonth(), 0).getDate(); days += pm; months--; }
  if (months < 0) { months += 12; years--; }
  $('age-display').innerHTML = `${years} Thn, ${months} Bln, ${days} Hari<br>${hours} Jam, ${mins} Mnt, ${secs} Dtk`;
}, 1000);

// ================= ANIMASI 3D FLIP (COVER FLOW) =================
const questSlider = document.getElementById('quest-slider');
const questCards = document.querySelectorAll('.slider-card');

function updateCardRotations() {
  if (!questSlider || questCards.length === 0) return;
  
  const sliderCenter = questSlider.getBoundingClientRect().left + questSlider.offsetWidth / 2;
  
  questCards.forEach(card => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    
    const distanceFromCenter = (cardCenter - sliderCenter) / questSlider.offsetWidth;
    const rotateY = Math.max(-45, Math.min(45, distanceFromCenter * -100)); 
    const scale = Math.max(0.8, 1 - Math.abs(distanceFromCenter) * 0.5);
    const opacity = Math.max(0.4, 1 - Math.abs(distanceFromCenter) * 2);

    card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`;
    card.style.opacity = opacity;
  });
}

questSlider.addEventListener('scroll', () => {
  window.requestAnimationFrame(updateCardRotations);
});

window.addEventListener('resize', updateCardRotations);

// INITIALIZATION
checkResets();
updateHUD();
updateProfileUI();
renderQuests();
renderMilestones();
setRandomQuote();
setTimeout(updateCardRotations, 100);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

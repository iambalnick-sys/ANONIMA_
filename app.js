function getTracks(){ try{ return JSON.parse(localStorage.getItem('anonima_tracks')||'[]'); }catch(e){ return []; } }
function saveTracks(t){ localStorage.setItem('anonima_tracks', JSON.stringify(t)); }
const audioURLs = {};

// --- SIMPLE USER SYSTEM ---
let currentUser = localStorage.getItem('anonima_user');
if(!currentUser){
  currentUser = prompt("Choose a username for ANONIMA_:") || "anonymous";
  localStorage.setItem('anonima_user', currentUser);
}
const ADMIN_CODE = "ANONIMA_1312";
let isAdmin = localStorage.getItem('anonima_admin') === '1';

function loginAdmin(){
  const code = prompt("Admin code:");
  if(code === ADMIN_CODE){
    isAdmin = true;
    localStorage.setItem('anonima_admin','1');
    alert("You are admin now");
    render();
  } else { alert("Wrong code"); }
}

function upload(){
  const titleEl = document.getElementById('title');
  const licenseEl = document.getElementById('license');
  const fileInput = document.getElementById('file');
  const title = titleEl.value.trim();
  const license = licenseEl.value;
  const file = fileInput.files && fileInput.files[0];
  if(!title){ alert('Enter a title'); return; }
  if(!file){ alert('Select an mp3 file'); return; }

  const id = Date.now().toString();
  audioURLs[id] = URL.createObjectURL(file);

  const tracks = getTracks();
  // NOW WE SAVE WHO UPLOADED IT
  tracks.unshift({ id, title, license, keep:0, skip:0, status:'pending', hasAudio:true, name: file.name, uploader: currentUser, voters: [] });
  saveTracks(tracks);

  titleEl.value=''; fileInput.value='';
  render();
  alert('Uploaded to The Vault as '+currentUser);
}

function vote(id, type){
  const tracks=getTracks();
  const t=tracks.find(x=>x.id===id);
  if(!t) return;

  // 1. FIX: you cannot vote on your own tracks
  if(t.uploader === currentUser &&!isAdmin){
    alert("You cannot vote on your own tracks");
    return;
  }
  // prevent double voting
  if(t.voters && t.voters.includes(currentUser)){
    alert("You already voted"); return;
  }

  t[type]++;
  if(!t.voters) t.voters = [];
  t.voters.push(currentUser);

  if(t.keep >= 2 && t.status === 'pending'){
    t.status = 'live';
  }
  saveTracks(tracks); render();
}

function deleteTrack(id){
  if(!isAdmin){ alert("Admin only"); return; }
  if(!confirm("Delete this track?")) return;
  saveTracks(getTracks().filter(t=>t.id!==id));
  render();
}

function render(){
  const tracks=getTracks();
  const vault = tracks.filter(t=>t.status==='pending');
  const live = tracks.filter(t=>t.status==='live');

  document.getElementById('vault').innerHTML = vault.map(t=>`
    <div class="track">
      <b>${t.title}</b> <span style="color:#888;font-size:12px">${t.license} - by anonymous</span><br>
      ${audioURLs[t.id]? `<audio controls src="${audioURLs[t.id]}" style="width:100%;margin:10px 0"></audio><br>` : `<p style="color:#666;font-size:12px">[re-upload to listen in this session]</p>`}
      <button onclick="vote('${t.id}','keep')">KEEP (${t.keep})</button>
      <button onclick="vote('${t.id}','skip')">SKIP (${t.skip})</button>
      ${isAdmin? `<button onclick="deleteTrack('${t.id}')" style="color:red">DELETE</button>` : ''}
    </div>`).join('') || '<p style="color:#555">Empty</p>';

  document.getElementById('live').innerHTML = live.map(t=>`
    <div class="track"><b>${t.title}</b> <span style="color:#888;font-size:12px">${t.license} - by anonymous</span>
    ${isAdmin? ` <button onclick="deleteTrack('${t.id}')" style="color:red">X</button>` : ''}
    </div>
  `).join('') || '<p style="color:#555">Empty</p>';

  // admin button if not admin yet
  if(!document.getElementById('adminBtn')){
    const b = document.createElement('button');
    b.id='adminBtn'; b.textContent='Admin login'; b.onclick=loginAdmin;
    b.style='position:fixed;bottom:10px;right:10px;opacity:0.5';
    document.body.appendChild(b);
  }
}
render();

/*
´´´´´´´´´´´´´´´´´´´ ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶´´´´´´´´´´´´´´´´´´´`
´´´´´´´´´´´´´´´´´¶¶¶¶¶¶´´´´´´´´´´´´´¶¶¶¶¶¶¶´´´´´´´´´´´´´´´´
´´´´´´´´´´´´´´¶¶¶¶´´´´´´´´´´´´´´´´´´´´´´´¶¶¶¶´´´´´´´´´´´´´´
´´´´´´´´´´´´´¶¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´´´´´´´´´´´
´´´´´´´´´´´´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´´´´´´´´´´
´´´´´´´´´´´¶¶´´´´´´´´´´´´´´´´´´´´´`´´´´´´´´´´´¶¶´´´´´´´´´´`
´´´´´´´´´´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´´´´´´´´´
´´´´´´´´´´¶¶´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´¶¶´´´´´´´´´´
´´´´´´´´´´¶¶´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´¶´´´´´´´´´´
´´´´´´´´´´¶¶´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´¶´´´´´´´´´´
´´´´´´´´´´¶¶´´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´¶¶´´´´´´´´´´
´´´´´´´´´´¶¶´´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´¶¶´´´´´´´´´´
´´´´´´´´´´´¶¶´¶¶´´´¶¶¶¶¶¶¶¶´´´´´¶¶¶¶¶¶¶¶´´´¶¶´¶¶´´´´´´´´´´´
´´´´´´´´´´´´¶¶¶¶´¶¶¶¶¶¶¶¶¶¶´´´´´¶¶¶¶¶¶¶¶¶¶´¶¶¶¶¶´´´´´´´´´´´
´´´´´´´´´´´´´¶¶¶´¶¶¶¶¶¶¶¶¶¶´´´´´¶¶¶¶¶¶¶¶¶¶´¶¶¶´´´´´´´´´´´´´
´´´´¶¶¶´´´´´´´¶¶´´¶¶¶¶¶¶¶¶´´´´´´´¶¶¶¶¶¶¶¶¶´´¶¶´´´´´´¶¶¶¶´´´
´´´¶¶¶¶¶´´´´´¶¶´´´¶¶¶¶¶¶¶´´´¶¶¶´´´¶¶¶¶¶¶¶´´´¶¶´´´´´¶¶¶¶¶¶´´
´´¶¶´´´¶¶´´´´¶¶´´´´´¶¶¶´´´´¶¶¶¶¶´´´´¶¶¶´´´´´¶¶´´´´¶¶´´´¶¶´´
´¶¶¶´´´´¶¶¶¶´´¶¶´´´´´´´´´´¶¶¶¶¶¶¶´´´´´´´´´´¶¶´´¶¶¶¶´´´´¶¶¶´
¶¶´´´´´´´´´¶¶¶¶¶¶¶¶´´´´´´´¶¶¶¶¶¶¶´´´´´´´¶¶¶¶¶¶¶¶¶´´´´´´´´¶¶
¶¶¶¶¶¶¶¶¶´´´´´¶¶¶¶¶¶¶¶´´´´¶¶¶¶¶¶¶´´´´¶¶¶¶¶¶¶¶´´´´´´¶¶¶¶¶¶¶¶
´´¶¶¶¶´¶¶¶¶¶´´´´´´¶¶¶¶¶´´´´´´´´´´´´´´¶¶¶´¶¶´´´´´¶¶¶¶¶¶´¶¶¶´
´´´´´´´´´´¶¶¶¶¶¶´´¶¶¶´´¶¶´´´´´´´´´´´¶¶´´¶¶¶´´¶¶¶¶¶¶´´´´´´´´
´´´´´´´´´´´´´´¶¶¶¶¶¶´¶¶´¶¶¶¶¶¶¶¶¶¶¶´¶¶´¶¶¶¶¶¶´´´´´´´´´´´´´´
´´´´´´´´´´´´´´´´´´¶¶´¶¶´¶´¶´¶´¶´¶´¶´¶´¶´¶¶´´´´´´´´´´´´´´´´´
´´´´´´´´´´´´´´´´¶¶¶¶´´¶´¶´¶´¶´¶´¶´¶´¶´´´¶¶¶¶¶´´´´´´´´´´´´´´
´´´´´´´´´´´´¶¶¶¶¶´¶¶´´´¶¶¶¶¶¶¶¶¶¶¶¶¶´´´¶¶´¶¶¶¶¶´´´´´´´´´´´´
´´´´¶¶¶¶¶¶¶¶¶¶´´´´´¶¶´´´´´´´´´´´´´´´´´¶¶´´´´´´¶¶¶¶¶¶¶¶¶´´´´
´´´¶¶´´´´´´´´´´´¶¶¶¶¶¶¶´´´´´´´´´´´´´¶¶¶¶¶¶¶¶´´´´´´´´´´¶¶´´´
´´´´¶¶¶´´´´´¶¶¶¶¶´´´´´¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶´´´´´¶¶¶¶¶´´´´´¶¶¶´´´´
´´´´´´¶¶´´´¶¶¶´´´´´´´´´´´¶¶¶¶¶¶¶¶¶´´´´´´´´´´´¶¶¶´´´¶¶´´´´´´
´´´´´´¶¶´´¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶´´¶¶´´´´´´
´´´´´´´¶¶¶¶´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´¶¶¶¶´´´´´´´
*/

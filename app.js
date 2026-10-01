function getTracks(){ try{ return JSON.parse(localStorage.getItem('anonima_tracks')||'[]'); }catch(e){ return []; } }
function saveTracks(t){ localStorage.setItem('anonima_tracks', JSON.stringify(t)); }

let currentUser = localStorage.getItem('anonima_user');
if(!currentUser){
  currentUser = prompt("Choose a username:") || "anonymous";
  localStorage.setItem('anonima_user', currentUser);
}
const ADMIN_CODE = "io so l'admin, IO HO IL POTERE!!! (ma lo usero coscientemente)";
let isAdmin = localStorage.getItem('anonima_admin') === '1';

function loginAdmin(){
  const code = prompt("Admin code:");
  if(code === ADMIN_CODE){
    isAdmin = true;
    localStorage.setItem('anonima_admin','1');
    render();
  }
}
function logoutAdmin(){
  isAdmin = false;
  localStorage.removeItem('anonima_admin');
  render();
}

function upload(){
  const title = document.getElementById('title').value.trim();
  const license = document.getElementById('license').value;
  const file = document.getElementById('file').files[0];
  if(!title ||!file){ alert("Metti titolo e file"); return; }

  const reader = new FileReader();
  reader.onload = function(e){
    const audioData = e.target.result; // DataURL permanente
    const id = Date.now().toString();
    const tracks = getTracks();
    tracks.unshift({ id, title, license, keep:0, skip:0, status:'pending', uploader: currentUser, voters: [], audioData });
    saveTracks(tracks);
    document.getElementById('title').value=''; document.getElementById('file').value='';
    render();
  };
  reader.readAsDataURL(file);
}

function vote(id, type){
  const tracks=getTracks();
  const t=tracks.find(x=>x.id===id);
  if(!t) return;
  if(t.uploader === currentUser &&!isAdmin){ return; }
  if(t.voters && t.voters.includes(currentUser)){ return; }
  t[type]++;
  if(!t.voters) t.voters = [];
  t.voters.push(currentUser);
  if(t.keep >= 2 && t.status === 'pending'){
    t.status = 'live';
    t.uploader = null;
    t.voters = [];
  }
  saveTracks(tracks); render();
}

function deleteTrack(id){
  if(!isAdmin){ return; }
  if(!confirm("Delete?")) return;
  saveTracks(getTracks().filter(t=>t.id!==id));
  render();
}

function render(){
  const tracks=getTracks();
  const vault = tracks.filter(t=>t.status==='pending');
  const live = tracks.filter(t=>t.status==='live');
  document.getElementById('vault').innerHTML = vault.map(t=>`
    <div class="track">
      <b>${t.title}</b> <span style="color:#888;font-size:12px">${t.license}</span><br>
      ${t.audioData? `<audio controls src="${t.audioData}" style="width:100%;margin:10px 0"></audio><br>` : ``}
      <button onclick="vote('${t.id}','keep')">KEEP (${t.keep})</button>
      <button onclick="vote('${t.id}','skip')">SKIP (${t.skip})</button>
      ${isAdmin? `<button onclick="deleteTrack('${t.id}')" style="color:red">DELETE</button>` : ''}
    </div>`).join('') || '<p style="color:#555">Empty</p>';
  document.getElementById('live').innerHTML = live.map(t=>`
    <div class="track"><b>${t.title}</b> <span style="color:#888;font-size:12px">${t.license}</span><br>
    ${t.audioData? `<audio controls src="${t.audioData}" style="width:100%;margin:10px 0"></audio>` : ``}
    ${isAdmin? ` <button onclick="deleteTrack('${t.id}')" style="color:red">X</button>` : ''}
    </div>
  `).join('') || '<p style="color:#555">Empty</p>';
  if(!document.getElementById('adminBtn')){
    const b = document.createElement('button');
    b.id='adminBtn';
    b.textContent = isAdmin? 'Logout admin' : 'Admin login';
    b.onclick = isAdmin? logoutAdmin : loginAdmin;
    b.style='position:fixed;bottom:10px;right:10px;opacity:0.7';
    document.body.appendChild(b);
  } else {
    const b=document.getElementById('adminBtn');
    b.textContent = isAdmin? 'Logout admin' : 'Admin login';
    b.onclick = isAdmin? logoutAdmin : loginAdmin;
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

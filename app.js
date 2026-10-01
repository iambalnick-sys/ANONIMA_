const SUPABASE_URL = "https://dozppoomurlbeycdnqgh.supabase.co";
const SUPABASE_KEY = "sb_publishable_DFAyV1h7XHCkKJvzl51hKw_U9qAd62n";
const supabase = window.supabase? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let currentUser = localStorage.getItem('anonima_user');
if(!currentUser){
  currentUser = prompt("Choose a username:") || "anonymous";
  localStorage.setItem('anonima_user', currentUser);
}
const ADMIN_CODE = "I know admin";
let isAdmin = localStorage.getItem('anonima_admin') === '1';
let allTracks = [];

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

async function loadTracks(){
  if(!supabase){ console.error("Supabase non caricato"); return; }
  const { data, error } = await supabase.from('tracks').select('*').order('created_at', {ascending:false});
  if(!error) allTracks = data || [];
  render();
}

async function upload(){
  if(!supabase){ alert("Supabase non caricato, ricarica la pagina"); return; }
  const title = document.getElementById('title').value.trim();
  const license = document.getElementById('license').value;
  const file = document.getElementById('file').files[0];
  if(!title ||!file){ alert("Metti titolo e file"); return; }

  const id = Date.now().toString();
  const fileName = id + "_" + file.name;

  const { error: upErr } = await supabase.storage.from('audio').upload(fileName, file);
  if(upErr){ alert("Upload errore: "+upErr.message); return; }

  const { data } = supabase.storage.from('audio').getPublicUrl(fileName);
  const audio_url = data.publicUrl;

  const { error } = await supabase.from('tracks').insert([{
    id, title, license, keep:0, skip:0, status:'pending',
    uploader: currentUser, voters: [], audio_url
  }]);
  if(error){ alert(error.message); return; }

  document.getElementById('title').value=''; document.getElementById('file').value='';
  loadTracks();
}

async function vote(id, type){
  const t = allTracks.find(x=>x.id===id);
  if(!t) return;
  if(t.uploader === currentUser &&!isAdmin) return;
  if(t.voters && t.voters.includes(currentUser)) return;

  const newVoters = [...(t.voters||[]), currentUser];
  let update = { voters: newVoters };
  update[type] = t[type]+1;

  if(type==='keep' && t.keep+1 >= 2 && t.status==='pending'){
    update.status='live'; update.uploader=null; update.voters=[];
  }

  await supabase.from('tracks').update(update).eq('id', id);
  loadTracks();
}

async function deleteTrack(id){
  if(!isAdmin) return;
  if(!confirm("Delete?")) return;
  await supabase.from('tracks').delete().eq('id', id);
  loadTracks();
}

function render(){
  const vault = allTracks.filter(t=>t.status==='pending');
  const live = allTracks.filter(t=>t.status==='live');
  document.getElementById('vault').innerHTML = vault.map(t=>`
    <div class="track">
      <b>${t.title}</b> <span style="color:#888;font-size:12px">${t.license}</span><br>
      ${t.audio_url? `<audio controls src="${t.audio_url}" style="width:100%;margin:10px 0"></audio><br>` : ``}
      <button onclick="vote('${t.id}','keep')">KEEP (${t.keep})</button>
      <button onclick="vote('${t.id}','skip')">SKIP (${t.skip})</button>
      ${isAdmin? `<button onclick="deleteTrack('${t.id}')" style="color:red">DELETE</button>` : ''}
    </div>`).join('') || '<p style="color:#555">Empty</p>';

  document.getElementById('live').innerHTML = live.map(t=>`
    <div class="track"><b>${t.title}</b> <span style="color:#888;font-size:12px">${t.license}</span><br>
    ${t.audio_url? `<audio controls src="${t.audio_url}" style="width:100%;margin:10px 0"></audio>` : ``}
    ${isAdmin? ` <button onclick="deleteTrack('${t.id}')" style="color:red">X</button>` : ''}
    </div>`).join('') || '<p style="color:#555">Empty</p>';

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

loadTracks();

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

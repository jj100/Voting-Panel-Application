const urlParams = new URLSearchParams(window.location.search);
const apiBase = urlParams.get('api') || 'http://localhost:3000';
document.getElementById('api-url').textContent = apiBase;

const areas = {
  login: document.getElementById('login-area'),
  vote: document.getElementById('vote-area'),
  user: document.getElementById('user-area'),
  results: document.getElementById('results-area')
};

const loginForm = document.getElementById('login-form');
const voteForm = document.getElementById('vote-form');
const addForm = document.getElementById('add-candidate-form');
const candSel = document.getElementById('candidate_select');
const loginMsg = document.getElementById('login-msg');
const voteMsg = document.getElementById('vote-msg');
const addMsg = document.getElementById('add-msg');
const resultList = document.getElementById('results-list');
const ctx = document.getElementById('resultsChart').getContext('2d');
let chart;

// Pokazuje lub ukrywa obszary 
function show(role) {
  areas.login.style.display = 'none';
  areas.vote.style.display = 'block';
  areas.user.style.display = 'none';
  areas.results.style.display = 'none';
  if (role === 'admin' || role === 'user')  areas.user.style.display = 'block';
  if (role === 'admin')                     areas.results.style.display = 'block'; // zawsze widoczne dla user/admin
}

// Logowanie
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('login_user').value.trim();
  const password = document.getElementById('login_pass').value.trim();

  if (!username && !password) {
    // Brak loginu i hasła = rola voter
    loginForm.reset();
    show('voter');
    loadCandidates();
    loadResults();
    return;
  }

  fetch(`${apiBase}/login`, {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  }).then(r => r.json()).then(d => {
    if (d.success) {
	  document.getElementById('api-rola').textContent = d.role;
      loginForm.reset();
      show(d.role);
      loadCandidates();
      loadResults();
    } else loginMsg.textContent = d.error;
  });
});


// Dodawanie kandydatów (admin/user)
addForm.addEventListener('submit', e => {
  e.preventDefault();
  fetch(`${apiBase}/api/candidates`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name: document.getElementById('candidate_name').value })
  }).then(r=>r.json()).then(d=>{
    addMsg.textContent = d.id ? 'Dodano' : d.error;
    loadCandidates();
  });
});

// Głosowanie (admin/voter)
voteForm.addEventListener('submit', e => {
  e.preventDefault();
  fetch(`${apiBase}/vote`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      voter_identifier: document.getElementById('voter_identifier').value,
      name: document.getElementById('voter_name').value,
      candidate_id: candSel.value
    })
  }).then(r=>r.json()).then(d=>{
    voteMsg.textContent = d.success ? 'Głos oddany' : d.error;voter_identifier
    loadCandidates();
    loadResults();
  });
});

// Ładowanie kandydatów
function loadCandidates(){
  fetch(`${apiBase}/candidates`)
    .then(r=>r.json())
    .then(data=>{
      candSel.innerHTML = '';
      data.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = c.name;
        candSel.appendChild(o);
      });
    });
}

// Wyniki + wykres
function loadResults(){
  fetch(`${apiBase}/candidates`)
    .then(r=>r.json())
    .then(data=>{
      resultList.innerHTML = '';
      data.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.name}: ${c.votes} głosów`;
        resultList.appendChild(li);
      });
      drawChart(data);
    });
}

function drawChart(data){
  const labels = data.map(c => c.name);
  const votes = data.map(c => c.votes);
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label:'Głosy', data:votes, backgroundColor:'rgba(54,162,235,0.6)' }] }
  });
}

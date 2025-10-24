const API_KEY = "PUT_YOUR_CRICKETDATA_API_KEY_HERE";
const apiUrl = (key) => `https://cricketdata.org/api/matches?apikey=${key}&type=international`;

const matchesEl = document.getElementById('matches');
const emptyEl = document.getElementById('empty');
const demoBtn = document.getElementById('demoBtn');
const REFRESH_MS = 60_000;

async function loadMatches(){
  matchesEl.innerHTML = `<p class="stat" style="opacity:0.8">Loading live matches...</p>`;
  emptyEl.classList.add('hidden');
  try{
    if(!API_KEY || API_KEY.includes("PUT_YOUR")) throw new Error("Missing API Key - using demo");

    const res = await fetch(apiUrl(API_KEY));
    if(!res.ok) throw new Error('Network response not ok: ' + res.status);
    const data = await res.json();

    const matches = data.data || data.matches || data || [];
    if(!matches || matches.length === 0){
      matchesEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }

    renderMatches(matches);
  }catch(err){
    console.warn("Fetch error or missing key:", err);
    matchesEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
  }
}

function renderMatches(matches){
  const international = matches.filter(m => {
    const c = (m.competition || m.series || m.tournament || "").toString().toLowerCase();
    return c.includes('international') || c.includes('test') || c.includes('odi') || c.includes('t20') || (m.format && ['ODI','T20','Test'].includes(m.format));
  });

  const list = international.length ? international : matches;
  matchesEl.innerHTML = list.map(buildCard).join('\n');
}

function buildCard(m){
  const title = m.name || m.title || `${m.team1 || 'Team A'} vs ${m.team2 || 'Team B'}`;
  const league = m.competition || m.series || m.tournament || '';
  const status = (m.status || m.matchStarted || '').toString().toLowerCase();
  const isLive = status.includes('live') || m.matchStarted===true;

  let scoreText = 'No live score yet';
  try{
    if(m.score && Array.isArray(m.score) && m.score.length){
      const s = m.score[0];
      const r = s.r || s.runs || '-';
      const w = s.w || s.wickets || '-';
      const o = s.o || s.overs || '-';
      scoreText = `${r} / ${w}  in ${o} overs`;
    } else if(m.currentScore){
      scoreText = m.currentScore;
    }
  }catch(e){ scoreText='Score unavailable'; }

  const overs = (m.overs || '-') ;
  const runRate = (m.runRate || '-') ;
  const venue = (m.venue || '-') ;

  // Placeholder logos
  const team1Logo = m.team1Logo || 'https://via.placeholder.com/32';
  const team2Logo = m.team2Logo || 'https://via.placeholder.com/32';

  return `
  <article class="card">
    <div class="match-top">
      <div class="team-names">
        <img src="${team1Logo}" class="team-logo"/>
        ${m.team1 || 'Team A'}
        <span>vs</span>
        <img src="${team2Logo}" class="team-logo"/>
        ${m.team2 || 'Team B'}
      </div>
      <div>
        <div class="status ${isLive?'live':'scheduled'}">${isLive?'LIVE':(m.status||'Scheduled')}</div>
      </div>
    </div>

    <div class="score-row">
      <div class="score-big">${scoreText}</div>
      <div class="score-small">Overs: ${overs} • RR: ${runRate}</div>
      <div class="stat">Venue: ${venue}</div>
    </div>

    <div class="card-footer">
      <div class="stat">Format: ${m.format || '—'}</div>
      <div class="stat">Ref: ${m.match_id || '—'}</div>
    </div>
  </article>
  `;
}

function loadDemo(){
  const demo = [
    {
      team1: "India", team2: "Australia",
      name:"India vs Australia - 3rd ODI",
      competition:"ICC Men's Championship - International ODI",
      status:"LIVE",
      matchStarted:true,
      score:[{r:212,w:4,o:36.2}],
      overs:36.2,
      runRate:5.86,
      venue:"Wankhede Stadium, Mumbai",
      start_time:"Today 2:30 PM IST",
      format:"ODI",
      match_id:"demo-1",
      team1Logo:"https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      team2Logo:"https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg"
    },
    {
      team1:"England", team2:"Pakistan",
      name:"England vs Pakistan - 1st T20",
      competition:"T20 International Series",
      status:"Scheduled",
      matchStarted:false,
      score:[],
      overs:"-",
      runRate:"-",
      venue:"Lords, London",
      start_time:"Tomorrow 7:00 PM GMT",
      format:"T20",
      match_id:"demo-2",
      team1Logo:"https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
      team2Logo:"https://upload.wikimedia.org/wikipedia/en/3/32/Flag_of_Pakistan.svg"
    }
  ];
  renderMatches(demo);
  emptyEl.classList.add('hidden');
}

if(demoBtn) demoBtn.addEventListener('click', loadDemo);

loadMatches();
setInterval(loadMatches, REFRESH_MS);

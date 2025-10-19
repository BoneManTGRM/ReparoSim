// Minimal, dependency-free charts + TGRM toy model
function linspace(n){ return Array.from({length:n},(_,i)=>i); }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

// Tiny canvas line plotter
function linePlot(canvas, xs, ysSeries, labels){
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#fafafa'; ctx.fillRect(0,0,W,H);
  // axes
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
  for(let i=0;i<6;i++){ const y = 10 + i*(H-20)/5; ctx.beginPath(); ctx.moveTo(40,y); ctx.lineTo(W-10,y); ctx.stroke(); }
  ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(40,10); ctx.lineTo(40,H-20); ctx.lineTo(W-10,H-20); ctx.stroke();

  const minX = 0, maxX = xs[xs.length-1];
  const flat = ysSeries.flat();
  const minY = Math.min(...flat), maxY = Math.max(...flat);
  const X = x => 40 + (x-minX)/(maxX-minX||1) * (W-50);
  const Y = y => (H-20) - (y-minY)/(maxY-minY||1) * (H-30);

  const styles = ['#1565c0','#2e7d32','#c62828','#6a1b9a'];
  ysSeries.forEach((ys,k)=>{
    ctx.strokeStyle = styles[k%styles.length]; ctx.lineWidth = 2; ctx.beginPath();
    ys.forEach((y,i)=>{ const xx=X(xs[i]), yy=Y(y); if(i===0) ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy); });
    ctx.stroke();
    ctx.fillStyle = styles[k%styles.length]; ctx.fillRect(50+k*140, 8, 10, 10);
    ctx.fillStyle = '#444'; ctx.font = '12px system-ui'; ctx.fillText(labels[k]||`S${k+1}`, 66+k*140, 17);
  });
}

// Tiny scatter
function scatter(canvas, points, labels){
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#fafafa'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(40,10); ctx.lineTo(40,H-20); ctx.lineTo(W-10,H-20); ctx.stroke();

  const xs = points.map(p=>p[0]), ys = points.map(p=>p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const X = x => 40 + (x-minX)/(maxX-minX||1) * (W-50);
  const Y = y => (H-20) - (y-minY)/(maxY-minY||1) * (H-30);

  const styles = ['#0d47a1','#b71c1c','#1b5e20','#4a148c'];
  points.forEach((p,i)=>{
    ctx.fillStyle = styles[i%styles.length];
    ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.font = '12px system-ui'; ctx.fillText(labels[i]||'', X(p[0])+8, Y(p[1])+4);
  });

  ctx.fillStyle = '#333'; ctx.font='12px system-ui';
  ctx.fillText('Energy →', W-70, H-5); ctx.save(); ctx.translate(12, H/2); ctx.rotate(-Math.PI/2); ctx.fillText('Accuracy ↑', 0, 0); ctx.restore();
}

// ---------- TGRM toy dynamics ----------
function simulate({steps=300, fault=0.25, cap=0.10, kRepair=0.25}){
  let accR=[], accT=[], engR=[], engT=[], bpiR=[], bpiT=[];
  let aR=0.88, aT=0.88, eR=0.0, eT=0.0;

  for(let t=0;t<steps;t++){
    const noise = (Math.random()*2-1) * 0.002 * fault;

    // TGRM: targeted repair with diminishing returns + bounded cost
    const repairPush = kRepair * (1.0 - aR);
    const usefulGain = 0.5 * cap * repairPush;
    aR = Math.max(0.5, Math.min(0.995, aR + usefulGain + noise));
    const costR = 0.12 * cap * repairPush + 0.002;
    eR += costR;

    // Retrain: heavier generic updates (more energy per step)
    const trainPush = 0.7 * (1.0 - aT);
    aT = Math.max(0.5, Math.min(0.999, aT + 0.4*trainPush + noise));
    const costT = 0.4 * trainPush + 0.01;
    eT += costT;

    accR.push(aR); engR.push(eR); bpiR.push((aR-accR[0])/(eR+1e-9));
    accT.push(aT); engT.push(eT); bpiT.push((aT-accT[0])/(eT+1e-9));
  }
  return {accR, accT, engR, engT, bpiR, bpiT};
}

// ---------- Hook up UI ----------
const els = {
  steps: document.getElementById('steps'),
  fault: document.getElementById('fault'),
  cap:   document.getElementById('cap'),
  krep:  document.getElementById('krep'),
  run:   document.getElementById('run'),
  acc:   document.getElementById('accChart'),
  eng:   document.getElementById('engChart'),
  bpi:   document.getElementById('bpiChart'),
  scat:  document.getElementById('scatter'),
  sR:    document.getElementById('stat-repair'),
  sT:    document.getElementById('stat-retrain'),
};

function runOnce(){
  const steps = parseInt(els.steps.value,10);
  const fault = parseFloat(els.fault.value);
  const cap   = parseInt(els.cap.value,10)/100;
  const kRepair = parseFloat(els.krep.value);

  const {accR, accT, engR, engT, bpiR, bpiT} = simulate({steps, fault, cap, kRepair});
  const xs = Array.from({length:steps},(_,i)=>i);

  linePlot(els.acc, xs, [accR, accT], ['TGRM Repair','Retrain']);
  linePlot(els.eng, xs, [engR, engT], ['TGRM Repair','Retrain']);
  linePlot(els.bpi, xs, [bpiR, bpiT], ['TGRM Repair','Retrain']);
  scatter(els.scat, [[engR.at(-1), accR.at(-1)], [engT.at(-1), accT.at(-1)]], ['Repair','Retrain']);

  const accRfin = accR.at(-1), accTfin = accT.at(-1);
  const eRfin = engR.at(-1),   eTfin = engT.at(-1);
  const bpiRfin = (accRfin-accR[0])/(eRfin+1e-9);
  const bpiTfin = (accTfin-accT[0])/(eTfin+1e-9);

  els.sR.innerHTML = `<strong>Repair (TGRM)</strong><br>Final Acc: ${(accRfin*100).toFixed(2)}% · Energy: ${eRfin.toFixed(3)} · BPI: ${bpiRfin.toFixed(3)}`;
  els.sT.innerHTML = `<strong>Retrain</strong><br>Final Acc: ${(accTfin*100).toFixed(2)}% · Energy: ${eTfin.toFixed(3)} · BPI: ${bpiTfin.toFixed(3)}`;
}

els.run.addEventListener('click', runOnce);
runOnce(); // first render

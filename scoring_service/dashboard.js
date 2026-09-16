function studentLabel(s) { return s.name || s.id; }
function nodeClass(s,n) {
  if (!s.fresh || !s.reachable) return 'light';
  if (n.verified) return 'light verified';
  return n.health==='healthy' && n.lifecycle==='InService' ? 'light healthy' : 'light';
}
function selectedStudents(students,selection) { return students.filter(s=>selection===null || selection.has(s.id)); }
function fmgStatus(s, now=Date.now()/1000) {
  const f=s.fortimanager;
  if(!f || f.deployed===null || f.error) return {text:'FMG unknown', good:false};
  if(now-f.checked_at>120) return {text:'FMG stale', good:false};
  if(!f.deployed) return {text:'FMG not found', good:false};
  const states=[...new Set(f.instances.map(i=>i.state))];
  return {text:states.length===1 && states[0]==='running'?'FMG deployed':`FMG ${states.length===1?states[0]:'deployed'}`, good:true};
}
function cardStatus(s) {
  const fresh=s.fresh && s.reachable;
  return {
    web: !s.url ? 'Not deployed' : s.reachable ? 'Web online' : 'Web offline',
    phase: !s.url ? 'Awaiting lab' : !s.reachable ? 'Unreachable' : !s.fresh ? 'Inventory stale' : s.healthy>=3 ? 'Scaled to 3+' : s.healthy>=2 ? 'Baseline ready' : 'Provisioning',
    count: fresh ? `${s.healthy} healthy · ${s.verified} verified` : '— healthy · — verified',
    steps: [fresh && s.healthy>=2, fresh && s.healthy>=3, fresh && s.verified>=3]
  };
}
function gridLayout(count,width,height) {
  let cols=Math.max(1,Math.min(6,Math.floor(width/290),count||1));
  const available=Math.max(100,height);
  while(cols<Math.min(8,count) && width/(cols+1)>=165 && (available-(Math.ceil(count/cols)-1)*12)/Math.ceil(count/cols)<125) cols++;
  const rows=Math.max(1,Math.ceil(count/cols));
  return {cols,height:Math.max(94,Math.min(240,Math.floor((available-(rows-1)*12)/rows)))};
}
if(typeof module!=='undefined') module.exports={studentLabel,nodeClass,selectedStudents,cardStatus,gridLayout,fmgStatus};
if(typeof document!=='undefined') {
  const $=id=>document.getElementById(id), key='ums-selected-students', events=new Map();
  let selection=null,latest=null,roster='';
  try { const saved=JSON.parse(localStorage.getItem(key)); if(Array.isArray(saved)) selection=new Set(saved.filter(x=>typeof x==='string')); } catch(_) {}
  function syncChoices() {
    if(!latest)return;
    for(const c of $('choices').querySelectorAll('input')) c.checked=selection===null||selection.has(c.value);
    $('selection-label').textContent=selection===null?'All students':`${selectedStudents(latest.students,selection).length} students selected`;
  }
  function save() { try{localStorage.setItem(key,JSON.stringify(selection===null?null:[...selection]));}catch(_){} syncChoices();render(); }
  function choices() {
    const next=JSON.stringify(latest.students.map(s=>[s.id,studentLabel(s)]));
    if(next!==roster) {
      roster=next;$('choices').replaceChildren();
      for(const s of latest.students) {
        const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.value=s.id;
        c.addEventListener('change',()=>{if(selection===null)selection=new Set(latest.students.map(s=>s.id));if(c.checked)selection.add(s.id);else selection.delete(s.id);save();});
        label.append(c,document.createTextNode(studentLabel(s)));$('choices').append(label);
      }
    }
    syncChoices();
  }
  function render(flashes=new Set()) {
    if(!latest)return;const list=$('students');list.replaceChildren();
    const visible=selectedStudents(latest.students,selection);
    for(const s of visible) {
      const row=document.createElement('div'),label=document.createElement('span'),lights=document.createElement('div');
      row.className='row'+(s.account_id==='594379811663'?' instructor':'');label.className='student';label.textContent=studentLabel(s);lights.className='lights';
      const nodes=[...s.nodes].sort((a,b)=>a.id.localeCompare(b.id));
      for(let i=0;i<Math.max(3,nodes.length);i++) {
        const box=document.createElement('div'),caption=document.createElement('span');box.className='node';caption.className='node-caption';caption.textContent=`FGT ${i+1}`;
        const light=document.createElement('span'),n=nodes[i];light.className=n?nodeClass(s,n):'light missing';
        if(n&&flashes.has(s.id+'|'+n.id))light.classList.add('flash');
        const status=!n?'Awaiting discovery':!s.fresh||!s.reachable?'Unavailable or stale':n.verified?'Traffic verified':n.health;
        light.title=`FortiGate ${i+1}: ${status}`;light.setAttribute('role','img');light.setAttribute('aria-label',light.title);box.append(light,caption);lights.append(box);
      }
      const head=document.createElement('div'),identity=document.createElement('div'),web=document.createElement('span'),metrics=document.createElement('div'),count=document.createElement('span'),phase=document.createElement('span'),progress=document.createElement('div');
      const status=cardStatus(s);head.className='card-head';identity.append(label);
      if(s.account_id==='594379811663'){const badge=document.createElement('div');badge.className='badge';badge.textContent='Instructor demo';identity.append(badge);}
      web.className='web-status '+(s.reachable?'up':'down');web.textContent=(s.reachable?'● ':'○ ')+status.web;
      const services=document.createElement('div'),fmg=document.createElement('span'),fm=fmgStatus(s);
      services.className='service-status';fmg.className='fmg-status'+(fm.good?' deployed':'');fmg.textContent=(fm.good?'✓ ':'○ ')+fm.text;
      fmg.title=s.fortimanager?.error ? 'FortiManager discovery: '+s.fortimanager.error : 'AWS EC2 deployment only; not a management connectivity check';
      services.append(fmg,web);head.append(identity,services);metrics.className='card-metrics';count.textContent=status.count;phase.className='phase'+(status.steps[2]?' complete':'');phase.textContent=status.phase;metrics.append(count,phase);
      progress.className='progress';progress.setAttribute('aria-label','Progress: two healthy, three healthy, three inspecting');
      status.steps.forEach((done,i)=>{const bar=document.createElement('span');bar.className=done?'done':'';bar.title=['2 healthy FortiGates','3 healthy FortiGates','3 verified inspecting'][i];progress.append(bar);});
      const bottom=document.createElement('div');bottom.append(metrics,progress);row.append(head,lights,bottom);list.append(row);
    }
    const layout=gridLayout(visible.length,list.clientWidth,window.innerHeight-list.getBoundingClientRect().top-52);
    list.style.setProperty('--cols',layout.cols);list.style.setProperty('--card-height',layout.height+'px');
    list.classList.toggle('compact',layout.height<185 || list.clientWidth/layout.cols<320);
    list.classList.toggle('dense',layout.height<135);
    if(!list.children.length){const e=document.createElement('div');e.className='empty';e.textContent=latest.students.length?'Choose student accounts from the dropdown.':'No student accounts configured.';list.append(e);}
  }
  window.addEventListener('resize',()=>render());
  $('select-all').addEventListener('click',()=>{selection=null;save();});$('select-none').addEventListener('click',()=>{selection=new Set();save();});
  document.addEventListener('click',e=>{if(!$('selector').contains(e.target))$('selector').open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('selector').open=false;});
  async function refresh(){try{
    const r=await fetch('/api/state',{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error();
    const data=await r.json(),flashes=new Set(),keys=new Set();
    for(const s of data.students)for(const n of s.nodes){const k=s.id+'|'+n.id,old=events.get(k);keys.add(k);if(s.fresh&&s.reachable&&old!==undefined&&n.event>old)flashes.add(k);events.set(k,n.event);}
    for(const k of events.keys())if(!keys.has(k))events.delete(k);
    latest=data;choices();render(flashes);$('connection').textContent='● Live';
  }catch(_){$('connection').textContent='● Disconnected';if(latest){for(const s of latest.students){s.fresh=false;s.reachable=false;if(s.fortimanager)s.fortimanager.checked_at=0;}render();}}
  finally{setTimeout(refresh,1500);}}
  refresh();
}

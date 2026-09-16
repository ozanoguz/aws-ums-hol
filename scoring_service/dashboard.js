function studentLabel(s) { return s.name || s.id; }
function displayNodes(s,now=Date.now()/1000) {
  const inventory=s.fortigates;
  if(inventory && !inventory.error && now-inventory.checked_at<=120) {
    const evidence=new Map(s.nodes.map(n=>[n.id,n]));
    return inventory.instances.map(n=>({...evidence.get(n.id),id:n.id,ec2_state:n.state,deployment_fresh:true}));
  }
  return s.nodes;
}
function nodeClass(s,n) {
  if (s.transport_lost) return 'light';
  if (n.ec2_state && !['running','pending'].includes(n.ec2_state)) return 'light';
  if (s.fresh && s.reachable && n.verified) return 'light verified';
  if (n.deployment_fresh || (s.fresh && s.reachable)) return 'light healthy';
  return 'light';
}
function nodeStatus(s,n) {
  if(s.transport_lost) return 'Last known';
  if(!n) return 'Waiting';
  if(n.ec2_state && !['running','pending'].includes(n.ec2_state)) return n.ec2_state;
  if(s.fresh && s.reachable && n.verified) return 'Inspecting';
  if(n.deployment_fresh || (s.fresh && s.reachable)) return n.ec2_state==='pending'?'Starting':'Deployed';
  return 'Stale';
}
function selectedStudents(students,selection) { return students.filter(s=>selection===null || selection.has(s.id)); }
function fmgStatus(s, now=Date.now()/1000) {
  if(s.transport_lost) return {text:'FMG last known',good:false};
  const f=s.fortimanager;
  if(!f || f.deployed===null || f.error) return {text:'FMG unknown', good:false};
  if(now-f.checked_at>120) return {text:'FMG stale', good:false};
  if(!f.deployed) return {text:'FMG not found', good:false};
  const states=[...new Set((f.instances || []).map(i=>i.state))];
  return {text:states.length===1 && states[0]==='running'?'FMG deployed':`FMG ${states.length===1?states[0]:'deployed'}`, good:true};
}
function cardStatus(s) {
  if(s.transport_lost) return {web:'Web last known',phase:'Updates paused',count:'Last known data',steps:[false,false,false]};
  const fresh=s.fresh && s.reachable;
  return {
    web: !s.url ? (s.discovery_status?.includes('failed')?'Web unknown':'Not deployed') : s.reachable ? 'Web online' : 'Web offline',
    phase: !s.url ? 'Awaiting lab' : !s.reachable ? 'Unreachable' : !s.fresh ? 'Inventory stale' : s.healthy>=3 ? 'Scaled to 3+' : s.healthy>=2 ? 'Baseline ready' : 'Provisioning',
    count: fresh ? `${s.healthy} healthy · ${s.verified} verified` : '— healthy · — verified',
    steps: [fresh && s.healthy>=2, fresh && s.healthy>=3, fresh && s.verified>=3]
  };
}
function gridLayout(count,width,height) {
  let cols=Math.max(1,Math.min(6,Math.floor(width/290),count||1));
  const available=Math.max(100,height);
  while(cols<Math.min(8,count) && width/(cols+1)>=165 && (available-(Math.ceil(count/cols)-1)*12)/Math.ceil(count/cols)<125) cols++;
  while(cols>1 && Math.ceil(count/(cols-1))===Math.ceil(count/cols) && width/(cols-1)<430) cols--;
  const rows=Math.max(1,Math.ceil(count/cols));
  return {cols,height:Math.max(94,Math.min(220,Math.floor((available-(rows-1)*12)/rows)))};
}
if(typeof module!=='undefined') module.exports={studentLabel,nodeClass,selectedStudents,cardStatus,gridLayout,fmgStatus,displayNodes,nodeStatus};
if(typeof document!=='undefined') {
  const $=id=>document.getElementById(id), key='ums-selected-students';
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
  function render() {
    if(!latest)return;const list=$('students');list.replaceChildren();
    const visible=selectedStudents(latest.students,selection);
    const known=visible.filter(s=>!s.transport_lost);
    $('overview').textContent=`${visible.length} selected  ·  ${known.filter(s=>fmgStatus(s).good).length} FMG deployed  ·  ${known.filter(s=>s.reachable).length} web online  ·  ${known.filter(s=>s.fresh&&s.reachable&&s.healthy>=3).length} scaled out`;
    for(const s of visible) {
      const row=document.createElement('div'),label=document.createElement('span'),lights=document.createElement('div');
      row.className='row'+(s.account_id==='594379811663'?' instructor':'');label.className='student';label.textContent=studentLabel(s);lights.className='lights';
      const nodes=[...displayNodes(s)].sort((a,b)=>a.id.localeCompare(b.id));
      for(let i=0;i<Math.max(3,nodes.length);i++) {
        const box=document.createElement('div'),caption=document.createElement('span');box.className='node';caption.className='node-caption';caption.textContent=`FGT ${i+1}`;
        const light=document.createElement('span'),n=nodes[i];light.className=n?nodeClass(s,n):'light missing';
        const status=nodeStatus(s,n);
        const note=document.createElement('span');note.className='node-state';note.textContent=status;
        if(n&&nodeClass(s,n)!=='light')box.classList.add(nodeClass(s,n)==='light verified'?'observed':'discovered');
        light.title=`FortiGate ${i+1}: ${status}`;light.setAttribute('role','img');light.setAttribute('aria-label',light.title);box.append(caption,light,note);lights.append(box);
      }
      const head=document.createElement('div'),identity=document.createElement('div'),web=document.createElement('span'),metrics=document.createElement('div'),count=document.createElement('span'),phase=document.createElement('span'),progress=document.createElement('div');
      const status=cardStatus(s);head.className='card-head';identity.append(label);
      if(s.account_id==='594379811663'){const badge=document.createElement('div');badge.className='badge';badge.textContent='Instructor demo';identity.append(badge);}
      web.className='web-status '+(s.reachable&&!s.transport_lost?'up':'down');web.textContent=(s.reachable&&!s.transport_lost?'● ':'○ ')+status.web;
      const services=document.createElement('div'),fmg=document.createElement('span'),fm=fmgStatus(s);
      services.className='service-status';fmg.className='fmg-status'+(fm.good?' deployed':'');fmg.textContent=(fm.good?'✓ ':'○ ')+fm.text;
      fmg.title=s.fortimanager?.error ? 'FortiManager discovery: '+s.fortimanager.error : 'AWS EC2 deployment only; not a management connectivity check';
      services.append(fmg,web);head.append(identity);metrics.className='card-metrics';count.textContent=status.count;phase.className='phase'+(status.steps[2]?' complete':'');phase.textContent=status.phase;metrics.append(count,phase);
      progress.className='progress';progress.setAttribute('aria-label','Progress: two healthy, three healthy, three inspecting');
      status.steps.forEach((done,i)=>{const bar=document.createElement('span');bar.className=done?'done':'';bar.title=['2 healthy FortiGates','3 healthy FortiGates','3 verified inspecting'][i];bar.textContent=['2-node baseline','3-node scale-out','Inspection'][i];progress.append(bar);});
      const bottom=document.createElement('div');bottom.append(metrics,progress);head.append(phase);row.append(head,services,lights,bottom);list.append(row);
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
    latest=await r.json();choices();render();$('connection').textContent='● Live';$('connection').classList.remove('disconnected');
  }catch(error){console.error('Dashboard update failed',error);$('connection').textContent='● Reconnecting';$('connection').classList.add('disconnected');if(latest){for(const s of latest.students)s.transport_lost=true;render();}}
  finally{setTimeout(refresh,1500);}}
  refresh();
}

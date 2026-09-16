function studentLabel(s) { return s.name || s.id; }
function nodeClass(s,n) {
  if (!s.fresh || !s.reachable) return 'light';
  if (n.verified) return 'light verified';
  return n.health==='healthy' && n.lifecycle==='InService' ? 'light healthy' : 'light';
}
function selectedStudents(students,selection) { return students.filter(s=>selection===null || selection.has(s.id)); }
if(typeof module!=='undefined') module.exports={studentLabel,nodeClass,selectedStudents};
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
    for(const s of selectedStudents(latest.students,selection)) {
      const row=document.createElement('div'),label=document.createElement('span'),lights=document.createElement('div');
      row.className='row';label.className='student';label.textContent=studentLabel(s);lights.className='lights';
      const nodes=[...s.nodes].sort((a,b)=>a.id.localeCompare(b.id));
      for(let i=0;i<Math.max(3,nodes.length);i++) {
        const light=document.createElement('span'),n=nodes[i];light.className=n?nodeClass(s,n):'light missing';
        if(n&&flashes.has(s.id+'|'+n.id))light.classList.add('flash');
        const status=!n?'Awaiting discovery':!s.fresh||!s.reachable?'Unavailable or stale':n.verified?'Traffic verified':n.health;
        light.title=`FortiGate ${i+1}: ${status}`;light.setAttribute('role','img');light.setAttribute('aria-label',light.title);lights.append(light);
      }
      row.append(label,lights);list.append(row);
    }
    if(!list.children.length){const e=document.createElement('div');e.className='empty';e.textContent=latest.students.length?'Choose student accounts from the dropdown.':'No student accounts configured.';list.append(e);}
  }
  $('select-all').addEventListener('click',()=>{selection=null;save();});$('select-none').addEventListener('click',()=>{selection=new Set();save();});
  document.addEventListener('click',e=>{if(!$('selector').contains(e.target))$('selector').open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('selector').open=false;});
  async function refresh(){try{
    const r=await fetch('/api/state',{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error();
    const data=await r.json(),flashes=new Set(),keys=new Set();
    for(const s of data.students)for(const n of s.nodes){const k=s.id+'|'+n.id,old=events.get(k);keys.add(k);if(s.fresh&&s.reachable&&old!==undefined&&n.event>old)flashes.add(k);events.set(k,n.event);}
    for(const k of events.keys())if(!keys.has(k))events.delete(k);
    latest=data;choices();render(flashes);$('connection').textContent='● Live';
  }catch(_){$('connection').textContent='● Disconnected';if(latest){for(const s of latest.students){s.fresh=false;s.reachable=false;}render();}}
  finally{setTimeout(refresh,1500);}}
  refresh();
}

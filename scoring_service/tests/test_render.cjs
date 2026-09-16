// Minimal DOM harness: exercise complete rendering and selector handlers without a browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.style={setProperty(){}};this.clientWidth=1744;this.classList={add(){},remove(){},toggle(){}};this.textContent='';}
 append(...items){this.children.push(...items);}
 replaceChildren(){this.children=[];}
 addEventListener(name,fn){this.listeners[name]=fn;}
 setAttribute(){}
 getBoundingClientRect(){return {top:170};}
 querySelectorAll(tag){return this.children.flatMap(x=>x instanceof Element?[...(x.tag===tag?[x]:[]),...x.querySelectorAll(tag)]:[]);}
 contains(){return false;}
}
(async()=>{
 const ids={};for(const id of ['connection','selection-label','overview','choices','students','select-all','select-none','selector'])ids[id]=new Element();
 const document={getElementById:id=>ids[id],createElement:tag=>new Element(tag),createTextNode:s=>s,addEventListener(){}};
 const students=Array.from({length:15},(_,i)=>({id:String(i),name:`student${String(i).padStart(2,'0')}`,account_id:i===0?'594379811663':'x',url:'http://test',fresh:true,reachable:true,healthy:2,verified:2,nodes:[{id:'n1',event:1,verified:true,health:'healthy',lifecycle:'InService'}],fortimanager:{deployed:true,checked_at:Date.now()/1000,instances:[{state:'running'}]}}));
 let scheduled,fail=false;
 const script=fs.readFileSync(path.join(__dirname,'../dashboard.js'),'utf8');
 const run=new Function('document','window','localStorage','fetch','setTimeout','console',script);
 run(document,{innerHeight:1000,addEventListener(){}},{getItem(){return null;},setItem(){}},async()=>{if(fail)throw Error('offline');return {ok:true,json:async()=>({students})};},fn=>{scheduled=fn;},{error(){}});
 await new Promise(setImmediate);
 assert.equal(ids.students.children.length,15);
 assert.equal(ids.choices.querySelectorAll('input').length,15);
 assert.match(ids.overview.textContent,/15 FMG deployed/);
 ids['select-none'].listeners.click();assert.equal(ids.students.children.length,1);assert.match(ids.students.children[0].textContent,/Choose/);
 ids.choices.querySelectorAll('input')[0].checked=true;
 ids.choices.querySelectorAll('input')[0].listeners.change();assert.equal(ids.students.children.length,1);assert.equal(ids.students.children[0].className,'row instructor');
 ids['select-all'].listeners.click();assert.equal(ids.students.children.length,15);
 fail=true;await scheduled();assert.match(ids.connection.textContent,/Reconnecting/);
 assert.equal(students[0].reachable,true);assert.equal(students[0].transport_lost,true);
 console.log('Full render, multi-selection and reconnect checks passed.');
})().catch(e=>{console.error(e);process.exit(1);});

const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const exported={exports:{}};
new Function('module',fs.readFileSync(path.join(__dirname,'../dashboard.js'),'utf8'))(exported);
const {studentLabel,nodeClass,selectedStudents}=exported.exports;
const students=[{id:'a',name:'student01'},{id:'b',name:'student02'}];
assert.equal(studentLabel(students[0]),'student01');
assert.equal(selectedStudents(students,null).length,2);
assert.deepEqual(selectedStudents(students,new Set(['b'])),[students[1]]);
assert.equal(selectedStudents(students,new Set()).length,0);
assert.equal(selectedStudents(students,new Set(['missing'])).length,0);
const active={fresh:true,reachable:true}, node={verified:true,health:'healthy',lifecycle:'InService'};
assert.equal(nodeClass(active,node),'light verified');
assert.equal(nodeClass({...active,fresh:false},node),'light');
assert.equal(nodeClass({...active,reachable:false},node),'light');
assert.equal(nodeClass(active,{...node,verified:false}),'light healthy');
assert.equal(nodeClass(active,{...node,verified:false,lifecycle:'Pending'}),'light');
console.log('Dashboard selection and light-state checks passed.');

const {cardStatus,gridLayout}=exported.exports;
assert.equal(cardStatus({url:'http://test',reachable:true,fresh:false,healthy:3,verified:3}).phase,'Inventory stale');
assert.deepEqual(cardStatus({url:'http://test',reachable:true,fresh:false,healthy:3,verified:3}).steps,[false,false,false]);
assert.equal(cardStatus({url:'',reachable:false}).web,'Not deployed');
assert.equal(cardStatus({url:'http://test',reachable:true,fresh:true,healthy:2,verified:2}).phase,'Baseline ready');
for(const [count,width,height] of [[35,1224,530],[35,1744,820],[15,1744,820]]) {
 const layout=gridLayout(count,width,height);
 assert.ok(Math.ceil(count/layout.cols)*(layout.height+12)-12<=height);
}
assert.ok(gridLayout(15,1744,820).height>gridLayout(35,1744,820).height);
console.log('Card status and classroom viewport sizing checks passed.');

const {fmgStatus}=exported.exports;
assert.equal(fmgStatus({},100).text,'FMG unknown');
assert.equal(fmgStatus({fortimanager:{deployed:false,checked_at:100,error:'',instances:[]}},100).text,'FMG not found');
assert.equal(fmgStatus({fortimanager:{deployed:true,checked_at:100,error:'',instances:[{state:'running'}]}},100).text,'FMG deployed');
assert.equal(fmgStatus({fortimanager:{deployed:true,checked_at:100,error:'',instances:[{state:'stopped'}]}},100).text,'FMG stopped');
assert.equal(fmgStatus({fortimanager:{deployed:true,checked_at:100,error:'',instances:[]}},221).text,'FMG stale');
console.log('FortiManager indicator checks passed.');

const paused={transport_lost:true,url:'http://test',fresh:true,reachable:true,healthy:3,verified:3};
assert.equal(cardStatus(paused).web,'Web last known');
assert.equal(cardStatus(paused).phase,'Updates paused');
assert.equal(fmgStatus(paused).text,'FMG last known');
assert.equal(nodeClass(paused,{verified:true}),'light');
assert.equal(gridLayout(15,1744,780).cols,5);
console.log('Balanced grid and disconnected-state checks passed.');

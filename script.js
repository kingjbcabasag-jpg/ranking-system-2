(()=>{
'use strict';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const key='classflow_modern_v2';
const today=new Date().toISOString().slice(0,10);

const seed=['Lloyd','Jeston','Jefferson','King','Reymond','Aaron']
.map((name,i)=>({
 id:'s'+(i+1),
 name,
 code:'STU-'+String(i+1).padStart(3,'0'),
 email:'',
 status:'Active'
}));

let data=(()=>{
 try{
  const x=JSON.parse(localStorage.getItem(key));
  if(x&&Array.isArray(x.students))return x;
 }catch(e){}
 return {students:seed,activities:[],grades:[],attendance:{}};
})();

let toastTimer;

const save=()=>localStorage.setItem(key,JSON.stringify(data));

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

const student=id=>data.students.find(s=>s.id===id);

const initials=n=>n.trim().split(/\s+/).slice(0,2)
.map(x=>x[0]||'').join('').toUpperCase();

const colors=[
 ['#eeeaff','#6e57d8'],
 ['#e5f2ff','#4184d5'],
 ['#e2f8ef','#299a70'],
 ['#fff0e4','#d58a49'],
 ['#ffeaf0','#ce6587']
];

function avatar(n){
 let i=[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%colors.length;
 return `<span class="avatar" style="background:${colors[i][0]};color:${colors[i][1]}">${esc(initials(n))}</span>`;
}

function toast(m){
 let t=$('#toast');
 t.textContent=m;
 t.classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

function modal(open){
 $('#studentModal').classList.toggle('open',open);
}

function page(name){
 $$('.page').forEach(p=>p.classList.toggle('active',p.id===name));
 $$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===name));
 $('#pageTitle').textContent=name[0].toUpperCase()+name.slice(1);
 $('#sidebar').classList.remove('open');
 window.scrollTo({top:0,behavior:'smooth'});

 if(name==='attendance')renderAttendance();
 if(name==='rankings')renderRanks();
}

function studentRow(s,actions=false){
 return `<tr>
 <td><div class="person">${avatar(s.name)}${esc(s.name)}</div></td>
 <td>${esc(s.code||'—')}</td>
 ${actions?`<td>${esc(s.email||'—')}</td>`:''}
 <td><span class="status ${s.status==='Inactive'?'inactive':''}">${esc(s.status)}</span></td>
 ${actions?`<td><div class="actions">
 <button class="mini" data-edit="${s.id}">Edit</button>
 <button class="mini del" data-delete="${s.id}">Delete</button>
 </div></td>`:''}
 </tr>`;
}

function renderStudents(){
 let q=($('#studentSearch').value||'').toLowerCase();

 let list=data.students.filter(s=>
  (s.name+' '+s.code+' '+s.email).toLowerCase().includes(q)
 );

 $('#studentsTable').innerHTML=list.map(s=>studentRow(s,true)).join('');
 $('#studentsEmpty').classList.toggle('hide',list.length>0);
 $('#studentCount').textContent=data.students.length+' students';
 $('#navCount').textContent=data.students.length;

 $('#overviewStudents').innerHTML=
 data.students.slice(0,5).map(s=>studentRow(s)).join('');

 let sel=$('#gradeStudent');
 let old=sel.value;

 sel.innerHTML=data.students.map(s=>
  `<option value="${s.id}">${esc(s.name)}</option>`
 ).join('')||'<option value="">Add a student first</option>';

 if(data.students.some(s=>s.id===old))sel.value=old;
 sel.disabled=!data.students.length;
}

function renderActivities(){
 let a=[...data.activities].sort((x,y)=>y.created-x.created);

 $('#activityCount').textContent=a.length+' total';

 $('#activityList').innerHTML=a.length?a.map(x=>`
 <div class="record">
  <span>▤</span>
  <div class="record-info">
   <b>${esc(x.name)}</b>
   <small>${esc(x.subject)} · ${esc(x.type)} · ${esc(x.date)} · ${x.total} pts</small>
   ${x.description?`<small>${esc(x.description)}</small>`:''}
  </div>
  <button class="mini del" data-delact="${x.id}">Delete</button>
 </div>`).join(''):'<div class="empty">Your activities will appear here.</div>';

 $('#recentActivities').innerHTML=a.slice(0,4).map(x=>`
 <div class="feed-item">
  <span>▤</span>
  <div><b>${esc(x.name)}</b><small>${esc(x.subject)} · ${esc(x.date)}</small></div>
 </div>`).join('')||'<div class="empty">No activities yet. Create your first one.</div>';
}

function renderGrades(){
 let a=[...data.grades].sort((x,y)=>y.created-x.created);

 $('#gradeCount').textContent=a.length+' records';

 $('#gradesTable').innerHTML=a.map(g=>{
  let pct=g.score/g.total*100;
  return `<tr>
   <td>${esc(student(g.sid)?.name||'Deleted student')}</td>
   <td>${esc(g.assessment)}<br><small>${esc(g.subject)} · ${esc(g.period)}</small></td>
   <td>${g.score} / ${g.total}</td>
   <td class="result ${pct>=75?'good':'low'}">${pct.toFixed(1)}%</td>
   <td><button class="mini del" data-delgrade="${g.id}">Delete</button></td>
  </tr>`;
 }).join('');

 $('#gradesEmpty').classList.toggle('hide',a.length>0);
}

function day(){
 let d=$('#attendanceDate').value||today;
 return data.attendance[d]||(data.attendance[d]={});
}

function renderAttendance(){
 let a=day(),p=0,l=0,ab=0;

 $('#attendanceTable').innerHTML=data.students.map(s=>{
  let v=a[s.id]||{status:'Absent',note:''};

  if(v.status==='Present')p++;
  else if(v.status==='Late')l++;
  else ab++;

  return `<tr>
   <td><div class="person">${avatar(s.name)}${esc(s.name)}</div></td>
   <td><select class="attendance-status" data-att="${s.id}">
    <option ${v.status==='Present'?'selected':''}>Present</option>
    <option ${v.status==='Late'?'selected':''}>Late</option>
    <option ${v.status==='Absent'?'selected':''}>Absent</option>
   </select></td>
   <td><input class="attendance-note" data-note="${s.id}" value="${esc(v.note||'')}" placeholder="Optional note"></td>
  </tr>`;
 }).join('');

 $('#attendanceEmpty').classList.toggle('hide',data.students.length>0);
 $('#attendanceSummary').textContent=`${p} present · ${l} late · ${ab} absent`;
 $('#sAttendance').textContent=
 (data.students.length?Math.round((p+l*.5)/data.students.length*100):0)+'%';
}

function renderRanks(){
 let a=data.students.map(s=>{
  let g=data.grades.filter(x=>x.sid===s.id);
  let avg=g.length?
   g.reduce((n,x)=>n+x.score/x.total*100,0)/g.length:null;
  return {s,avg,count:g.length};
 }).filter(x=>x.avg!==null).sort((x,y)=>y.avg-x.avg);

 $('#rankingList').innerHTML=a.length?a.map((x,i)=>`
 <div class="rank">
  <span class="rank-no">${i+1}</span>
  <div>
   <div class="rank-name">${esc(x.s.name)}</div>
   <div class="rank-meta">${x.count} grade record(s)</div>
  </div>
  <div class="bar"><span style="width:${Math.max(0,Math.min(100,x.avg))}%"></span></div>
  <div class="rank-score">${x.avg.toFixed(1)}%</div>
 </div>`).join(''):'Add grade records to see rankings.';
}

function render(){
 $('#sStudents').textContent=data.students.length;
 $('#sActivities').textContent=data.activities.length;
 $('#sGrades').textContent=data.grades.length;

 renderStudents();
 renderActivities();
 renderGrades();
 renderAttendance();
 renderRanks();
}

// ADD OR EDIT STUDENT
$('#studentForm').addEventListener('submit',e=>{
 e.preventDefault();

 let f=new FormData(e.currentTarget);
 let id=f.get('id');
 let name=String(f.get('name')).trim();

 if(id){
  let s=student(id);
  if(s)Object.assign(s,{
   name,
   code:f.get('code'),
   email:f.get('email'),
   status:f.get('status')
  });
  toast('Student updated.');
 }else{
  data.students.push({
   id:'s'+Date.now(),
   name,
   code:String(f.get('code')).trim()||
    'STU-'+String(data.students.length+1).padStart(3,'0'),
   email:f.get('email'),
   status:f.get('status')
  });
  toast('Student added.');
 }

 save();
 e.currentTarget.reset();
 modal(false);
 render();
});

// ADD ACTIVITY
$('#activityForm').addEventListener('submit',e=>{
 e.preventDefault();

 let f=new FormData(e.currentTarget);
 let total=Number(f.get('total'));

 if(total<1)return toast('Total points must be at least 1.');

 data.activities.push({
  id:'a'+Date.now(),
  name:String(f.get('name')).trim(),
  subject:String(f.get('subject')).trim(),
  date:f.get('date'),
  total,
  type:f.get('type'),
  description:String(f.get('description')).trim(),
  created:Date.now()
 });

 save();
 e.currentTarget.reset();
 e.currentTarget.elements.total.value=100;
 e.currentTarget.elements.date.value=today;
 render();
 toast('Activity saved.');
});

// ADD GRADE
$('#gradeForm').addEventListener('submit',e=>{
 e.preventDefault();

 let f=new FormData(e.currentTarget);
 let score=Number(f.get('score'));
 let total=Number(f.get('total'));

 if(!f.get('studentId'))return toast('Add a student first.');
 if(total<=0||score<0||score>total)
  return toast('Check the score and total points.');

 data.grades.push({
  id:'g'+Date.now(),
  sid:f.get('studentId'),
  assessment:String(f.get('assessment')).trim(),
  subject:String(f.get('subject')).trim(),
  period:f.get('period'),
  score,
  total,
  created:Date.now()
 });

 save();
 e.currentTarget.reset();
 render();
 toast('Grade saved.');
});

// BUTTON ACTIONS
document.addEventListener('click',e=>{
 let b=e.target.closest('[data-page]');
 if(b)page(b.dataset.page);

 b=e.target.closest('[data-goto]');
 if(b)page(b.dataset.goto);

 b=e.target.closest('[data-modal]');
 if(b){
  $('#studentForm').reset();
  $('#studentForm').elements.id.value='';
  $('#modalTitle').textContent='Add student';
  modal(true);
 }

 b=e.target.closest('[data-close]');
 if(b)modal(false);

 b=e.target.closest('[data-edit]');
 if(b){
  let s=student(b.dataset.edit);
  let f=$('#studentForm');

  f.elements.id.value=s.id;
  f.elements.name.value=s.name;
  f.elements.code.value=s.code||'';
  f.elements.email.value=s.email||'';
  f.elements.status.value=s.status;

  $('#modalTitle').textContent='Edit student';
  modal(true);
 }

 b=e.target.closest('[data-delete]');
 if(b){
  let s=student(b.dataset.delete);

  if(s&&confirm('Delete '+s.name+' and their grade records?')){
   data.students=data.students.filter(x=>x.id!==s.id);
   data.grades=data.grades.filter(x=>x.sid!==s.id);

   Object.values(data.attendance).forEach(d=>delete d[s.id]);

   save();
   render();
   toast('Student deleted.');
  }
 }

 b=e.target.closest('[data-delact]');
 if(b&&confirm('Delete this activity?')){
  data.activities=data.activities.filter(x=>x.id!==b.dataset.delact);
  save();
  render();
  toast('Activity deleted.');
 }

 b=e.target.closest('[data-delgrade]');
 if(b&&confirm('Delete this grade record?')){
  data.grades=data.grades.filter(x=>x.id!==b.dataset.delgrade);
  save();
  render();
  toast('Grade deleted.');
 }
});

$('#studentModal').addEventListener('click',e=>{
 if(e.target.id==='studentModal')modal(false);
});

// SEARCH
$('#studentSearch').addEventListener('input',renderStudents);

$('#globalSearch').addEventListener('input',e=>{
 page('students');
 $('#studentSearch').value=e.target.value;
 renderStudents();
});

// ATTENDANCE
$('#attendanceDate').value=today;
$('#attendanceDate').addEventListener('change',renderAttendance);

$('#attendanceTable').addEventListener('change',e=>{
 let id=e.target.dataset.att||e.target.dataset.note;
 if(!id)return;

 let d=day();
 d[id]=d[id]||{status:'Absent',note:''};

 if(e.target.dataset.att)d[id].status=e.target.value;
 else d[id].note=e.target.value;

 save();
 renderAttendance();
});

// QUICK ADD
$('#quickAdd').addEventListener('click',()=>{
 $('#studentForm').reset();
 $('#studentForm').elements.id.value='';
 $('#modalTitle').textContent='Add student';
 modal(true);
});

// MOBILE MENU
$('#menu').addEventListener('click',()=>{
 $('#sidebar').classList.toggle('open');
});

// DARK MODE
$('#theme').addEventListener('click',()=>{
 document.body.classList.toggle('dark');
 localStorage.setItem(
  'classflow_dark',
  document.body.classList.contains('dark')?'1':'0'
 );
});

if(localStorage.getItem('classflow_dark')==='1'){
 document.body.classList.add('dark');
}

// DATE AND INITIAL DISPLAY
$('#todayLabel').textContent=
 new Intl.DateTimeFormat(undefined,{
  weekday:'long',month:'long',day:'numeric'
 }).format(new Date()).toUpperCase();

$('#dateDisplay').textContent=
 new Intl.DateTimeFormat(undefined,{
  month:'short',day:'numeric',year:'numeric'
 }).format(new Date());

$('#year').textContent=new Date().getFullYear();

$('#activityForm').elements.date.value=today;

render();

})();

// CLASSFLOW LOGIN FIX 
(function () {
    const screen = document.getElementById("cfLoginScreen");
    const form = document.getElementById("cfLoginForm");

    if (!screen || !form) return;

    const username = document.getElementById("cfUsername");
    const password = document.getElementById("cfPassword");
    const toggle = document.getElementById("cfTogglePassword");
    const error = document.getElementById("cfLoginError");

    // Check login status
    function checkLogin() {
        const loggedIn =
            localStorage.getItem("classflowLoggedIn") === "true";

        screen.classList.toggle("cf-login-hidden", loggedIn);
    }

    checkLogin();

    // Login
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (
            username.value.trim() === "admin" &&
            password.value === "1234"
        ) {
            localStorage.setItem("classflowLoggedIn", "true");

            error.textContent = "";
            screen.classList.add("cf-login-hidden");

            if (typeof window.showToast === "function") {
                window.showToast("Welcome back, Admin!");
            }
        } else {
            error.textContent = "Incorrect username or password.";
        }
    });

    // Show / Hide Password
    toggle.addEventListener("click", function () {
        const show = password.type === "password";
        password.type = show ? "text" : "password";
        toggle.textContent = show ? "HIDE" : "SHOW";
    });

    // Logout
    window.classFlowLogout = function () {
        if (!confirm("Are you sure you want to log out?")) return;

        localStorage.removeItem("classflowLoggedIn");

        form.reset();
        password.type = "password";
        toggle.textContent = "SHOW";

        screen.classList.remove("cf-login-hidden");
    };

})();

// CLASSFLOW LOGOUT BUTTON FIX 

document.addEventListener("DOMContentLoaded", function () {

    const logoutButton = document.getElementById("cfLogoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {

            const confirmLogout = confirm(
                "Are you sure you want to log out?"
            );

            if (confirmLogout) {
                if (typeof window.classFlowLogout === "function") {
                    window.classFlowLogout();
                } else {
                    localStorage.removeItem("classflowLoggedIn");
                    location.reload();
                }
            }

        });
    }

});
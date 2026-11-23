
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const BANK=window.SCRATCH_EXAM_BANK||[];
let timer=null,remaining=1800,active=[],activeKind='set',activeSetId=null,graded=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').toLowerCase().trim().replace(/[.,;:!?()[\]{}]/g,'').replace(/\s+/g,'');
function allQuestions(){return BANK.flatMap(s=>s.questions)}
function bestFor(id){return +(localStorage.getItem(window.hjsStoreKey('jsScratchExamSetBest_'+id))||0)}
function overallBest(){return Math.max(0,...BANK.map(s=>bestFor(s.id)))}
function refreshBest(){
 const b=overallBest();$('examBest').textContent=b?b+'%':'—';
}
function renderSetCards(){
 $('examSetGrid').innerHTML=BANK.map(s=>{
  const score=bestFor(s.id),done=localStorage.getItem(window.hjsStoreKey('jsScratchExamSetDone_'+s.id))==='1';
  return `<article class="exam-set-card"><div class="exam-set-card-top"><span class="exam-set-number">SET ${String(s.id).padStart(2,'0')}</span><span class="exam-status ${done?'completed':''}">${done?'✓ Attempted':'Not attempted'}</span></div><h4>${esc(s.title.replace(/^Set \d+ · /,''))}</h4><p>${esc(s.desc)}</p><div class="exam-set-meta"><span>20 Questions</span><span>100 Marks</span><span>30 min</span></div><div class="exam-set-bottom"><span class="exam-set-score">${done?'Best: '+score+'%':'Build your skills'}</span><button class="set-start-btn" data-set="${s.id}">${done?'Retake exam':'Start exam'} →</button></div></article>`;
 }).join('');
 $('examSetGrid').querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>render('set',+b.dataset.set));
}
function revealExamHub(){
 $('homeHero').hidden=true;$('curriculum').hidden=true;$('lessonView').hidden=true;
 $('practiceHub').hidden=true;$('examHub').hidden=false;
 $('examHub').scrollIntoView({behavior:'smooth',block:'start'});
}
function render(kind,setId){
 clearInterval(timer);remaining=1800;graded=false;activeKind=kind;activeSetId=setId||null;
 if(kind==='set'){
  const selected=BANK.find(s=>s.id===setId);if(!selected)return;
  active=selected.questions; 
 }else if(kind==='quick'){
  const all=allQuestions();active=[];
  for(let i=0;i<15;i++)active.push(all[(i*13+5)%all.length]);
 }else{
  active=allQuestions().filter(q=>q.t==='order').slice(0,12);
 }
 const full=kind==='set', selected=BANK.find(s=>s.id===setId);
 const title=full?selected.title:(kind==='quick'?'Quick Mixed Practice':'Block Order Challenge');
 const subtitle=full?'20 questions · 100 marks · 30-minute timed exam':`${active.length} questions · Practice mode`;
 let out=`<div class="exam-paper"><div class="exam-paper-head"><div><span class="eyebrow">HOUSE OF J&S · SCRATCH 3.0</span><h3>${esc(title)}</h3><p>${subtitle}</p></div><div class="exam-clock" id="examClock">${full?'30:00':'Practice'}</div></div>
 <div class="exam-instructions"><b>Instructions / ဖြေဆိုရန်လမ်းညွှန်</b><br>Choose the best answer, complete the blanks, match the pairs or arrange the Scratch blocks in the correct order. Each question carries 5 marks. Submit to see your score, correct answers and explanations.</div>
 <form id="examForm" autocomplete="off">`;
 active.forEach((q,i)=>{
  out+=`<article class="exam-question" data-question="${i}"><div class="exam-q-title"><span>Q${String(i+1).padStart(2,'0')}</span><b>${esc(q.q)}</b><small>5 marks</small></div>`;
  if(q.t==='mc'){
   out+=q.o.map((o,j)=>`<label class="exam-option"><input type="radio" name="a${i}" value="${j}"><span>${esc(o)}</span></label>`).join('');
  }else if(q.t==='tf'){
   out+=`<label class="exam-option"><input type="radio" name="a${i}" value="true"><span>True / မှန်</span></label><label class="exam-option"><input type="radio" name="a${i}" value="false"><span>False / မှား</span></label>`;
  }else if(q.t==='fill'){
   out+=`<input class="exam-fill" name="a${i}" placeholder="Type your answer here / အဖြေရေးပါ">`;
  }else if(q.t==='order'){
   out+=`<div class="order-hint">Arrange the blocks from first to last / Block အစီအစဉ်မှန် ရွေးပါ</div>`+q.a.map((_,j)=>`<label class="order-row"><b>Position ${j+1}</b><select name="a${i}_${j}"><option value="">Choose a block…</option>${q.o.map((o,k)=>`<option value="${k}">${esc(o)}</option>`).join('')}</select></label>`).join('');
  }else if(q.t==='match'){
   out+=`<div class="order-hint">Match each item on the left with the correct description / ဘယ်ဘက်နှင့် ညာဘက်ကို တွဲပါ</div>`+q.pairs.map((pair,j)=>`<label class="match-row"><b>${esc(pair.l)}</b><select name="a${i}_${j}"><option value="">Choose a match…</option>${q.o.map((o,k)=>`<option value="${k}">${esc(o)}</option>`).join('')}</select></label>`).join('');
  }
  out+='</article>';
 });
 out+=`<div class="exam-submit-row"><button class="primary-btn exam-submit" type="submit">Submit Exam · စာမေးပွဲအပ်နှံမည် →</button><span class="exam-submit-note">You can review every answer after submission.</span></div></form><div id="examResult" aria-live="polite"></div></div>`;
 $('examArea').innerHTML=out;$('examArea').hidden=false;revealExamHub();$('examArea').scrollIntoView({behavior:'smooth',block:'start'});
 if(full){
  timer=setInterval(()=>{
   remaining--;const m=String(Math.floor(remaining/60)).padStart(2,'0'),s=String(remaining%60).padStart(2,'0');
   const c=$('examClock');if(c)c.textContent=m+':'+s;
   if(remaining<=0){clearInterval(timer);grade();}
  },1000);
 }
 $('examForm').onsubmit=e=>{e.preventDefault();grade()};
}
function readAnswer(q,i){
 if(q.t==='mc'){
  const v=document.querySelector(`[name="a${i}"]:checked`);
  return {value:v?+v.value:null,display:v?q.o[+v.value]:'Not answered'};
 }
 if(q.t==='tf'){
  const v=document.querySelector(`[name="a${i}"]:checked`);
  return {value:v?v.value:null,display:v?(v.value==='true'?'True':'False'):'Not answered'};
 }
 if(q.t==='fill'){
  const v=document.querySelector(`[name="a${i}"]`)?.value||'';
  return {value:v,display:v||'Not answered'};
 }
 if(q.t==='order'){
  const vals=q.a.map((_,j)=>document.querySelector(`[name="a${i}_${j}"]`)?.value??'');
  return {value:vals,display:vals.map((v,j)=>v===''?`Position ${j+1}: —`:`${j+1}. ${q.o[+v]}`).join(' → ')};
 }
 if(q.t==='match'){
  const vals=q.pairs.map((_,j)=>document.querySelector(`[name="a${i}_${j}"]`)?.value??'');
  return {value:vals,display:vals.map((v,j)=>`${q.pairs[j].l} → ${v===''?'—':q.o[+v]}`).join('<br>')};
 }
 return {value:null,display:'Not answered'};
}
function correctAnswer(q){
 if(q.t==='mc')return q.o[q.a];
 if(q.t==='tf')return q.a?'True':'False';
 if(q.t==='fill')return q.a.join(' / ');
 if(q.t==='order')return q.a.map(k=>q.o[k]).join(' → ');
 if(q.t==='match')return q.pairs.map(p=>`${p.l} → ${p.r}`).join('<br>');
 return '';
}
function itemCredit(q,ans){
 if(q.t==='order'||q.t==='match'){
  const placed=ans.value.filter((v,j)=>v!==''&&+v===q.a[j]).length;
  return {points:(placed/q.a.length)*5,placed,total:q.a.length};
 }
 const ok=(q.t==='mc'&&ans.value!==null&&ans.value===q.a)||
  (q.t==='tf'&&ans.value!==null&&(ans.value==='true')===q.a)||
  (q.t==='fill'&&q.a.some(v=>norm(v)===norm(ans.value)));
 return {points:ok?5:0,placed:ok?1:0,total:1};
}
function grade(){
 if(graded)return;graded=true;clearInterval(timer);
 const submit=$('examForm')?.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.textContent='Submitted ✓';}
 $('examForm')?.querySelectorAll('input,select').forEach(el=>el.disabled=true);
 let fullCorrect=0,pointsTotal=0,details='';
 active.forEach((q,i)=>{
  const ans=readAnswer(q,i),credit=itemCredit(q,ans),pts=credit.points,ok=pts===5;
  pointsTotal+=pts;if(ok)fullCorrect++;
  const state=ok?'Correct / မှန်':pts>0?'Partially correct / တစ်စိတ်တစ်ပိုင်းမှန်':'Incorrect / ပြန်လေ့လာပါ';
  details+=`<div class="answer-review ${ok?'right':pts>0?'partial':'wrong'}"><div class="review-topline"><b>Q${String(i+1).padStart(2,'0')} · ${state}</b><span>${pts.toFixed(2).replace(/\.00$/,'')} / 5 marks</span></div><p class="review-question">${esc(q.q)}</p><div class="review-response"><b>Your answer / သင့်အဖြေ</b><p>${ans.display==='Not answered'?'Not answered':esc(ans.display).replace(/&lt;br&gt;/g,'<br>')}</p></div><div class="review-correct"><b>Correct answer / အဖြေမှန်</b><p>${esc(correctAnswer(q)).replace(/&lt;br&gt;/g,'<br>')}</p></div><p class="review-explanation">${esc(q.e)}</p></div>`;
 });
 const total=active.length*5,marks=Math.round(pointsTotal*100)/100,pct=Math.round(pointsTotal/total*100);
 const label=pct>=85?'Excellent · အလွန်ကောင်းပါတယ်':pct>=70?'Good progress · တိုးတက်မှုကောင်းပါတယ်':pct>=50?'Keep practising · ဆက်လက်လေ့ကျင့်ပါ':'Review and try again · ပြန်လည်လေ့လာပါ';
 $('examResult').innerHTML=`<div class="exam-result-card"><span class="eyebrow">ASSESSMENT RESULT · ရလဒ်</span><h3>${marks} / ${total} marks</h3><p class="exam-percent">${pct}% · ${label}</p><div class="exam-result-bar"><span style="width:${pct}%"></span></div><div class="exam-result-stats"><span>✓ ${fullCorrect} Fully correct</span><span>✕ ${active.length-fullCorrect} Need review</span><span>${active.length} Questions</span></div><h4>Detailed answer review · အဖြေတစ်ခုချင်းစီ စစ်ဆေးချက်</h4>${details}<div class="result-actions"><button class="secondary-btn" id="retryExam">Retake this exam ↻</button><button class="primary-btn" id="backExamLibrary">Back to exam library</button></div></div>`;
 if(activeKind==='set'&&activeSetId){
  const old=bestFor(activeSetId);if(pct>old)localStorage.setItem(window.hjsStoreKey('jsScratchExamSetBest_'+activeSetId),String(pct));
  localStorage.setItem(window.hjsStoreKey('jsScratchExamSetDone_'+activeSetId),'1');
  const oldAttempts=+(localStorage.getItem(window.hjsStoreKey('jsScratchExamSetAttempts_'+activeSetId))||0);
  localStorage.setItem(window.hjsStoreKey('jsScratchExamSetAttempts_'+activeSetId),String(oldAttempts+1));
 }
 refreshBest();renderSetCards();
 $('retryExam').onclick=()=>render(activeKind,activeSetId);
 $('backExamLibrary').onclick=()=>{$('examArea').hidden=true;$('examSetGrid').scrollIntoView({behavior:'smooth',block:'start'});};
 $('examResult').scrollIntoView({behavior:'smooth',block:'start'});
}
$('viewExams').onclick=()=>{$('examSetGrid').scrollIntoView({behavior:'smooth',block:'start'});};
$('startOrder').onclick=()=>render('order');
$('startQuick').onclick=()=>render('quick');
$('examNav').onclick=()=>revealExamHub();
renderSetCards();refreshBest();
})();

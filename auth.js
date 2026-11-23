(()=>{
'use strict';
const $=id=>document.getElementById(id);
const PASSWORD='HJS2026';
function showPortal(name){
 const clean=(name||'Student').trim();
 $('authGate').hidden=true;$('appShell').classList.add('is-authenticated');
 $('studentNameBadge').textContent=clean;
 $('profileInitial').textContent=(clean[0]||'S').toLocaleUpperCase();
 $('heroWelcome').textContent='WELCOME BACK, '+clean.toLocaleUpperCase();
 document.body.classList.add('portal-open');
}
function showLogin(){
 $('authGate').hidden=false;$('appShell').classList.remove('is-authenticated');
 document.body.classList.remove('portal-open');
}
const storedName=sessionStorage.getItem('hjsStudentName');
if(storedName){showPortal(storedName)}else{showLogin()}
$('studentLoginForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=$('studentNameInput').value.trim();
 const password=$('studentPasswordInput').value;
 const error=$('loginError');
 if(name.length<2){error.textContent='Please enter your student name / ကျောင်းသားအမည် ထည့်ပါ။';$('studentNameInput').focus();return;}
 if(password!==PASSWORD){error.textContent='Incorrect password. Please check and try again. / Password မှားနေပါတယ်။';$('studentPasswordInput').focus();return;}
 sessionStorage.setItem('hjsStudentName',name);
 sessionStorage.setItem('hjsAuthenticated','yes');
 window.location.reload();
});
$('togglePassword').addEventListener('click',()=>{
 const input=$('studentPasswordInput'),show=input.type==='password';
 input.type=show?'text':'password';$('togglePassword').textContent=show?'Hide':'Show';
 $('togglePassword').setAttribute('aria-label',show?'Hide password':'Show password');
});
$('logoutBtn').addEventListener('click',()=>{
 sessionStorage.removeItem('hjsStudentName');sessionStorage.removeItem('hjsAuthenticated');
 window.location.reload();
});
})();

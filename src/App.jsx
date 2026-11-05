import React,{useEffect,useState} from "react";
import {supabase} from "./supabase";
import {ShieldCheck,Users,Wallet,ClipboardList,LogOut,Plus,RefreshCw,Download, Pencil, X} from "lucide-react";

async function api(path,token,options={}) {
 const r=await fetch("/api"+path,{...options,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token,...(options.headers||{})}});
 const j=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(j.error||"Request failed");
 return j;
}
const kes=n=>new Intl.NumberFormat("en-KE",{style:"currency",currency:"KES",maximumFractionDigits:0}).format(Number(n||0));
const blankEmployee={employee_no:"",full_name:"",email:"",department:"",job_title:"",monthly_salary:"",status:"Active"};
function csvCell(value){
 let s=String(value??"");
 if(/^[=+\-@\t\r]/.test(s)) s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
function downloadCSV(filename,headers,rows){
 const csv=[headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n");
 const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

export default function App(){
 const [session,setSession]=useState(null),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [error,setError]=useState(""),[busy,setBusy]=useState(false),[page,setPage]=useState("dashboard");
 const [data,setData]=useState({employees:[],payrollRuns:[],auditLogs:[]});
 const [show,setShow]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState(blankEmployee);
 const [period,setPeriod]=useState(new Date().toISOString().slice(0,7)),[notice,setNotice]=useState("");
 useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session));const {data:l}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));return()=>l.subscription.unsubscribe()},[]);
 async function refresh(){if(!session)return;try{setData(await api("/bootstrap",session.access_token));setError("")}catch(e){setError(e.message)}}
 useEffect(()=>{refresh()},[session]);
 async function login(e){e.preventDefault();setBusy(true);setError("");const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error)setError(error.message);else setSession(data.session)}
 function openAdd(){setEditing(null);setForm(blankEmployee);setShow(true)}
 function openEdit(employee){setEditing(employee);setForm({...blankEmployee,...employee,monthly_salary:String(employee.monthly_salary??"")});setShow(true)}
 async function saveEmployee(e){
  e.preventDefault();setBusy(true);setError("");
  try{
   if(editing) await api("/employees/"+encodeURIComponent(editing.id),session.access_token,{method:"PATCH",body:JSON.stringify(form)});
   else await api("/employees",session.access_token,{method:"POST",body:JSON.stringify(form)});
   setShow(false);setEditing(null);setForm(blankEmployee);await refresh();setNotice(editing?"Employee details updated.":"Employee added.");
  }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 async function payroll(){setBusy(true);try{await api("/payroll",session.access_token,{method:"POST",body:JSON.stringify({period})});await refresh();setNotice("Payroll draft created and saved.")}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function status(id,value){try{await api("/payroll/"+id+"/status",session.access_token,{method:"PATCH",body:JSON.stringify({status:value})});await refresh();setNotice("Payroll status updated.")}catch(e){setError(e.message)}}
 function exportEmployees(){downloadCSV("employees.csv",["Employee number","Full name","Email","Department","Job title","Monthly salary (KES)","Status","Created at"],data.employees.map(e=>[e.employee_no,e.full_name,e.email,e.department,e.job_title,e.monthly_salary,e.status,e.created_at]));}
 function exportPayroll(){downloadCSV("payroll-runs.csv",["Period","Employee count","Gross total (KES)","Status","Created by","Created at"],data.payrollRuns.map(r=>[r.period,r.employee_count,r.gross_total,r.status,r.created_by,r.created_at]));}
 async function logout(){await supabase.auth.signOut();setSession(null)}
 if(!session)return <main className="login"><form className="loginbox" onSubmit={login}><div className="logo"><ShieldCheck size={30}/></div><small>SECURE WORKSPACE</small><h1>Payroll Management<br/> & Audit System</h1><p>Sign in with your Supabase account.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="error">{error}</div>}<button disabled={busy}>{busy?"Signing in…":"Sign in securely"}</button></form></main>;
 const active=data.employees.filter(x=>x.status==="Active");
 return <div className="layout"><aside><div className="brand"><ShieldCheck/> <b>SecurePayroll</b></div><p className="navtitle">WORKSPACE</p>{[["dashboard","Overview"],["employees","Employees"],["payroll","Payroll"],["audit","Audit trail"]].map(([k,v])=><button className={page===k?"nav active":"nav"} onClick={()=>setPage(k)} key={k}>{v}</button>)}<button className="nav logout" onClick={logout}><LogOut size={16}/> Sign out</button></aside><main className="main"><header><div><small>PAYROLL OPERATIONS</small><h2>{{dashboard:"Overview",employees:"Employee directory",payroll:"Payroll processing",audit:"Audit trail"}[page]}</h2></div><button className="refresh" onClick={refresh}><RefreshCw size={17}/></button></header><section className="content">{error&&<div className="error">{error}</div>}{notice&&<div className="notice" onClick={()=>setNotice("")}>{notice} ×</div>}
 {page==="dashboard"&&<><div className="hero"><small>YOUR CONTROL CENTRE</small><h1>Good to see you.</h1><p>Monitor workforce records, payroll activity and compliance events.</p></div><div className="stats"><article><Users/><small>Total employees</small><strong>{data.employees.length}</strong><span>{active.length} active</span></article><article><Wallet/><small>Payroll runs</small><strong>{data.payrollRuns.length}</strong><span>Recorded periods</span></article><article><ClipboardList/><small>Audit events</small><strong>{data.auditLogs.length}</strong><span>Latest activity</span></article></div><Panel title="Recent payroll activity"><PayrollTable runs={data.payrollRuns.slice(0,5)} onStatus={status}/></Panel></>}
 {page==="employees"&&<Panel title="Employee directory" action={<div className="toolbar"><button className="secondary" onClick={exportEmployees} disabled={!data.employees.length}><Download size={16}/> Download CSV</button><button onClick={openAdd}><Plus size={16}/> Add employee</button></div>}><EmployeeTable employees={data.employees} onEdit={openEdit}/></Panel>}
 {page==="payroll"&&<Panel title="Payroll processing" action={<button className="secondary" onClick={exportPayroll} disabled={!data.payrollRuns.length}><Download size={16}/> Download payroll CSV</button>}><div className="create"><label>Payroll period<input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></label><button onClick={payroll} disabled={busy||!active.length}>Create payroll draft</button><span>{active.length} active employees · {kes(active.reduce((s,e)=>s+Number(e.monthly_salary||0),0))}</span></div><PayrollTable runs={data.payrollRuns} onStatus={status}/></Panel>}
 {page==="audit"&&<Panel title="Audit trail"><div className="tablewrap"><table><thead><tr><th>TIME</th><th>ACTOR</th><th>ACTION</th><th>DETAILS</th></tr></thead><tbody>{data.auditLogs.map(x=><tr key={x.id}><td>{new Date(x.created_at).toLocaleString()}</td><td>{x.actor_email}</td><td>{x.action}</td><td>{x.details}</td></tr>)}</tbody></table></div></Panel>}</section></main>
 {show&&<div className="overlay"><form className="modal" onSubmit={saveEmployee}><div className="modalhead"><h2>{editing?"Edit employee":"Add employee"}</h2><button type="button" className="iconbutton secondary" onClick={()=>setShow(false)} aria-label="Close"><X size={18}/></button></div><div className="fields">{[["employee_no","Employee number"],["full_name","Full name"],["email","Email"],["department","Department"],["job_title","Job title"],["monthly_salary","Monthly salary (KES)"]].map(([k,v])=><label key={k}>{v}<input required={["employee_no","full_name","monthly_salary"].includes(k)} type={k==="monthly_salary"?"number":k==="email"?"email":"text"} min={k==="monthly_salary"?"0":undefined} step={k==="monthly_salary"?"0.01":undefined} value={form[k]??""} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Inactive</option></select></label></div><div className="actions"><button type="button" className="secondary" onClick={()=>setShow(false)}>Cancel</button><button disabled={busy}>{busy?(editing?"Saving…":"Adding…"):(editing?"Save changes":"Save employee")}</button></div></form></div>}
 </div>
}
function Panel({title,action,children}){return <article className="panel"><div className="panelhead"><h3>{title}</h3>{action}</div>{children}</article>}
function EmployeeTable({employees,onEdit}){return <div className="tablewrap"><table><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>JOB TITLE</th><th>MONTHLY SALARY</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td><b>{e.full_name}</b><small>{e.employee_no} · {e.email||"—"}</small></td><td>{e.department||"—"}</td><td>{e.job_title||"—"}</td><td>{kes(e.monthly_salary)}</td><td><span className={"status "+String(e.status||"").toLowerCase()}>{e.status}</span></td><td><button className="secondary smallbutton" onClick={()=>onEdit(e)}><Pencil size={14}/> Edit</button></td></tr>)}{!employees.length&&<tr><td colSpan="6">No employees yet.</td></tr>}</tbody></table></div>}
function PayrollTable({runs,onStatus}){return <div className="tablewrap"><table><thead><tr><th>PERIOD</th><th>EMPLOYEES</th><th>GROSS TOTAL</th><th>STATUS</th><th>UPDATE</th></tr></thead><tbody>{runs.map(r=><tr key={r.id}><td>{r.period}</td><td>{r.employee_count}</td><td>{kes(r.gross_total)}</td><td>{r.status}</td><td><select value={r.status} onChange={e=>onStatus(r.id,e.target.value)}><option>Draft</option><option>Approved</option><option>Paid</option><option>Cancelled</option></select></td></tr>)}{!runs.length&&<tr><td colSpan="5">No payroll runs yet.</td></tr>}</tbody></table></div>}

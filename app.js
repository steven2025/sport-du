const STORAGE_KEY="sport_exp_app_v1";

let appData=JSON.parse(localStorage.getItem(STORAGE_KEY))||{
 proposalAuthor:{name:"",className:"",studentId:"",participation:1},
 reportAuthor:{name:"",className:"",studentId:"",participation:1},
 proposal:{formData:{},versions:[]},
 experiment:{metricDefs:[{key:"hr",name:"心率",unit:"bpm"}],weeks:[]},
 analysis:{savedRuns:[]},
 report:{sections:{},resultsBuilder:{}}
};

function saveData(){
 localStorage.setItem(STORAGE_KEY,JSON.stringify(appData));
}

function toast(msg){
 let t=document.getElementById("toast");
 t.innerText=msg;
 t.style.display="block";
 setTimeout(()=>t.style.display="none",2000);
}

document.querySelectorAll(".menu-card").forEach(card=>{
 card.onclick=()=>loadModule(card.dataset.module);
});

function loadModule(name){
 const c=document.getElementById("moduleContainer");
 c.innerHTML="";
 if(name==="proposal") loadProposal();
 if(name==="analysis") loadAnalysis();
 if(name==="report") loadReport();
 if(name==="data") loadDataManager();
 if(name==="learning") loadLearning();
 if(name==="experiment") loadExperiment();
}

/* ========== 学习区 ========== */
function loadLearning(){
 const c=document.getElementById("moduleContainer");
 c.innerHTML=`
 <div class="panel">
 <h3>学习资料（占位腾讯云链接）</h3>
 <button onclick="window.open('https://example.com/sample.pdf')">打开PDF</button>
 <button onclick="window.open('https://example.com/video.mp4')">观看视频</button>
 <button onclick="window.open('https://www.wjx.cn/')">问卷星小测</button>
 </div>`;
}

/* ========== 方案设计器 ========== */
function loadProposal(){
 const c=document.getElementById("moduleContainer");
 c.innerHTML=`
 <div class="panel">
 <h3>方案作者信息</h3>
 姓名<input id="p_name"><br>
 班级<input id="p_class"><br>
 学号<input id="p_id"><br>
 参与度<input type="number" id="p_part" min="0.5" max="1" step="0.05"><br>
 <button onclick="generateProposal()">生成方案书</button>
 </div>
 <div class="panel">
 <textarea id="proposalText"></textarea>
 </div>`;
}

function generateProposal(){
 let name=document.getElementById("p_name").value;
 let cls=document.getElementById("p_class").value;
 let id=document.getElementById("p_id").value;
 let part=parseFloat(document.getElementById("p_part").value);
 if(part<0.5||part>1){toast("参与度必须0.5-1");return;}
 appData.proposalAuthor={name,className:cls,studentId:id,participation:part};
 let text=`实验方案书\n作者:${name} 班级:${cls} 学号:${id} 参与度:${part}\n研究问题：...\n假设：...`;
 document.getElementById("proposalText").value=text;
 appData.proposal.versions.push({version:appData.proposal.versions.length+1,generatedText:text});
 saveData();
 toast("方案生成完成");
}

/* ========== 数据录入 ========== */
function loadExperiment(){
 const c=document.getElementById("moduleContainer");
 c.innerHTML=`<div class="panel">
 <h3>周数据录入</h3>
 周次<input id="weekNo" type="number">
 心率<input id="hrVal">
 <button onclick="saveWeek()">保存</button>
 </div>`;
}

function saveWeek(){
 let w=parseInt(document.getElementById("weekNo").value);
 let hr=parseFloat(document.getElementById("hrVal").value);
 appData.experiment.weeks.push({weekNo:w,measures:{hr}});
 saveData();
 toast("已保存");
}

/* ========== 分析模块 ========== */
function loadAnalysis(){
 const c=document.getElementById("moduleContainer");
 c.innerHTML=`<div class="panel">
 <button onclick="runStats()">描述统计</button>
 <canvas id="chart"></canvas>
 <textarea id="analysisText"></textarea>
 </div>`;
}

function runStats(){
 let arr=appData.experiment.weeks.map(w=>w.measures.hr);
 if(arr.length<2){toast("数据不足");return;}
 let mean=ss.mean(arr);
 let sd=ss.standardDeviation(arr);
 let text=`均值=${mean.toFixed(2)} SD=${sd.toFixed(2)}`;
 document.getElementById("analysisText").value=text;
 new Chart(document.getElementById("chart"),{
  type:"line",
  data:{labels:arr.map((_,i)=>i+1),
   datasets:[{label:"心率",data:arr}]}
 });
 appData.analysis.savedRuns.push({createdAt:new Date(),resultsTextDraft:text});
 saveData();
}

/* ========== 报告模块 ========== */
function loadReport(){
 const c=document.getElementById("moduleContainer");
 c.innerHTML=`
 <div class="panel">
 <h3>报告作者信息</h3>
 姓名<input id="r_name"><br>
 班级<input id="r_class"><br>
 学号<input id="r_id"><br>
 参与度<input type="number" id="r_part" min="0.5" max="1" step="0.05"><br>
 </div>
 <div class="panel">
 <textarea id="reportText"></textarea>
 <button onclick="generateReport()">生成报告</button>
 </div>`;
}

function generateReport(){
 let name=document.getElementById("r_name").value;
 let cls=document.getElementById("r_class").value;
 let id=document.getElementById("r_id").value;
 let part=parseFloat(document.getElementById("r_part").value);
 if(part<0.5||part>1){toast("参与度必须0.5-1");return;}
 appData.reportAuthor={name,className:cls,studentId:id,participation:part};
 let resultText=appData.analysis.savedRuns.length?
  appData.analysis.savedRuns[appData.analysis.savedRuns.length-1].resultsTextDraft:"暂无分析结果";
 let text=`实验报告\n作者:${name} 班级:${cls} 学号:${id} 参与度:${part}\n\n【结果】\n${resultText}`;
 document.getElementById("reportText").value=text;
 saveData();
 toast("报告生成完成");
}

/* ========== 数据管理 ========== */
function loadDataManager(){
 const c=document.getElementById("moduleContainer");
 c.innerHTML=`
 <div class="panel">
 <button onclick="exportJSON()">导出JSON</button>
 <input type="file" onchange="importJSON(event)">
 <button onclick="clearAll()">清空数据</button>
 </div>`;
}

function exportJSON(){
 let blob=new Blob([JSON.stringify(appData,null,2)],{type:"application/json"});
 let a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="backup.json";
 a.click();
}

function importJSON(e){
 let file=e.target.files[0];
 let reader=new FileReader();
 reader.onload=function(){
  appData=JSON.parse(reader.result);
  saveData();
  toast("已导入");
 };
 reader.readAsText(file);
}

function clearAll(){
 if(confirm("确认清空？")){
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
 }
}
let currentUser = null;

/* =========================
   LOGIN SYSTEM
========================= */

function login(){
  currentUser = document.getElementById("user").value;
  log("Logged in: " + currentUser);
}

function registerUser(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  fetch("/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({user,pass})
  }).then(()=>log("Registered"));
}

function save(){
  const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

  fetch("/save",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({user: currentUser, xml})
  });

  log("Saved");
}

function load(){
  fetch("/load/" + currentUser)
  .then(r=>r.json())
  .then(data=>{
    if(!data.xml) return;

    const xml = Blockly.Xml.textToDom(data.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  });

  log("Loaded");
}

/* =========================
   BLOCKLY
========================= */

const workspace = Blockly.inject("blocklyDiv",{
  toolbox: document.getElementById("toolbox")
});

/* =========================
   LUA GENERATION
========================= */

function run(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  document.getElementById("codeOutput").textContent = lua;

  log("Lua generated");
}

function exportLua(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  const blob = new Blob([lua],{type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.lua";
  a.click();

  log("Exported Lua");
}

/* =========================
   LOG
========================= */

function log(msg){
  const c = document.getElementById("console");
  c.innerHTML += msg + "<br>";
}

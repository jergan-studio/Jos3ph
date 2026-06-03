let currentUser = null;

/* =========================
   LOG
========================= */

function log(msg){
  const consoleDiv = document.getElementById("console");
  consoleDiv.innerHTML += msg + "<br>";
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

/* =========================
   AUTH
========================= */

async function registerUser(){

  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch("/register",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({user,pass})
  });

  if(res.ok){
    log("Registered successfully");
  }else{
    log("Registration failed");
  }
}

async function login(){

  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch("/login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({user,pass})
  });

  if(res.ok){
    currentUser = user;
    log("Logged in");
  }else{
    log("Login failed");
  }
}

/* =========================
   BLOCK DEFINITIONS
========================= */

Blockly.defineBlocksWithJsonArray([

{
  "type":"print_text",
  "message0":"print %1",
  "args0":[
    {
      "type":"field_input",
      "name":"TEXT",
      "text":"Hello Luau"
    }
  ],
  "previousStatement":null,
  "nextStatement":null,
  "colour":160
},

{
  "type":"set_var",
  "message0":"set variable %1 to %2",
  "args0":[
    {
      "type":"field_input",
      "name":"NAME",
      "text":"score"
    },
    {
      "type":"field_number",
      "name":"VALUE",
      "value":0
    }
  ],
  "previousStatement":null,
  "nextStatement":null,
  "colour":230
},

{
  "type":"repeat_times",
  "message0":"repeat %1 times %2",
  "args0":[
    {
      "type":"field_number",
      "name":"COUNT",
      "value":5
    },
    {
      "type":"input_statement",
      "name":"DO"
    }
  ],
  "previousStatement":null,
  "nextStatement":null,
  "colour":60
},

{
  "type":"wait_seconds",
  "message0":"wait %1 seconds",
  "args0":[
    {
      "type":"field_number",
      "name":"SECONDS",
      "value":1
    }
  ],
  "previousStatement":null,
  "nextStatement":null,
  "colour":60
}

]);

/* =========================
   WORKSPACE
========================= */

const workspace = Blockly.inject("blocklyDiv",{
  toolbox: document.getElementById("toolbox")
});

/* =========================
   LUAU GENERATOR
========================= */

function blockToLuau(block){

  if(!block) return "";

  switch(block.type){

    case "print_text":
      return `print("${block.getFieldValue("TEXT")}")\n`;

    case "set_var":
      return `local ${block.getFieldValue("NAME")} = ${block.getFieldValue("VALUE")}\n`;

    case "wait_seconds":
      return `task.wait(${block.getFieldValue("SECONDS")})\n`;

    case "repeat_times": {

      const count = block.getFieldValue("COUNT");

      let body = "";
      let child = block.getInputTargetBlock("DO");

      while(child){
        body += blockToLuau(child);
        child = child.getNextBlock();
      }

      return `for i = 1, ${count} do\n${indent(body)}end\n`;
    }

    default:
      return "";
  }
}

function indent(text){
  return text
    .split("\n")
    .filter(line => line.length)
    .map(line => "    " + line)
    .join("\n") + "\n";
}

function generateCode(){

  let code = "";

  const blocks = workspace.getTopBlocks(true);

  for(const block of blocks){
    code += blockToLuau(block);
  }

  document.getElementById("codeOutput").textContent = code;

  return code;
}

workspace.addChangeListener(() => {
  generateCode();
});

/* =========================
   EXPORT
========================= */

function exportLuau(){

  const code = generateCode();

  const blob = new Blob([code],{
    type:"text/plain"
  });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.luau";
  a.click();

  URL.revokeObjectURL(a.href);

  log("Exported .luau file");
}

/* =========================
   SAVE / LOAD
========================= */

async function save(){

  if(!currentUser){
    log("Login first");
    return;
  }

  const xml = Blockly.Xml.domToText(
    Blockly.Xml.workspaceToDom(workspace)
  );

  await fetch("/save",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      user:currentUser,
      xml
    })
  });

  log("Project saved");
}

async function load(){

  if(!currentUser){
    log("Login first");
    return;
  }

  const res = await fetch(`/load/${currentUser}`);
  const data = await res.json();

  if(!data.xml){
    log("No saved project");
    return;
  }

  workspace.clear();

  const xml = Blockly.utils.xml.textToDom(data.xml);

  Blockly.Xml.domToWorkspace(xml, workspace);

  log("Project loaded");
}

/* =========================
   START
========================= */

generateCode();
log("Jos3ph Luau Studio ready");

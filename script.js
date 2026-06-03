let currentUser = null;

/* =========================
   LOG
========================= */

function log(msg){
  const c = document.getElementById("console");
  if(!c) return;
  c.innerHTML += msg + "<br>";
  c.scrollTop = c.scrollHeight;
}

/* =========================
   AUTH (UNCHANGED)
========================= */

async function registerUser(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch("/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user,pass})
  });

  log(res.ok ? "Registered" : "Register failed");
}

async function login(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch("/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user,pass})
  });

  if(res.ok){
    currentUser = user;
    log("Logged in");
  } else {
    log("Login failed");
  }
}

/* =========================
   BLOCK DEFINITIONS (FULL SET)
========================= */

Blockly.defineBlocksWithJsonArray([

/* OUTPUT */
{
  type:"print_text",
  message0:"print %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:160
},

/* VARIABLES */
{
  type:"set_var",
  message0:"set %1 to %2",
  args0:[
    {type:"field_input",name:"NAME",text:"score"},
    {type:"field_number",name:"VALUE",value:0}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:230
},

/* CONTROL */
{
  type:"repeat_times",
  message0:"repeat %1 times %2",
  args0:[
    {type:"field_number",name:"COUNT",value:5},
    {type:"input_statement",name:"DO"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:60
},

{
  type:"if_block",
  message0:"if %1 then %2",
  args0:[
    {type:"field_input",name:"COND",text:"x > 10"},
    {type:"input_statement",name:"DO"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:70
},

/* FUNCTIONS */
{
  type:"function_def",
  message0:"function %1 %2",
  args0:[
    {type:"field_input",name:"NAME",text:"myFunc"},
    {type:"input_statement",name:"BODY"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:290
},

{
  type:"function_call",
  message0:"call %1",
  args0:[{type:"field_input",name:"NAME"}],
  previousStatement:null,
  nextStatement:null,
  colour:290
},

/* PARTS (ROBLOX STYLE) */
{
  type:"create_part",
  message0:"create part %1",
  args0:[{type:"field_input",name:"NAME",text:"Part"}],
  previousStatement:null,
  nextStatement:null,
  colour:200
},

{
  type:"set_color",
  message0:"set color %1",
  args0:[{type:"field_input",name:"COLOR",text:"red"}],
  previousStatement:null,
  nextStatement:null,
  colour:200
},

/* CHAT */
{
  type:"chat_message",
  message0:"chat %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:20
},

/* WAIT */
{
  type:"wait_seconds",
  message0:"wait %1 seconds",
  args0:[{type:"field_number",name:"SECONDS",value:1}],
  previousStatement:null,
  nextStatement:null,
  colour:120
}

]);

/* =========================
   WORKSPACE
========================= */

const workspace = Blockly.inject("blocklyDiv",{
  toolbox: document.getElementById("toolbox")
});

/* =========================
   LUA GENERATOR (FIXED CORE)
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
      let body = "";
      let child = block.getInputTargetBlock("DO");

      while(child){
        body += blockToLuau(child);
        child = child.getNextBlock();
      }

      return `for i = 1, ${block.getFieldValue("COUNT")} do\n${indent(body)}end\n`;
    }

    case "if_block": {
      let body = "";
      let child = block.getInputTargetBlock("DO");

      while(child){
        body += blockToLuau(child);
        child = child.getNextBlock();
      }

      return `if ${block.getFieldValue("COND")} then\n${indent(body)}end\n`;
    }

    case "function_def": {
      let body = "";
      let child = block.getInputTargetBlock("BODY");

      while(child){
        body += blockToLuau(child);
        child = child.getNextBlock();
      }

      return `function ${block.getFieldValue("NAME")}()\n${indent(body)}end\n`;
    }

    case "function_call":
      return `${block.getFieldValue("NAME")}()\n`;

    case "create_part":
      return `local ${block.getFieldValue("NAME")} = Instance.new("Part")\n`;

    case "set_color":
      return `Part.Color = "${block.getFieldValue("COLOR")}"\n`;

    case "chat_message":
      return `print("[CHAT] ${block.getFieldValue("TEXT")}")\n`;

    default:
      return "";
  }
}

/* =========================
   HELPERS
========================= */

function indent(text){
  return text
    .split("\n")
    .filter(l=>l.length)
    .map(l=>"    "+l)
    .join("\n") + "\n";
}

/* =========================
   GENERATE
========================= */

function generateCode(){

  let code = "";

  const blocks = workspace.getTopBlocks(true);

  for(const b of blocks){
    code += blockToLuau(b);
  }

  const out = document.getElementById("codeOutput");
  if(out) out.textContent = code;

  return code;
}

workspace.addChangeListener(generateCode);

/* =========================
   EXPORT
========================= */

function exportLuau(){

  const code = generateCode();

  const blob = new Blob([code],{type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.luau";
  a.click();

  log("Exported Luau");
}

/* =========================
   SAVE / LOAD (UNCHANGED)
========================= */

async function save(){
  if(!currentUser) return log("Login first");

  const xml = Blockly.Xml.domToText(
    Blockly.Xml.workspaceToDom(workspace)
  );

  await fetch("/save",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user:currentUser, xml})
  });

  log("Saved");
}

async function load(){
  if(!currentUser) return log("Login first");

  const res = await fetch(`/load/${currentUser}`);
  const data = await res.json();

  if(!data.xml) return log("No save");

  workspace.clear();
  Blockly.Xml.domToWorkspace(
    Blockly.utils.xml.textToDom(data.xml),
    workspace
  );

  log("Loaded");
}

/* =========================
   START
========================= */

generateCode();
log("Luau Studio v1 Loaded");

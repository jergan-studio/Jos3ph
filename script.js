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
   AUTH
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
   BLOCKLY INIT
========================= */

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox")
});

/* =========================
   PLUGIN ENGINE v2 CORE
========================= */

const Plugins = {};

function registerPlugin(type, fn){
  Plugins[type] = fn;
}

function compileBlock(block){
  if(!block) return "";

  const plugin = Plugins[block.type];

  if(plugin){
    return plugin(block) + "\n";
  }

  return `-- Unknown block: ${block.type}\n`;
}

function indent(text){
  return text
    .split("\n")
    .filter(l => l.trim())
    .map(l => "    " + l)
    .join("\n") + "\n";
}

/* =========================
   COMPILER
========================= */

function compileToLuau(){

  let code = "";

  const blocks = workspace.getTopBlocks(true);

  for(const b of blocks){
    code += compileBlock(b);
  }

  const out = document.getElementById("codeOutput");
  if(out) out.textContent = code;

  return code;
}

workspace.addChangeListener(compileToLuau);

/* =========================
   EXPORT
========================= */

function exportLuau(){

  const code = compileToLuau();

  const blob = new Blob([code], {type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.luau";
  a.click();

  log("Exported Luau");
}

/* =========================
   SAVE / LOAD
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

  if(!data.xml) return log("No project");

  workspace.clear();

  Blockly.Xml.domToWorkspace(
    Blockly.utils.xml.textToDom(data.xml),
    workspace
  );

  log("Loaded");
}

/* =========================
   BLOCK DEFINITIONS
========================= */

Blockly.defineBlocksWithJsonArray([

/* OUTPUT */
{
  type:"print",
  message0:"print %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:160
},

/* VARIABLES */
{
  type:"set_var",
  message0:"set %1 = %2",
  args0:[
    {type:"field_input",name:"NAME",text:"x"},
    {type:"field_number",name:"VALUE",value:0}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:230
},

/* CONTROL */
{
  type:"repeat",
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
  type:"if",
  message0:"if %1 then %2",
  args0:[
    {type:"field_input",name:"COND",text:"x > 5"},
    {type:"input_statement",name:"DO"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:70
},

/* FUNCTIONS */
{
  type:"function",
  message0:"function %1 %2",
  args0:[
    {type:"field_input",name:"NAME",text:"MyFunc"},
    {type:"input_statement",name:"BODY"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:290
},

{
  type:"call",
  message0:"call %1",
  args0:[{type:"field_input",name:"NAME"}],
  previousStatement:null,
  nextStatement:null,
  colour:290
},

/* PARTS */
{
  type:"part_create",
  message0:"create part %1",
  args0:[{type:"field_input",name:"NAME",text:"Part"}],
  previousStatement:null,
  nextStatement:null,
  colour:200
},

/* CHAT */
{
  type:"chat",
  message0:"chat %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:20
},

/* WAIT */
{
  type:"wait",
  message0:"wait %1 sec",
  args0:[{type:"field_number",name:"TIME",value:1}],
  previousStatement:null,
  nextStatement:null,
  colour:120
},

/* EVENTS */
{
  type:"when_clicked",
  message0:"when %1 clicked %2 do",
  args0:[
    {type:"field_input",name:"TARGET",text:"button"},
    {type:"input_statement",name:"DO"}
  ],
  colour:10,
  previousStatement:null,
  nextStatement:null
},

/* UI */
{
  type:"ui_button",
  message0:"create button %1",
  args0:[{type:"field_input",name:"NAME",text:"Button"}],
  previousStatement:null,
  nextStatement:null,
  colour:340
},

{
  type:"ui_text",
  message0:"set UI %1 text %2",
  args0:[
    {type:"field_input",name:"NAME",text:"Button"},
    {type:"field_input",name:"TEXT",text:"Click me"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:340
}

]);

/* =========================
   PLUGINS (LUAU OUTPUT)
========================= */

/* OUTPUT */
registerPlugin("print", b =>
  `print("${b.getFieldValue("TEXT")}")`
);

/* VAR */
registerPlugin("set_var", b =>
  `local ${b.getFieldValue("NAME")} = ${b.getFieldValue("VALUE")}`
);

/* WAIT */
registerPlugin("wait", b =>
  `task.wait(${b.getFieldValue("TIME")})`
);

/* REPEAT */
registerPlugin("repeat", b => {

  let body = "";
  let child = b.getInputTargetBlock("DO");

  while(child){
    body += compileBlock(child);
    child = child.getNextBlock();
  }

  return `for i = 1, ${b.getFieldValue("COUNT")} do
${indent(body)}end`;
});

/* IF */
registerPlugin("if", b => {

  let body = "";
  let child = b.getInputTargetBlock("DO");

  while(child){
    body += compileBlock(child);
    child = child.getNextBlock();
  }

  return `if ${b.getFieldValue("COND")} then
${indent(body)}end`;
});

/* FUNCTION */
registerPlugin("function", b => {

  let body = "";
  let child = b.getInputTargetBlock("BODY");

  while(child){
    body += compileBlock(child);
    child = child.getNextBlock();
  }

  return `function ${b.getFieldValue("NAME")}()
${indent(body)}end`;
});

/* CALL */
registerPlugin("call", b =>
  `${b.getFieldValue("NAME")}()`
);

/* PART */
registerPlugin("part_create", b => {
  const n = b.getFieldValue("NAME");

  return `
local ${n} = Instance.new("Part")
${n}.Parent = workspace
`;
});

/* CHAT */
registerPlugin("chat", b =>
  `print("[CHAT] ${b.getFieldValue("TEXT")}")`
);

/* EVENT */
registerPlugin("when_clicked", b => {

  let body = "";
  let child = b.getInputTargetBlock("DO");

  while(child){
    body += compileBlock(child);
    child = child.getNextBlock();
  }

  return `
-- click event (${b.getFieldValue("TARGET")})
${b.getFieldValue("TARGET")}.MouseButton1Click:Connect(function()
${indent(body)}
end)
`;
});

/* UI */
registerPlugin("ui_button", b => {

  const n = b.getFieldValue("NAME");

  return `
local ${n} = Instance.new("TextButton")
${n}.Parent = game.Players.LocalPlayer.PlayerGui
${n}.Text = "${n}"
`;
});

registerPlugin("ui_text", b => {

  const n = b.getFieldValue("NAME");
  const t = b.getFieldValue("TEXT");

  return `
${n}.Text = "${t}"
`;
});

/* =========================
   START
========================= */

compileToLuau();
log("Luau Plugin Engine v2 FULL loaded");

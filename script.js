let currentUser = null;

/* =========================
   LOG SYSTEM
========================= */

function log(msg){
  const c = document.getElementById("console");
  if(!c) return;
  c.innerHTML += msg + "<br>";
}

/* =========================
   WORKSPACE
========================= */

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox")
});

/* =========================
   PLUGIN REGISTRY (CORE OF ENGINE)
========================= */

const Plugins = {};

/* register plugin helper */
function registerPlugin(type, handler){
  Plugins[type] = handler;
}

/* =========================
   DEFAULT LUA OUTPUT BUFFER
========================= */

function compileToLuau(){
  let code = "";

  const blocks = workspace.getTopBlocks(true);

  for(const block of blocks){
    code += compileBlock(block);
  }

  document.getElementById("codeOutput").textContent = code;

  return code;
}

/* =========================
   BLOCK COMPILER
========================= */

function compileBlock(block){

  if(!block) return "";

  const plugin = Plugins[block.type];

  if(plugin){
    return plugin(block) + "\n";
  }

  return `-- Unknown block: ${block.type}\n`;
}

/* =========================
   LIVE UPDATE
========================= */

workspace.addChangeListener(() => {
  compileToLuau();
});

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
   SAVE / LOAD (basic)
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

{
  type:"print",
  message0:"print %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:160
},

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

{
  type:"part_create",
  message0:"create part %1",
  args0:[{type:"field_input",name:"NAME",text:"Part"}],
  previousStatement:null,
  nextStatement:null,
  colour:200
},

{
  type:"chat",
  message0:"chat %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:20
},

{
  type:"wait",
  message0:"wait %1 sec",
  args0:[{type:"field_number",name:"TIME",value:1}],
  previousStatement:null,
  nextStatement:null,
  colour:120
}

]);

/* =========================
   PLUGINS (THIS IS THE ENGINE POWER)
========================= */

/* OUTPUT */
registerPlugin("print", b =>
  `print("${b.getFieldValue("TEXT")}")`
);

/* VARIABLES */
registerPlugin("set_var", b =>
  `local ${b.getFieldValue("NAME")} = ${b.getFieldValue("VALUE")}`
);

/* WAIT */
registerPlugin("wait", b =>
  `task.wait(${b.getFieldValue("TIME")})`
);

/* REPEAT (IMPORTANT: child traversal) */
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
  const name = b.getFieldValue("NAME");

  return `
local ${name} = Instance.new("Part")
${name}.Parent = workspace
`;
});

/* CHAT */
registerPlugin("chat", b =>
  `print("[CHAT] ${b.getFieldValue("TEXT")}")`
);

/* =========================
   HELPERS
========================= */

function indent(text){
  return text
    .split("\n")
    .filter(l => l.trim())
    .map(l => "    " + l)
    .join("\n") + "\n";
}

/* =========================
   START
========================= */

compileToLuau();
log("Luau Plugin Engine v2 loaded");

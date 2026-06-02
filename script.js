let currentUser = null;

function log(msg){
  const c = document.getElementById("console");
  if(c){
    c.innerHTML += msg + "<br>";
  }
}

/* =========================
   BLOCKLY SETUP
========================= */

const workspace = Blockly.inject("blocklyDiv",{
  toolbox: document.getElementById("toolbox")
});

/* =========================
   SIMPLE STATE (FOR PREVIEW ONLY)
========================= */

let sprites = {};
let currentSprite = null;

/* =========================
   LUA OUTPUT BOX (you need a div)
   id="codeOutput"
========================= */

function updateLuaPreview(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  const out = document.getElementById("codeOutput");
  if(out){
    out.textContent = lua;
  }
}

/* =========================
   BLOCK DEFINITIONS (SIMPLE)
========================= */

Blockly.defineBlocksWithJsonArray([

{
  type:"create_sprite",
  message0:"create sprite %1",
  args0:[{type:"field_input",name:"NAME",text:"player"}],
  previousStatement:null,
  nextStatement:null,
  colour:160
},

{
  type:"move",
  message0:"move %1 steps",
  args0:[{type:"field_number",name:"STEPS",value:10}],
  previousStatement:null,
  nextStatement:null,
  colour:210
},

{
  type:"say",
  message0:"say %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:0
}

]);

/* =========================
   LUA GENERATORS (THIS IS THE KEY)
========================= */

Blockly.Lua = Blockly.Lua || {};
Blockly.Lua.forBlock = {};

/* create sprite */
Blockly.Lua.forBlock.create_sprite = b=>{
  const name = b.getFieldValue("NAME");
  return `local ${name} = {x = 0, y = 0}\n`;
};

/* move */
Blockly.Lua.forBlock.move = b=>{
  return `x = x + ${b.getFieldValue("STEPS")}\n`;
};

/* say */
Blockly.Lua.forBlock.say = b=>{
  return `print("${b.getFieldValue("TEXT")}")\n`;
};

/* =========================
   LIVE UPDATE (IMPORTANT)
========================= */

workspace.addChangeListener(() => {
  updateLuaPreview();
});

/* =========================
   EXPORT FUNCTIONS
========================= */

function exportLua(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  const blob = new Blob([lua], {type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.lua";
  a.click();

  log("Lua exported");
}

function exportLuau(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  const blob = new Blob([lua], {type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.luau";
  a.click();

  log("Luau exported");
}

/* =========================
   RUN (NOT ENGINE — JUST PRINT)
========================= */

function run(){
  const lua = Blockly.Lua.workspaceToCode(workspace);
  console.log(lua);
  log("Lua generated (check console)");
}

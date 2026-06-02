let currentUser = null;

/* =========================
   LOG
========================= */

function log(msg){
  const c = document.getElementById("console");
  if(c){
    c.innerHTML += msg + "<br>";
  }
}

/* =========================
   LOGIN (OPTIONAL)
========================= */

function login(){
  currentUser = document.getElementById("user").value;
  log("Logged in: " + currentUser);
}

/* =========================
   BLOCKLY WORKSPACE
========================= */

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox")
});

/* =========================
   🔥 CRITICAL FIX: LUA GENERATOR SETUP
   (THIS WAS YOUR MAIN BUG)
========================= */

Blockly.Lua = Blockly.Lua || {};
Blockly.Lua.forBlock = {};

/* =========================
   BLOCK DEFINITIONS (SAFE)
========================= */

Blockly.defineBlocksWithJsonArray([

{
  type: "print_text",
  message0: "print %1",
  args0: [
    { type: "field_input", name: "TEXT", text: "hello" }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 160
},

{
  type: "set_var",
  message0: "set %1 to %2",
  args0: [
    { type: "field_input", name: "NAME", text: "x" },
    { type: "field_number", name: "VALUE", value: 0 }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 230
},

{
  type: "move",
  message0: "move %1",
  args0: [
    { type: "field_number", name: "STEP", value: 10 }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 210
}

]);

/* =========================
   🔥 LUA GENERATORS (THIS FIXES BLOCKS)
========================= */

Blockly.Lua.forBlock.print_text = function(block){
  const text = block.getFieldValue("TEXT");
  return `print("${text}")\n`;
};

Blockly.Lua.forBlock.set_var = function(block){
  const name = block.getFieldValue("NAME");
  const value = block.getFieldValue("VALUE");
  return `${name} = ${value}\n`;
};

Blockly.Lua.forBlock.move = function(block){
  const step = block.getFieldValue("STEP");
  return `x = (x or 0) + ${step}\n`;
};

/* =========================
   LIVE CODE OUTPUT
========================= */

workspace.addChangeListener(() => {
  const lua = Blockly.Lua.workspaceToCode(workspace);

  const out = document.getElementById("codeOutput");
  if(out){
    out.textContent = lua;
  }
});

/* =========================
   RUN (JUST GENERATE)
========================= */

function run(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  log("Lua generated:");
  log(lua);
}

/* =========================
   EXPORT LUA
========================= */

function exportLua(){
  const lua = Blockly.Lua.workspaceToCode(workspace);

  const blob = new Blob([lua], {type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "script.lua";
  a.click();

  log("Exported Lua file");
}

/* =========================
   INIT SAFE STATE
========================= */

log("Lua Studio loaded");

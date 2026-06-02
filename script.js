let currentUser = null;

/* =========================
   LOG SYSTEM
========================= */

function log(msg){
  const c = document.getElementById("console");
  c.innerHTML += msg + "<br>";
  c.scrollTop = c.scrollHeight;
}

function login(){
  currentUser = document.getElementById("user").value;
  log("Logged in: " + currentUser);
}

/* =========================
   ENGINE STATE
========================= */

let sprites = {};
let currentSprite = null;
let variables = {};
let functions = {};
let runningIntervals = [];

/* =========================
   CANVAS
========================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function draw(){
  ctx.clearRect(0,0,300,300);

  for(let s in sprites){
    const sp = sprites[s];
    if(!sp) continue;

    ctx.save();
    ctx.translate(sp.x+15, sp.y+15);
    ctx.rotate((sp.rot||0)*Math.PI/180);

    ctx.fillStyle = sp.color || "#ff8800";
    ctx.fillRect(-15,-15,30,30);

    ctx.restore();
  }
}

/* =========================
   BLOCKLY INIT
========================= */

const workspace = Blockly.inject("blocklyDiv",{
  toolbox: document.getElementById("toolbox")
});

/* =========================
   LUA / LUAU EXPORT
========================= */

function toLua(){
  let lua = "-- Exported from Jos3ph Studio\n\n";

  lua += "-- Sprites\n";
  for (let s in sprites){
    const sp = sprites[s];
    lua += `local ${s} = {x=${sp.x}, y=${sp.y}, rot=${sp.rot||0}, color="${sp.color}"}\n`;
  }

  lua += "\n-- Variables\n";
  for (let v in variables){
    lua += `${v} = ${variables[v]}\n`;
  }

  lua += `

-- Basic update loop (Luau-style pseudo)
function update()
  print("update running")
end
`;

  return lua;
}

/* =========================
   SHARE
========================= */

function share(){
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  const data = {
    javascript: code,
    lua: toLua(),
    sprites,
    variables
  };

  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  log("Shared project (copied to clipboard)");
}

/* =========================
   LUA DOWNLOAD
========================= */

function exportLuaFile(){
  const lua = toLua();

  const blob = new Blob([lua], {type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "project.lua";
  a.click();

  log("Lua file downloaded");
}

/* =========================
   BLOCKLY GENERATORS (SAFE)
========================= */

Blockly.JavaScript.forBlock.add_sprite = b=>{
  const n=b.getFieldValue("NAME");

  return `
sprites["${n}"] = {x:100,y:100,color:"#ff8800",rot:0};
currentSprite="${n}";
draw();
`;
};

Blockly.JavaScript.forBlock.delete_sprite =
  b=>`delete sprites["${b.getFieldValue("NAME")}"]; draw();`;

Blockly.JavaScript.forBlock.select_sprite =
  b=>`currentSprite="${b.getFieldValue("SPRITE")}";`;

Blockly.JavaScript.forBlock.move = b=>
`if(currentSprite && sprites[currentSprite]){
  sprites[currentSprite].x += ${b.getFieldValue("STEPS")};
  draw();
}`;

Blockly.JavaScript.forBlock.set_color = b=>
`if(currentSprite && sprites[currentSprite]){
  sprites[currentSprite].color="${b.getFieldValue("COLOR")}";
  draw();
}`;

Blockly.JavaScript.forBlock.spin = b=>
`if(currentSprite && sprites[currentSprite]){
  sprites[currentSprite].rot += ${b.getFieldValue("DEG")};
  draw();
}`;

/* VARIABLES */
Blockly.JavaScript.forBlock.set_var =
  b=>`variables["${b.getFieldValue("NAME")}"]=${b.getFieldValue("VALUE")};`;

Blockly.JavaScript.forBlock.change_var =
  b=>`variables["${b.getFieldValue("NAME")}"]=(variables["${b.getFieldValue("NAME")}"]||0)+${b.getFieldValue("VALUE")};`;

Blockly.JavaScript.forBlock.get_var =
  b=>[`variables["${b.getFieldValue("NAME")}"]||0`,0];

/* FUNCTIONS */
Blockly.JavaScript.forBlock.function_def = b=>{
  const n=b.getFieldValue("NAME");
  const body=Blockly.JavaScript.statementToCode(b,"BODY");

  return `
function ${n}(){
  ${body}
}
`;
};

Blockly.JavaScript.forBlock.function_call =
  b=>`${b.getFieldValue("NAME")}();`;

/* LOOPS */
Blockly.JavaScript.forBlock.repeat = b=>{
  const code=Blockly.JavaScript.statementToCode(b,"DO");

  return `
for(let i=0;i<${b.getFieldValue("COUNT")};i++){
  ${code}
  draw();
}
`;
};

/* SAFE FOREVER (NO FREEZE) */
Blockly.JavaScript.forBlock.forever = b=>{
  const code=Blockly.JavaScript.statementToCode(b,"DO");

  return `
runningIntervals.push(setInterval(() => {
  ${code}
  draw();
}, 16));
`;
};

/* SOUND */
let audioCtx = null;

Blockly.JavaScript.forBlock.play_sound = ()=>`
if(!audioCtx) audioCtx = new AudioContext();
const o = audioCtx.createOscillator();
o.connect(audioCtx.destination);
o.start();
o.stop(audioCtx.currentTime + 0.2);
`;

/* =========================
   RUN ENGINE (STABLE)
========================= */

function run(){

  // STOP OLD LOOPS
  runningIntervals.forEach(id => clearInterval(id));
  runningIntervals = [];

  // RESET ENGINE
  sprites = {};
  currentSprite = null;

  draw();

  try {
    const code = Blockly.JavaScript.workspaceToCode(workspace);

    const fn = new Function(code);
    fn();

    log("Run successful");

  } catch(e){
    log("Error: " + e.message);
  }
}

/* =========================
   INIT
========================= */

draw();

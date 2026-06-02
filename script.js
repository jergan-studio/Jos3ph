let currentUser = null;

/* =========================
   LOG
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

/* =========================
   RUNTIME LOOP (SCRATCH STYLE)
========================= */

let running = false;

function startEngine(){
  if(running) return;
  running = true;

  function tick(){
    if(!running) return;

    draw();
    requestAnimationFrame(tick);
  }

  tick();
}

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
   BLOCKLY INIT (IMPORTANT FIX)
========================= */

const workspace = Blockly.inject("blocklyDiv",{
  toolbox: document.getElementById("toolbox")
});

/* =========================
   BLOCKS (SAFE + REAL)
========================= */

Blockly.defineBlocksWithJsonArray([

{
  type:"add_sprite",
  message0:"add sprite %1",
  args0:[{type:"field_input",name:"NAME",text:"sprite1"}],
  previousStatement:null,
  nextStatement:null,
  colour:210
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
  type:"set_color",
  message0:"set color %1",
  args0:[{type:"field_colour",name:"COLOR",colour:"#ff8800"}],
  previousStatement:null,
  nextStatement:null,
  colour:210
},

{
  type:"spin",
  message0:"spin %1 degrees",
  args0:[{type:"field_number",name:"DEG",value:15}],
  previousStatement:null,
  nextStatement:null,
  colour:210
},

{
  type:"set_var",
  message0:"set %1 to %2",
  args0:[
    {type:"field_input",name:"NAME"},
    {type:"field_number",name:"VALUE",value:0}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:330
},

{
  type:"change_var",
  message0:"change %1 by %2",
  args0:[
    {type:"field_input",name:"NAME"},
    {type:"field_number",name:"VALUE",value:1}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:330
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
  type:"play_sound",
  message0:"play sound",
  previousStatement:null,
  nextStatement:null,
  colour:290
}

]);

/* =========================
   GENERATORS (FIXED CORE)
========================= */

Blockly.JavaScript.forBlock.add_sprite = b=>{
  const n = b.getFieldValue("NAME");

  return `
sprites["${n}"] = {x:100,y:100,color:"#ff8800",rot:0};
currentSprite="${n}";
`;
};

Blockly.JavaScript.forBlock.move = b=>`
if(currentSprite && sprites[currentSprite]){
  sprites[currentSprite].x += ${b.getFieldValue("STEPS")};
}
`;

Blockly.JavaScript.forBlock.set_color = b=>`
if(currentSprite && sprites[currentSprite]){
  sprites[currentSprite].color="${b.getFieldValue("COLOR")}";
}
`;

Blockly.JavaScript.forBlock.spin = b=>`
if(currentSprite && sprites[currentSprite]){
  sprites[currentSprite].rot += ${b.getFieldValue("DEG")};
}
`;

Blockly.JavaScript.forBlock.set_var = b=>`
variables["${b.getFieldValue("NAME")}"] = ${b.getFieldValue("VALUE")};
`;

Blockly.JavaScript.forBlock.change_var = b=>`
variables["${b.getFieldValue("NAME")}"] =
  (variables["${b.getFieldValue("NAME")}"] || 0) + ${b.getFieldValue("VALUE")};
`;

Blockly.JavaScript.forBlock.repeat = b=>{
  const code = Blockly.JavaScript.statementToCode(b,"DO");

  return `
for(let i=0;i<${b.getFieldValue("COUNT")};i++){
  ${code}
}
`;
};

/* SOUND SAFE */
Blockly.JavaScript.forBlock.play_sound = ()=>`
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const o = ctx.createOscillator();
o.connect(ctx.destination);
o.start();
o.stop(ctx.currentTime + 0.1);
`;

/* =========================
   RUN (FIXED CORE SYSTEM)
========================= */

function run(){

  try {
    sprites = {};
    currentSprite = null;

    const code = Blockly.JavaScript.workspaceToCode(workspace);

    // SAFE EXECUTION (NO STACKING, NO INTERVAL BUGS)
    const fn = new Function(code);
    fn();

    startEngine();

    log("Run successful");

  } catch(e){
    log("Error: " + e.message);
  }
}

/* =========================
   INIT
========================= */

draw();

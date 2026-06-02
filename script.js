let currentUser = null;

/* =========================
   CONSOLE
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

/* =========================
   CANVAS
========================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function draw(){
  ctx.clearRect(0,0,300,300);

  for(let name in sprites){
    const s = sprites[name];
    if(!s) continue;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate((s.rot||0) * Math.PI/180);

    ctx.fillStyle = s.color || "#ff8800";
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
   🧩 BLOCKS (MORE + CLEAN)
========================= */

Blockly.defineBlocksWithJsonArray([

/* SPRITES */
{
  type:"add_sprite",
  message0:"create sprite %1",
  args0:[{type:"field_input",name:"NAME",text:"player"}],
  previousStatement:null,
  nextStatement:null,
  colour:210
},

{
  type:"set_sprite",
  message0:"select sprite %1",
  args0:[{type:"field_input",name:"NAME",text:"player"}],
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
  type:"turn",
  message0:"turn %1 degrees",
  args0:[{type:"field_number",name:"DEG",value:15}],
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

/* VARIABLES */
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

/* LOOK */
{
  type:"say",
  message0:"say %1",
  args0:[{type:"field_input",name:"TEXT",text:"hello"}],
  previousStatement:null,
  nextStatement:null,
  colour:0
},

/* SOUND */
{
  type:"play_sound",
  message0:"play sound",
  previousStatement:null,
  nextStatement:null,
  colour:290
}

]);

/* =========================
   🧠 GENERATORS (SAFE + SIMPLE)
========================= */

Blockly.JavaScript.forBlock.add_sprite = b=>{
  const n = b.getFieldValue("NAME");

  return `
sprites["${n}"] = {x:150,y:150,rot:0,color:"#ff8800"};
currentSprite="${n}";
draw();
`;
};

Blockly.JavaScript.forBlock.set_sprite = b=>`
currentSprite="${b.getFieldValue("NAME")}";
`;

Blockly.JavaScript.forBlock.move = b=>`
if(sprites[currentSprite]){
  sprites[currentSprite].x += ${b.getFieldValue("STEPS")};
  draw();
}
`;

Blockly.JavaScript.forBlock.turn = b=>`
if(sprites[currentSprite]){
  sprites[currentSprite].rot += ${b.getFieldValue("DEG")};
  draw();
}
`;

Blockly.JavaScript.forBlock.set_color = b=>`
if(sprites[currentSprite]){
  sprites[currentSprite].color="${b.getFieldValue("COLOR")}";
  draw();
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
draw();
`;
};

Blockly.JavaScript.forBlock.say = b=>`
log("${b.getFieldValue("TEXT")}");
`;

Blockly.JavaScript.forBlock.play_sound = ()=>`
const a = new (window.AudioContext || window.webkitAudioContext)();
const o = a.createOscillator();
o.connect(a.destination);
o.start();
o.stop(a.currentTime + 0.1);
`;

/* =========================
   🚀 RUN SYSTEM (STABLE)
========================= */

function run(){
  try {
    const code = Blockly.JavaScript.workspaceToCode(workspace);

    sprites = {};
    currentSprite = null;

    const fn = new Function(code);
    fn();

    draw();

    log("Run OK");

  } catch(e){
    log("Error: " + e.message);
  }
}

/* =========================
   INIT
========================= */

draw();

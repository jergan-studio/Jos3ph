let currentUser = null;

function log(msg) {
  const c = document.getElementById("console");
  c.innerHTML += msg + "<br>";
  c.scrollTop = c.scrollHeight;
}

function login() {
  currentUser = document.getElementById("user").value;
  log("Logged in as " + currentUser);
}

/* =========================
   ENGINE STATE
========================= */

let sprites = {};
let currentSprite = null;
let variables = {};
let functions = {};
let extensions = {};

/* =========================
   DRAW ENGINE
========================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function draw() {
  ctx.clearRect(0, 0, 300, 300);

  for (let s in sprites) {
    const sp = sprites[s];

    ctx.save();
    ctx.translate(sp.x + 15, sp.y + 15);
    ctx.rotate((sp.rot || 0) * Math.PI / 180);

    ctx.fillStyle = sp.color;
    ctx.fillRect(-15, -15, 30, 30);

    ctx.restore();
  }
}

/* =========================
   BLOCKLY INIT
========================= */

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox")
});

/* =========================
   RUN ENGINE
========================= */

async function run() {
  await eval(`(async()=>{${Blockly.JavaScript.workspaceToCode(workspace)}})()`);
}

/* =========================
   SPRITES
========================= */

Blockly.defineBlocksWithJsonArray([
{
  type:"add_sprite",
  message0:"add sprite %1",
  args0:[{type:"field_input",name:"NAME",text:"sprite1"}],
  previousStatement:null,
  nextStatement:null,
  colour:210
}]);

Blockly.JavaScript.forBlock.add_sprite = b => {
  const n = b.getFieldValue("NAME");
  return `
sprites["${n}"]={x:100,y:100,color:"#ff8800",rot:0};
currentSprite="${n}";
draw();
`;
};

Blockly.defineBlocksWithJsonArray([{
  type:"delete_sprite",
  message0:"delete sprite %1",
  args0:[{type:"field_input",name:"NAME",text:"sprite1"}],
  previousStatement:null,
  nextStatement:null,
  colour:210
}]);

Blockly.JavaScript.forBlock.delete_sprite = b =>
  `delete sprites["${b.getFieldValue("NAME")}"]; draw();`;

Blockly.defineBlocksWithJsonArray([{
  type:"select_sprite",
  message0:"select sprite %1",
  args0:[{
    type:"field_dropdown",
    name:"SPRITE",
    options:[["cat","cat"],["box","box"]]
  }],
  previousStatement:null,
  nextStatement:null,
  colour:210
}]);

Blockly.JavaScript.forBlock.select_sprite = b =>
  `currentSprite="${b.getFieldValue("SPRITE")}";`;

/* MOVE */
Blockly.defineBlocksWithJsonArray([{
  type:"move",
  message0:"move %1 steps",
  args0:[{type:"field_number",name:"STEPS",value:10}],
  previousStatement:null,
  nextStatement:null,
  colour:210
}]);

Blockly.JavaScript.forBlock.move =
  b => `sprites[currentSprite].x+=${b.getFieldValue("STEPS")};draw();`;

/* COLOR */
Blockly.defineBlocksWithJsonArray([{
  type:"set_color",
  message0:"set color %1",
  args0:[{type:"field_colour",name:"COLOR",colour:"#ff8800"}],
  previousStatement:null,
  nextStatement:null,
  colour:210
}]);

Blockly.JavaScript.forBlock.set_color =
  b => `sprites[currentSprite].color="${b.getFieldValue("COLOR")}";draw();`;

/* SPIN */
Blockly.defineBlocksWithJsonArray([{
  type:"spin",
  message0:"spin %1",
  args0:[{type:"field_number",name:"DEG",value:15}],
  previousStatement:null,
  nextStatement:null,
  colour:120
}]);

Blockly.JavaScript.forBlock.spin =
  b => `sprites[currentSprite].rot+=${b.getFieldValue("DEG")};draw();`;

/* =========================
   VARIABLES
========================= */

Blockly.defineBlocksWithJsonArray([
{
  type:"set_var",
  message0:"set %1 to %2",
  args0:[
    {type:"field_input",name:"NAME",text:"score"},
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
  type:"get_var",
  message0:"%1",
  args0:[{type:"field_input",name:"NAME"}],
  output:"Number",
  colour:330
}
]);

Blockly.JavaScript.forBlock.set_var =
  b => `variables["${b.getFieldValue("NAME")}"]=${b.getFieldValue("VALUE")};`;

Blockly.JavaScript.forBlock.change_var =
  b => `variables["${b.getFieldValue("NAME")}"]=(variables["${b.getFieldValue("NAME")}"]||0)+${b.getFieldValue("VALUE")};`;

Blockly.JavaScript.forBlock.get_var =
  b => [`variables["${b.getFieldValue("NAME")}"]||0`,0];

/* =========================
   FUNCTIONS
========================= */

Blockly.defineBlocksWithJsonArray([
{
  type:"function_def",
  message0:"function %1 %2",
  args0:[
    {type:"field_input",name:"NAME",text:"myFunc"},
    {type:"input_statement",name:"BODY"}
  ],
  colour:200
},
{
  type:"function_call",
  message0:"call %1",
  args0:[{type:"field_input",name:"NAME"}],
  previousStatement:null,
  nextStatement:null,
  colour:200
}
]);

Blockly.JavaScript.forBlock.function_def = b => {
  const n = b.getFieldValue("NAME");
  const body = Blockly.JavaScript.statementToCode(b,"BODY");
  functions[n]=body;
  return `function ${n}(){${body}}`;
};

Blockly.JavaScript.forBlock.function_call =
  b => `${b.getFieldValue("NAME")}();`;

/* =========================
   LOOPS
========================= */

Blockly.defineBlocksWithJsonArray([
{
  type:"repeat",
  message0:"repeat %1",
  args0:[
    {type:"field_number",name:"COUNT",value:5},
    {type:"input_statement",name:"DO"}
  ],
  previousStatement:null,
  nextStatement:null,
  colour:60
}
]);

Blockly.JavaScript.forBlock.repeat = b => {
  const code = Blockly.JavaScript.statementToCode(b,"DO");
  return `for(let i=0;i<${b.getFieldValue("COUNT")};i++){${code}}`;
};

Blockly.defineBlocksWithJsonArray([
{
  type:"forever",
  message0:"forever %1",
  args0:[{type:"input_statement",name:"DO"}],
  previousStatement:null,
  nextStatement:null,
  colour:60
}
]);

Blockly.JavaScript.forBlock.forever = b => {
  const code = Blockly.JavaScript.statementToCode(b,"DO");
  return `while(true){${code} await new Promise(r=>setTimeout(r,0));}`;
};

/* =========================
   SOUND
========================= */

Blockly.defineBlocksWithJsonArray([{
  type:"play_sound",
  message0:"play sound",
  previousStatement:null,
  nextStatement:null,
  colour:290
}]);

Blockly.JavaScript.forBlock.play_sound =
  () => `
const a=new AudioContext();
const o=a.createOscillator();
o.connect(a.destination);
o.start();
o.stop(a.currentTime+0.2);
`;

/* =========================
   SAVE / SHARE
========================= */

function saveCloud(){
  if(!currentUser) return log("login first");
  const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  localStorage.setItem("jos3ph_"+currentUser, xml);
  log("saved");
}

function share(){
  const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  navigator.clipboard.writeText(location.origin+"?p="+btoa(xml));
  log("share copied");
}

function exportJS(){
  log(Blockly.JavaScript.workspaceToCode(workspace));
}

/* LOAD SHARE */
const p = new URLSearchParams(location.search).get("p");
if(p){
  Blockly.Xml.domToWorkspace(
    Blockly.Xml.textToDom(atob(p)),
    workspace
  );
}

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

/* DRAW ENGINE */
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
   BLOCK DEFINITIONS
========================= */

/* ADD SPRITE */
Blockly.defineBlocksWithJsonArray([
{
  type: "add_sprite",
  message0: "add sprite %1",
  args0: [{ type: "field_input", name: "NAME", text: "sprite1" }],
  previousStatement: null,
  nextStatement: null,
  colour: 210
}]);

Blockly.JavaScript.forBlock.add_sprite = b => {
  const name = b.getFieldValue("NAME");

  return `
sprites["${name}"] = {x:100,y:100,color:"#ff8800",rot:0};
currentSprite="${name}";
draw();
`;
};

/* DELETE SPRITE */
Blockly.defineBlocksWithJsonArray([
{
  type: "delete_sprite",
  message0: "delete sprite %1",
  args0: [{ type: "field_input", name: "NAME", text: "sprite1" }],
  previousStatement: null,
  nextStatement: null,
  colour: 210
}]);

Blockly.JavaScript.forBlock.delete_sprite = b => {
  const name = b.getFieldValue("NAME");
  return `
delete sprites["${name}"];
draw();
`;
};

/* SELECT SPRITE */
Blockly.defineBlocksWithJsonArray([{
  type: "select_sprite",
  message0: "select sprite %1",
  args0: [{
    type: "field_dropdown",
    name: "SPRITE",
    options: [["cat","cat"],["box","box"]]
  }],
  previousStatement: null,
  nextStatement: null,
  colour: 210
}]);

Blockly.JavaScript.forBlock.select_sprite = b =>
  `currentSprite="${b.getFieldValue("SPRITE")}";\n`;

/* MOVE */
Blockly.defineBlocksWithJsonArray([{
  type: "move",
  message0: "move %1 steps",
  args0: [{ type: "field_number", name: "STEPS", value: 10 }],
  previousStatement: null,
  nextStatement: null,
  colour: 210
}]);

Blockly.JavaScript.forBlock.move = b =>
  `sprites[currentSprite].x+=${b.getFieldValue("STEPS")};draw();\n`;

/* COLOR */
Blockly.defineBlocksWithJsonArray([{
  type: "set_color",
  message0: "set color %1",
  args0: [{
    type: "field_colour",
    name: "COLOR",
    colour: "#ff8800"
  }],
  previousStatement: null,
  nextStatement: null,
  colour: 210
}]);

Blockly.JavaScript.forBlock.set_color = b =>
  `sprites[currentSprite].color="${b.getFieldValue("COLOR")}";draw();\n`;

/* SPIN */
Blockly.defineBlocksWithJsonArray([{
  type: "spin",
  message0: "spin %1 degrees",
  args0: [{ type: "field_number", name: "DEG", value: 15 }],
  previousStatement: null,
  nextStatement: null,
  colour: 120
}]);

Blockly.JavaScript.forBlock.spin = b =>
  `sprites[currentSprite].rot += ${b.getFieldValue("DEG")};draw();\n`;

/* SOUND */
Blockly.defineBlocksWithJsonArray([{
  type: "play_sound",
  message0: "play sound",
  previousStatement: null,
  nextStatement: null,
  colour: 290
}]);

Blockly.JavaScript.forBlock.play_sound = () =>
  `
const a = new AudioContext();
const o = a.createOscillator();
o.connect(a.destination);
o.start();
o.stop(a.currentTime + 0.2);
`;

/* REPEAT */
Blockly.defineBlocksWithJsonArray([{
  type: "repeat",
  message0: "repeat %1 times %2",
  args0: [
    { type: "field_number", name: "COUNT", value: 5 },
    { type: "input_statement", name: "DO" }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 60
}]);

Blockly.JavaScript.forBlock.repeat = b => {
  const code = Blockly.JavaScript.statementToCode(b, "DO");
  return `
for(let i=0;i<${b.getFieldValue("COUNT")};i++){
  ${code}
}
`;
};

/* FOREVER */
Blockly.defineBlocksWithJsonArray([{
  type: "forever",
  message0: "forever %1",
  args0: [{ type: "input_statement", name: "DO" }],
  previousStatement: null,
  nextStatement: null,
  colour: 60
}]);

Blockly.JavaScript.forBlock.forever = b => {
  const code = Blockly.JavaScript.statementToCode(b, "DO");
  return `
while(true){
  ${code}
  await new Promise(r=>setTimeout(r,0));
}
`;
};

/* =========================
   RUN ENGINE
========================= */

async function run() {
  await eval(`(async()=>{${Blockly.JavaScript.workspaceToCode(workspace)}})()`);
}

/* =========================
   EXPORT
========================= */

function exportJS() {
  log(Blockly.JavaScript.workspaceToCode(workspace));
}

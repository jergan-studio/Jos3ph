let currentUser = null;

function login() {
  currentUser = document.getElementById("user").value;
  log("Logged in as " + currentUser);
}

// Console log system (replaces alerts later)
function log(msg) {
  const c = document.getElementById("console");
  c.innerHTML += msg + "<br>";
  c.scrollTop = c.scrollHeight;
}

// Blockly setup
const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox")
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// SPRITES
let sprites = {
  cat: { x: 140, y: 140, color: "orange" },
  box: { x: 50, y: 50, color: "blue" }
};

let currentSprite = "cat";

function draw() {
  ctx.clearRect(0, 0, 300, 300);

  for (let s in sprites) {
    ctx.fillStyle = sprites[s].color;
    ctx.fillRect(sprites[s].x, sprites[s].y, 30, 30);
  }
}
draw();

/* BLOCKS */
Blockly.defineBlocksWithJsonArray([
  {
    "type":"select_sprite",
    "message0":"select sprite %1",
    "args0":[{
      "type":"field_dropdown",
      "name":"SPRITE",
      "options":[["cat","cat"],["box","box"]]
    }],
    "previousStatement":null,
    "nextStatement":null,
    "colour":210
  },
  {
    "type":"move",
    "message0":"move %1 steps",
    "args0":[{"type":"field_number","name":"STEPS","value":10}],
    "previousStatement":null,
    "nextStatement":null,
    "colour":210
  },
  {
    "type":"set_color",
    "message0":"set color %1",
    "args0":[{
      "type":"field_colour",
      "name":"COLOR",
      "colour":"#ff8800"
    }],
    "previousStatement":null,
    "nextStatement":null,
    "colour":210
  },
  {
    "type":"play_sound",
    "message0":"play sound",
    "previousStatement":null,
    "nextStatement":null,
    "colour":290
  }
]);

Blockly.JavaScript.forBlock.select_sprite = b =>
  `currentSprite="${b.getFieldValue("SPRITE")}";\n`;

Blockly.JavaScript.forBlock.move = b =>
  `sprites[currentSprite].x+=${b.getFieldValue("STEPS")};draw();\n`;

Blockly.JavaScript.forBlock.set_color = b =>
  `sprites[currentSprite].color="${b.getFieldValue("COLOR")}";draw();\n`;

Blockly.JavaScript.forBlock.play_sound = () =>
  `new AudioContext().createOscillator().start();\n`;

/* RUN */
function run() {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  eval(code);
}

/* SAVE */
function saveCloud() {
  if (!currentUser) return log("Login first");

  const xml = Blockly.Xml.domToText(
    Blockly.Xml.workspaceToDom(workspace)
  );

  localStorage.setItem("jos3ph_" + currentUser, xml);
  log("Saved to cloud (local)");
}

/* SHARE */
function share() {
  const xml = Blockly.Xml.domToText(
    Blockly.Xml.workspaceToDom(workspace)
  );

  const url = location.origin + "?p=" + btoa(xml);
  navigator.clipboard.writeText(url);

  log("Share link copied");
}

/* EXPORT JS */
function exportJS() {
  log(Blockly.JavaScript.workspaceToCode(workspace));
}

/* EXPORT LUA */
function exportLua() {
  const js = Blockly.JavaScript.workspaceToCode(workspace);

  const lua = js
    .replace(/sprites\[currentSprite\]\.x\+=/g,
      "sprites[currentSprite].x = sprites[currentSprite].x + ")
    .replace(/;/g, "");

  log(lua);
}

/* LOAD SHARE */
const p = new URLSearchParams(location.search).get("p");

if (p) {
  Blockly.Xml.domToWorkspace(
    Blockly.Xml.textToDom(atob(p)),
    workspace
  );
}

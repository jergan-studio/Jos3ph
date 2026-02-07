const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox')
});

// Sprite
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let x = 150, y = 150;

function drawSprite() {
  ctx.clearRect(0,0,300,300);
  ctx.fillStyle = "orange";
  ctx.fillRect(x, y, 30, 30);
}
drawSprite();

// Custom block
Blockly.defineBlocksWithJsonArray([
  {
    "type": "move_sprite",
    "message0": "move sprite %1 steps",
    "args0": [{ "type": "field_number", "name": "STEPS", "value": 10 }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 210
  }
]);

Blockly.JavaScript.forBlock["move_sprite"] = function(block) {
  const steps = block.getFieldValue("STEPS");
  return `x += ${steps}; drawSprite();\n`;
};

function runCode() {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  eval(code);
}

// SAVE
function saveProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const text = Blockly.Xml.domToText(xml);
  localStorage.setItem("jos3ph_project", text);
  alert("Saved!");
}

// LOAD
function loadProject(text) {
  workspace.clear();
  const xml = Blockly.Xml.textToDom(text);
  Blockly.Xml.domToWorkspace(xml, workspace);
}

// SHARE
function shareProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const text = Blockly.Xml.domToText(xml);
  const encoded = btoa(text);
  const url = location.origin + location.pathname + "?project=" + encoded;
  navigator.clipboard.writeText(url);
  alert("Share link copied!");
}

// Load from URL
const params = new URLSearchParams(location.search);
if (params.get("project")) {
  loadProject(atob(params.get("project")));
} else if (localStorage.getItem("jos3ph_project")) {
  loadProject(localStorage.getItem("jos3ph_project"));
}

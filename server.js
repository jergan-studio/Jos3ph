const express = require("express");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const USERS = "./users.json";
const PROJECTS = "./projects.json";

const read = f => JSON.parse(fs.readFileSync(f, "utf8"));
const write = (f,d) => fs.writeFileSync(f, JSON.stringify(d,null,2));

const hash = p =>
  crypto.createHash("sha256").update(p).digest("hex");

// REGISTER
app.post("/register", (req,res)=>{
  const {user, pass} = req.body;
  const users = read(USERS);

  if (users[user]) return res.sendStatus(409);

  users[user] = hash(pass);
  write(USERS, users);
  res.sendStatus(200);
});

// LOGIN
app.post("/login", (req,res)=>{
  const {user, pass} = req.body;
  const users = read(USERS);

  if (users[user] !== hash(pass)) return res.sendStatus(403);
  res.json({ok:true});
});

// SAVE PROJECT
app.post("/save", (req,res)=>{
  const {user, xml} = req.body;
  const projects = read(PROJECTS);

  projects[user] = xml;
  write(PROJECTS, projects);
  res.sendStatus(200);
});

// LOAD PROJECT
app.get("/load/:user", (req,res)=>{
  const projects = read(PROJECTS);
  res.json({xml: projects[req.params.user] || null});
});

app.listen(3000, ()=>console.log("Jos3ph server running"));

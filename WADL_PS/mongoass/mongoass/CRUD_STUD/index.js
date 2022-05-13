const express = require("express");
const morgan = require("morgan");
const http = require("http");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const hostname = "localhost";
const port = 3000;

const app = express();
app.use(bodyParser.json());

const data = [
  {
    Name: "ABC",
    Roll_no: "123",
    WAD_marks: 30,
    CC_marks: 20,
    DSBDA_marks: 10,
    CNS_marks: 25,
    AI_marks: 30,
  },
  {
    Name: "XYZ",
    Roll_no: "456",
    WAD_marks: 20,
    CC_marks: 30,
    DSBDA_marks: 28,
    CNS_marks: 24,
    AI_marks: 27,
  },
  {
    Name: "PQR",
    Roll_no: "789",
    WAD_marks: 41,
    CC_marks: 30,
    DSBDA_marks: 22,
    CNS_marks: 19,
    AI_marks: 18,
  },
  {
    Name: "PQR123",
    Roll_no: "741",
    WAD_marks: 29,
    CC_marks: 30,
    DSBDA_marks: 27,
    CNS_marks: 29,
    AI_marks: 30,
  },
];

//Assign the appropriate route to the routes.
app.get("/create", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("student");
  const collection = database.collection("studentmarks");

  const result = await collection.insertMany(data);
  res.end(JSON.stringify(result));
});

app.get("/view", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("student");
  const collection = database.collection("studentmarks");

  const result = await collection.find();
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/gotMoreThan20/:subject", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("student");
  const collection = database.collection("studentmarks");
  let condition = {};
  condition[req.params.subject] = { $gt: 20 };
  console.log(condition);
  const result = await collection.find(condition);
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/updateMarksByRollno", async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const database = client.db("student");
  const collection = database.collection("studentmarks");

  const studentRollno = req.query.studentRollno;
  const subject = `${req.query.subject}_marks`;

  const filter = { Roll_no: studentRollno };
  const update = { [subject]: 10 };

  const ack = await collection.findOneAndUpdate(filter, {
    $inc: update,
  });

  res.end(JSON.stringify(ack));
});

app.get("/gotMoreThan25InAll", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("student");
  const collection = database.collection("studentmarks");
  const result = await collection.find({
    $and: [
      { WAD_marks: { $gt: 25 } },
      { CC_marks: { $gt: 25 } },
      { DSBDA_marks: { $gt: 25 } },
      { CNS_marks: { $gt: 25 } },
      { AI_marks: { $gt: 25 } },
    ],
  });
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/lessThan40", async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const collection = await client.db("student").collection("studentmarks");

  const sub1 = `${req.query.sub1}_marks`;
  const sub2 = `${req.query.sub2}_marks`;

  const result = await collection.find({
    $and: [{ [sub1]: { $lt: 40 } }, { [sub2]: { $lt: 40 } }],
  });
  let items = [];
  await result.forEach((doc) => items.push(doc));

  console.log(items);

  res.end(JSON.stringify(items));
});

app.get("/remove/:name", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("student");
  const collection = database.collection("studentmarks");

  await collection.deleteOne({ Name: req.params.name });

  const result = await collection.find();
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/displayTable", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("student");
  const collection = database.collection("studentmarks");
  //await collection.deleteOne({"Name":req.params.name});

  const result = await collection.find();
  let items = [];
  await result.forEach(function (doc) {
    items.push(
      "<tr><td>" +
        doc.Name +
        "</td>" +
        "<td>" +
        doc.Roll_no +
        "</td>" +
        "<td>" +
        doc.WAD_marks +
        "</td>" +
        "<td>" +
        doc.DSBDA_marks +
        "</td>" +
        "<td>" +
        doc.CNS_marks +
        "</td>" +
        "<td>" +
        doc.CC_marks +
        "</td>" +
        "<td>" +
        doc.AI_marks +
        "</td>" +
        "</tr>"
    );
  });

  var code =
    "<html><head><style>body{background: gray; text-align: center;} table{border:none; border-collapse: collapse; background:peachpuff; text-align: center; margin:2rem auto 0 auto; width:900px; font-size:x-large;} table tr:first-child{font-weight: 700;} table tr td{border: 1px solid black; height: 45px;} </style></head><body><h1>Students Database</h1><table style='border:1px solid; background-color: aquamarine; text-align: center; margin:auto;'><tr><td>Name</td><td>Roll No</td><td>WAD</td><td>DSBDA</td><td>CNS</td><td>CC</td><td>AI</td><tr>";
  for (var i in items) {
    code += items[i];
  }
  code += "</table></body></html>";
  res.write(code);
});

app.get("/", (req, res, next) => {
  res.end("slash hit!!!");
});

app.use((req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("<html><body><h1>This is an Express Server</h1></body></html>");
});

//Create HTTP Server.
const server = http.createServer(app);

//Used to start the server on the given port.
server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

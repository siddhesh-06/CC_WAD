const express = require("express");
const morgan = require("morgan");
const http = require("http");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const querystring = require("querystring");
const { query } = require("express");

const hostname = "localhost";
const port = 3000;

const app = express();
app.use(bodyParser.json());

let favorite_songs = [];

let data = [
  {
    song_name: "Smells Like Teen Spirit",
    film: "RRR",
    director: "Bee Gees",
    singer: "Michael Jackson",
  },
  {
    song_name: "Billie Jean",
    film: "JOKER",
    director: "Led Zeppelin",
    singer: "Bee Gees",
  },
  {
    song_name: "I Will Survive",
    film: "FINE",
    director: "Guns N’ Roses",
    singer: "Led Zeppelin",
  },
  {
    song_name: "Whole Lotta Love",
    film: "PK",
    director: "Kendrick Lamar",
    singer: "Gloria Gaynor",
  },
];
//Assign the appropriate route to the routes.
app.get("/create", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("songdetails");

  const result = await collection.insertMany(data);
  res.end(JSON.stringify(result));
});

app.get("/view", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("songdetails");

  const result = await collection.find();
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/director/:director", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("songdetails");
  const condition = { director: req.params.director };
  console.log(condition);
  const result = await collection.find(condition);
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/director/:director/singer/:singer", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("songdetails");

  const result = await collection.find({
    $and: [{ director: req.params.director }, { singer: req.params.singer }],
  });
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });

  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/add", async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("songdetails");

  const song = {
    song_name: req.query.song_name,
    film: req.query.film,
    director: req.query.director,
    singer: req.query.singer,
  };
  const ack = await collection.insertOne(song);
  res.end(JSON.stringify(ack));
});

app.get("/delete", async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("songdetails");

  const condition = { song_name: req.query.song_name };
  const ack = await collection.deleteOne(condition);
  res.end(JSON.stringify(ack));
});

app.get("/addToFavourite", async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const songs = database.collection("songdetails");
  const favouriteSongs = database.collection("favourite");

  const fav = await songs.findOne({ song_name: req.query.song_name });
  console.log(fav);
  const ack = await favouriteSongs.insertOne(fav);

  res.end(JSON.stringify(ack));
});

app.get("/viewFavourites", async (req, res, next) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const collection = database.collection("favourite");

  const result = await collection.find();
  let items = [];
  await result.forEach(function (doc) {
    items.push(doc);
  });
  items.push({ count: items.length });
  res.end(JSON.stringify(items));
});

app.get("/singerandfilm", async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("music");
  const songs = database.collection("songdetails");

  const result = await songs.find({
    $and: [{ singer: req.query.singer }, { film: req.query.film }],
  });
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
  const database = client.db("music");
  const collection = database.collection("songdetails");

  const result = await collection.find();
  let items = [];
  await result.forEach(function (doc) {
    items.push(
      "<tr><td>" +
        doc.song_name +
        "</td>" +
        "<td>" +
        doc.film +
        "</td>" +
        "<td>" +
        doc.director +
        "</td>" +
        "<td>" +
        doc.singer +
        "</td>" +
        "</tr>"
    );
  });

  let code =
    "<html><head> <style>body{background: gray; text-align: center;}table{border: none; border-collapse: collapse; background: peachpuff; text-align: center; margin: 2rem auto 0 auto; width: 900px; font-size: x-large;}table tr:first-child{font-weight: 700;}table tr td{border: 1px solid black; height: 45px;}</style></head><body> <h1>Students Database</h1> <table style='border:1px solid; background-color: aquamarine; text-align: center; margin:auto;'> <tr><td>Song Name</td><td>Film</td><td>Director</td><td>Singer</td><tr>";
  for (const i in items) {
    code += items[i];
  }
  code += "</table>";
  res.write(code);
  res.end();
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

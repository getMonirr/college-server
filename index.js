const express = require("express");
const cors = require("cors");
require("dotenv").config();

// create app
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// routes
app.get("/", async (req, res) => {
  res.send("server is running...");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.d7lse9s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // college Hunting start
    const database = client.db("collegeHuntingDB");
    const collegeCollection = database.collection("colleges");

    // get all college
    app.get("/colleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    // get a individual college
    app.get("/colleges/:id", async (req, res) => {
      const result = await collegeCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // search college by name
    app.get("/colleges/search/:name", async (req, res) => {
      const results = await collegeCollection
        .find({ collegeName: { $regex: req.params.name, $options: "i" } })
        .toArray();
      res.send(results);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const results = await collegeCollection
        .aggregate([
          { $unwind: "$reviews" },
          { $project: { _id: 0, reviews: 1 } },
        ])
        .toArray();
      res.send(results);
    });

    // get all research
    app.get("/researches", async (req, res) => {
      const results = await collegeCollection
        .aggregate([
          { $unwind: "$researchHistory" },
          { $project: { _id: 0, researchHistory: 1 } },
        ])
        .toArray();
      res.send(results);
    });

    // get all college name only
    app.get("/college-names", async (req, res) => {
      const results = await collegeCollection
        .find()
        .project({ _id: 1, collegeName: 1 })
        .toArray();
      res.send(results);
    });

    // college Hunting end

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`server is running on port ${port}`));

const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Load environment variables
require("dotenv").config();
// JobTaskDB;
// wAqWihHmm7n00kO9;
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string from environment variables
const uri =
  "mongodb+srv://JobTaskDB:wAqWihHmm7n00kO9@cluster0.q9r8zjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    // await client.connect();
    const products = client.db("Job-Task-01").collection("Products");

    // Get All Products with Filtering, Sorting, and Pagination
    app.get("/products", async (req, res) => {
      try {
        const {
          page = 1,
          limit = 9,
          search = "",
          category,
          minPrice,
          maxPrice,
          sortBy,
        } = req.query;

        // Filters
        let filter = {};
        if (search) filter.ProductName = { $regex: search, $options: "i" };
        if (category) filter.Category = category;
        if (minPrice)
          filter.Price = { ...filter.Price, $gte: parseFloat(minPrice) };
        if (maxPrice)
          filter.Price = { ...filter.Price, $lte: parseFloat(maxPrice) };

        // Sorting
        let sort = {};
        if (sortBy === "priceLowHigh") sort.Price = 1;
        if (sortBy === "priceHighLow") sort.Price = -1;
        if (sortBy === "newest") sort.ProductCreationDate = -1;

        // Pagination
        const skip = (page - 1) * limit;

        const productsList = await products
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();
        const total = await products.countDocuments(filter);

        res.json({
          products: productsList,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
        });
      } catch (error) {
        res.status(500).json({ message: "Server Error" });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

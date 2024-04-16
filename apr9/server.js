const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://zechfc:1MUWT0zP7sfVjzfJ@cluster0.q3aseaf.mongodb.net/")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });

const recipeSchema = new mongoose.Schema({
  name: String,
  description:String,
  ingredients:[String],
  img: String
});

const Recipe = mongoose.model("Recipe", recipeSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/recipes", async (req, res) => {
  const recipes = await Recipe.find();
  res.send(recipes);
});

app.get("/api/recipes/:id", async (req, res) => {
  const id = req.params.id;
  const recipe = await Recipe.findOne({_id:id});
  res.send(recipe);
});


app.post("/api/recipes", upload.single("img"), async (req, res) => {
  const result = validateRecipe(req.body);

  if(result.error){
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const recipe = new Recipe({
    name:req.body.name,
    description:req.body.description,
    ingredients:req.body.ingredients.split(",")
  });

  if(req.file){
    recipe.img = "images/" + req.file.filename;
  }

  const saveResult = await recipe.save();
  res.send(recipe);
});


app.put("/api/recipes/:id", upload.single("img"), async (req, res) => {
  const result = validateRecipe(req.body);

  if(result.error){
    res.status(400).send(result.error.details[0].message);
    return;
  }

  let fieldsToUpdate = {
    name:req.body.name,
    description:req.body.description,
    ingredients:req.body.ingredients.split(",")
  };

  if(req.file){
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const id = req.params.id;

  const updateResult = await Recipe.updateOne({_id:id},fieldsToUpdate);
  res.send(updateResult);
});

app.delete("/api/recipes/:id", async (req, res) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);
  res.send(recipe);
});

function validateRecipe(recipe) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    ingredients: Joi.allow(""),
    _id: Joi.allow(""),
  });

  return schema.validate(recipe);
}

app.listen(3000, () => {
  console.log("I'm listening");
});

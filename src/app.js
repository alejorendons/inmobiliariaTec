const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/dbInmobiliaria")
  .then(() => console.log("Database MongoDB - dbInmobiliaria connected"))
  .catch((err) => console.log(err));

const indexRoutes = require("./routes/index");

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Habilita el parseo de URL-encoded y JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para aceptar JSON

app.use("/", indexRoutes);

app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});

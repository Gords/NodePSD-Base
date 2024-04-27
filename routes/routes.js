const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const loanRoutes = require("./loanRoutes");
const imageRoutes = require("./imageRoutes");
const contactRoutes = require("./contactRoutes");

module.exports = (models) => {
  router.use("/auth", authRoutes(models.User));
  router.use("/users", userRoutes(models.User));
  router.use("/loans", loanRoutes(models.Loan, models.TypeOfLoan, models.sequelize));
  router.use("/images", imageRoutes(models.Image, models.User));
  router.use("/contact", contactRoutes());

  return router;
};

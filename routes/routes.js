const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const loanRoutes = require("./loanRoutes");
const imageRoutes = require("./imageRoutes");
const contactRoutes = require("./contactRoutes");

module.exports = (models) => {
  router.use(authRoutes(models.User));
  router.use(userRoutes(models.User));
  router.use(loanRoutes(models.Loan, models.TypeOfLoan, models.sequelize));
  router.use(imageRoutes(models.Image, models.User));
  router.use(contactRoutes());

  return router;
};

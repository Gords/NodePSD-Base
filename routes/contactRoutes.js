const express = require("express");
const router = express.Router();
const emailService = require("../services/emailService");
const he = require("he")

module.exports = () => {
  // Post contact form
  router.post("/contact", async (req, res) => {
    console.log("Received form data:", req.body);
    const {
      "contact-first-name": firstName,
      "contact-last-name": lastName,
      "contact-id": idNumber,
      "contact-email": email,
      "contact-phone": phone,
      "contact-message": message,
    } = req.body;

    try {
      await emailService.sendContactEmail({
        firstName: he.encode(firstName),
        lastName: he.encode(lastName),
        idNumber: he.encode(idNumber),
        email: he.encode(email),
        phone: he.encode(phone),
        message: he.encode(message),
      });

      res.send(`
        <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
          <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold">Contact form submitted successfully!</span>
        </div>
      `);
    } catch (error) {
      console.error("Error handling contact form submission:", error);
      res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Error submitting contact form. Please try again.</span>
        </div>
      `);
    }
  });

  return router;
};
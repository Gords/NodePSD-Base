// Routes for the Application
const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const bcrypt = require('bcrypt');

// Configure Multer to store files in '/uploads/' directory and keep the original file name + a unique suffix
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // You must create the 'uploads/' directory before running the app
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/login');
};

const upload = multer({ storage });

// Define supported file formats
// const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'];

// Routes that use the User and Image models
module.exports = (User, Image) => {
  // POST Request - Create a new user
  router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword, name });
    req.flash('success', 'User registered successfully');
    res.json({ 'register-flash-messages': { success: '<div class="alert alert-success">User registered successfully</div>' } });
    } catch (error) {
    console.error('Error registering user:', error);
    req.flash('error', 'Error registering user');
    res.json({ 'register-flash-messages': { error: '<div class="alert alert-error">Error registering user</div>' } });
    }
    });

  // Login a user
  router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
    }), (req, res) => {
    // Authentication successful
    req.flash('success', 'Login successful');
    res.json({ 
    'login-flash-messages': { 
    success: '<div class="alert alert-success">Login successful</div>' 
    },
    'main-content': 'index.html' // Redirect to the home page or any other protected route
    });
    });

  const fs = require('fs');
  const path = require('path');
  
  router.get('/login', (req, res) => {
    const loginHtmlPath = path.join(__dirname, '..', 'public', 'components.html');
    fs.readFile(loginHtmlPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
      } else {
        // Find the login form section using a regular expression
        const loginFormSectionRegex = /<div id="login-form-section">([\s\S]*?)<\/div>/;
        const match = data.match(loginFormSectionRegex);
  
        if (match && match.length > 1) {
          const loginFormSection = match[1];
          res.json({ 'login-form-section': loginFormSection });
        } else {
          res.status(404).send('Login form section not found');
        }
      }
    });
  });

  // Fetch all users
  router.get('/users', isAuthenticated, (req, res) => {
    User.findAll()
      .then((users) => {
        const usersHtml = users.map(user => `
          <div id="user-item-${user.id}">
            <p>ID: ${user.id}</p>
            <p>Name: ${user.name}</p>
            <p>Email: ${user.email}</p>
            <button hx-delete="/delete/${user.id}" hx-target="#user-item-${user.id}" hx-swap="outerHTML">Delete</button>
          </div>
        `).join('');
        // Add id to the div element for specific targeting
        res.send(`<div id="user-list">${usersHtml}</div>`);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        req.flash('error', 'Error fetching users');
        res.redirect('/');
      });
  });

  // Update a user
  router.put('/update/:id', isAuthenticated, (req, res) => {
    const { email, password, name } = req.body;
    User.update({ email, password, name }, { where: { id: req.params.id } })
      .then(() => {
        req.flash('success', 'User updated successfully');
        res.redirect('/users');
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        req.flash('error', 'Error updating user');
        res.redirect(`/update/${req.params.id}`);
      });
  });

  // Delete a user
  router.delete('/delete/:id', isAuthenticated, (req, res) => {
    User.destroy({ where: { id: req.params.id } })
      .then(() => {
        req.flash('success', 'User deleted successfully');
        res.redirect('/users');
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        req.flash('error', 'Error deleting user');
        res.redirect('/users');
      });
  });

  /* --- FILE UPLOAD ROUTES --- */

  // Upload an image
  router.post('/files/upload', upload.single('file'), isAuthenticated, (req, res) => {
    // Assuming the user ID is stored in req.userId
    const userId = req.body.userId;

    // Create a new image record in the database
    Image.create({
      userId,
      path: req.file.path
    })
      .then((image) => {
        req.flash('success', 'Image uploaded successfully');
        res.json(image);
      })
      .catch((error) => {
        console.error('Error saving image:', error);
        req.flash('error', 'Error saving image');
        res.redirect('/upload');
      });
  });

  // TODO here if I refresh, the navbar dissapears and the image is loaded full sized D:
  // GET Request - Fetch all images
  router.get('/images', isAuthenticated, (req, res) => {
    Image.findAll()
      .then((images) => {
        const imagesHtml = images.map(image => `
          <div>
            <p>Image ID: ${image.id}</p>
            <p>User ID: ${image.userId}</p>
            <img src="${image.path}" alt="Image ${image.id}">
          </div>
        `).join('');
        res.send(`<div id="image-list">${imagesHtml}</div>`);
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
        req.flash('error', 'Error fetching images');
        res.redirect('/');
      });
  });

  return router;
};

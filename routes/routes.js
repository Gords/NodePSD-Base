const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const bcrypt = require('bcrypt');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/login');
};

module.exports = (User, Image) => {
  // User registration
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword, name });
      req.flash('success', 'User registered successfully');
      res.json({ 'register-flash-messages': { success: '<div class="alert alert-success">User registered successfully</div>' } });
    } catch (error) {
      console.error('Error registering user:', error);
      req.flash('error', 'Error registering user');
      res.status(500).json({ 'register-flash-messages': { error: '<div class="alert alert-error">Error registering user</div>' } });
    }
  });

  // User login
  router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), (req, res) => {
    req.flash('success', 'Login successful');
    res.json({
      'login-flash-messages': {
        success: '<div class="alert alert-success">Login successful</div>'
      },
      'main-content': 'index.html'
    });
  });

  // Get login form section
  router.get('/login', (req, res) => {
    const loginHtmlPath = path.join(__dirname, '..', 'public', 'components.html');
    fs.readFile(loginHtmlPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
      } else {
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

  // Get all users
  router.get('/users', isAuthenticated, async (req, res) => {
    try {
      const users = await User.findAll();
      const usersHtml = users.map(user => `
        <div id="user-item-${user.id}">
          <p>ID: ${user.id}</p>
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
          <button hx-delete="/users/${user.id}" hx-target="#user-item-${user.id}" hx-swap="outerHTML">Delete</button>
        </div>
      `).join('');
      res.send(`<div id="user-list">${usersHtml}</div>`);
    } catch (error) {
      console.error('Error fetching users:', error);
      req.flash('error', 'Error fetching users');
      res.redirect('/');
    }
  });

  // Update a user
  router.put('/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { email, password, name } = req.body;
      await User.update({ email, password, name }, { where: { id: req.params.id } });
      req.flash('success', 'User updated successfully');
      res.redirect('/users');
    } catch (error) {
      console.error('Error updating user:', error);
      req.flash('error', 'Error updating user');
      res.status(500).redirect(`/users/${req.params.id}`);
    }
  });

  // Delete a user
  router.delete('/users/:id', isAuthenticated, async (req, res) => {
    try {
      await User.destroy({ where: { id: req.params.id } });
      req.flash('success', 'User deleted successfully');
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting user:', error);
      req.flash('error', 'Error deleting user');
      res.status(500).send('Error deleting user');
    }
  });

// Upload an image
router.post('/images', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const userId = req.body.userId;
    const imagePath = req.file.path;

    // Save the image file to the file system
    const savedImagePath = path.join('uploads', req.file.filename);
    await fs.promises.rename(imagePath, savedImagePath);

    // Create a new image record in the database
    const image = await Image.create({
      userId,
      path: savedImagePath
    });

    req.flash('success', 'Image uploaded successfully');
    res.json(image);
  } catch (error) {
    console.error('Error saving image:', error);
    req.flash('error', 'Error saving image');
    res.status(500).redirect('/images');
  }
});

  // Get all images
  router.get('/images', isAuthenticated, async (req, res) => {
    try {
      const images = await Image.findAll();
      const imagesHtml = images.map(image => `
        <div>
          <p>Image ID: ${image.id}</p>
          <p>User ID: ${image.userId}</p>
          <img src="${image.path}" alt="Image ${image.id}">
        </div>
      `).join('');
      res.send(`
        <div id="image-list">
          ${imagesHtml}
        </div>
      `);
    } catch (error) {
      console.error('Error fetching images:', error);
      req.flash('error', 'Error fetching images');
      res.status(500).redirect('/');
    }
  });

  return router;
};

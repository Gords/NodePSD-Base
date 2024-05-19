const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const { isAuthenticated } = require("../services/authService");
const { Op } = require("sequelize");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const username = req.user.name; // Get the username
    const tabId = req.body.tabId; // Get the FULL tab ID (e.g., "cedula-tab")
    const filename = `${username}_${tabId}_${uniqueSuffix}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = (Image, User) => {
// Post (Upload) a file within an array of files, max 4 files
router.post(
	"/images/user",
	isAuthenticated,
	upload.array("files", 4),
	async (req, res) => {
	  try {
		const userId = req.user.id;
		const tabId = req.body.tabId; // Get tabId from the hidden input

        // Check if there are files to process
        if (!req.files || req.files.length === 0) {
          return res.status(400).send("No files uploaded.");
        }

        const fileProcessingPromises = req.files.map(async (file) => {
          const imagePath = file.path;
          const savedImagePath = path.join("uploads", file.filename);

          try {
            await fs.promises.rename(imagePath, savedImagePath);
          } catch (error) {
            console.error("Error moving file:", error);
            throw new Error("Error processing file");
          }

          // Save the image record to the database
          await Image.create({
            userId,
            path: savedImagePath,
          });
        });

        await Promise.all(fileProcessingPromises);

      // Fetch the updated image list for the specific user AND tab
      const images = await Image.findAll({
        where: {
          userId: req.user.id,
          path: {
            [Op.like]: `${req.user.name}_${tabId}_%`,
          },
        },
      });

      let userImagesHtml = "";

      if (images.length === 0) {
        userImagesHtml = /*html*/ `
          <div id="file-upload-list-${tabId}"></div> 
        `;
      } else {
        userImagesHtml = /*html*/ `
          <div id="file-upload-list-${tabId}">
            ${images.map((image) => /*html*/ `
              <div class="file-item"> 
                <span>${image.path}</span>
                <button 
                  hx-delete="/images/${image.id}" 
                  hx-target="#file-upload-list-${tabId}" // Target correct list
                  hx-swap="innerHTML" 
                  hx-confirm="Estas seguro que quieres eliminar este archivo?">
                  X
                </button>
              </div>
            `).join("")}
          </div>
        `;
      }

      // Send the updated image list HTML
      res.send(userImagesHtml);

    } catch (error) { 
        console.error("Error uploading files:", error);
        res.status(500).send(`
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Error processing your request</span>
          </div>
        `);
      }
    },
  );
   // Get all images of the logged in user
   router.get("/images/user", isAuthenticated, async (req, res) => {
	try {
	  const userId = req.user.id; // Access the user ID from req.user.id
	  const images = await Image.findAll({
		where: {
		  userId: userId, // Use the 'userId' column and the actual user ID value
		  path: {
			[Op.like]: `${req.user.name}_%`, // Match filenames starting with the username
		  },
		},
	  });

      let userImagesHtml = "";

      if (images.length === 0) {
        userImagesHtml = /*html*/ `
          <div class="overflow-x-auto pt-8">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th class="flex flex-row justify-center">Vista Previa</th>
                  <th class="flex flex-row justify-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        `;
      } else {
        userImagesHtml = /*html*/ `
          <div class="overflow-x-auto pt-8">
            <table class="table table-pin-rows w-full">
            <thead>
              <tr>
                <th>Archivo</th>
                <th class="text-center">Vista Previa</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${images
                .map(
                  (image) => /*html*/ `
              <tr class="hover" id="image-${image.id}">
                <td id="Archivo" onclick="window.open('/${
                  image.path
                }', '_blank')">${path.basename(image.path)}</td>

                <td id="Vista Previa" class="flex justify-center" onclick="window.open('/${
                  image.path
                }', '_blank')">
                  <img class="img-thumbnail hover:pointer" src="/${
                    image.path
                  }" alt="Document ${image.id}">
                </td>

                <td id="Acciones">
                  <div class="flex justify-center gap-1">

                    <a href="/images/${image.id}" id="download-link" class="btn btn-square btn-md">
                      <img src="/assets/icons/download.svg" alt="Descargar">
                    </a>

                    <button hx-delete="/images/${image.id}" hx-target="#image-${
                      image.id
                    }" hx-confirm="Estas seguro que quieres eliminar este archivo?" class="btn btn-square btn-md">
                      <img src="/assets/icons/trashbin.svg" alt="Eliminar"/>
                    </button>

                  </div>
                </td>
              </tr>
              `,
                )
                .join("")}
            </tbody>
            </table>
          </div>
        `;
      }
      res.send(userImagesHtml);
    } catch (error) {
      console.error("Error fetching user images:", error);
      res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Error fetching user images</span>
        </div>
      `);
    }
  });

  // Download a single image from a specific user
  router.get("/images/:imageId", isAuthenticated, async (req, res) => {
    try {
      const imageId = req.params.imageId;

      // Might have to add admin privileges check here, or straight up not allow access to admin-panel.html unless the user is an admin
      const image = await Image.findOne({
        where: {
          id: imageId,
        },
      });

      if (!image) {
        return res.status(404).send("No se han encontrado archivos");
      }

      const imagePath = path.resolve(image.path);
      res.download(imagePath, path.basename(imagePath), (err) => {
        if (err) {
          // Handle error, but do not expose the internal path
          console.error("File download error:", err);
          res.status(500).send(`
            <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
              <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
              <span class="font-bold text-center">Error processing your download request</span>
            </div>
          `);
        }
      });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Error fetching images</span>
        </div>
      `);
    }
  });

  // Delete an image
  router.delete("/images/:imageId", isAuthenticated, async (req, res) => {
    try {
      const { imageId } = req.params;
      const image = await Image.findByPk(imageId);
      if (!image) {
        return res.status(404).send(`
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">No se han encontrado archivos</span>
          </div>
        `);
      }
      // Delete the image file from the file system
      if (image.path) {
        await fs.promises.unlink(image.path);
      } else {
        console.error("Error: image.path is undefined");
        return res.status(500).send(`
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Error eliminando archivo</span>
          </div>
        `);
      }
      // Delete the image record from the database
      await image.destroy();
      res.send();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Error deleting image</span>
        </div>
      `);
    }
  });

  return router;
};
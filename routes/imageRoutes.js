const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const { isAuthenticated } = require("../services/authService");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_USER = 10;
const MAX_FILES_PER_UPLOAD = 4;

// Configure Multer storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
});

module.exports = (Image, User) => {
	// Post (Upload) a file within an array of files, max 4 files
	router.post(
		"/images",
		isAuthenticated,
		upload.array("files", MAX_FILES_PER_UPLOAD),
		async (req, res) => {
			try {
				const userId = req.user.id;

				// Check if the user has already uploaded the maximum allowed files
				const userFileCount = await Image.count({ where: { userId } });
				if (userFileCount >= MAX_FILES_PER_USER) {
					return res.status(400).send(
						`
						<div id="file-drop-area">
							<div role="alert" class="alert alert-warning border-black border-2 flex items-center" hx-ext="remove-me" remove-me="5s">
								<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
								<div class="flex-grow text-center">
									<p class="font-semibold">Ya has alcanzado el límite máximo de archivos permitidos en tu cuenta.</p>
								</div>
							</div>
						</div>
					`.trim(),
					);
				}

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
					const image = await Image.create({
						userId,
						path: savedImagePath,
					});
				});

				await Promise.all(fileProcessingPromises);

				// Fetch the updated list of user images
				const images = await Image.findAll({ where: { userId: req.user.id } });
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
									<td id="Archivo" onclick="window.open('/${image.path}', '_blank')"
									class="file-name truncate w-full lg:w-2/3 xl:w-1/2">
										${path.basename(image.path)}
									</td>

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

				// Send the updated user files list as the response
				res.status(200).send(userImagesHtml);
			} catch (error) {
				console.error("Error uploading files:", error);
				res.status(500).send(`
					<div id="file-upload-error" class="alert alert-error" hx-ext="remove-me" remove-me="2s">
					  Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.
					</div>
				  `);
			}
		},
	);

	router.post(
		"/images/user/:userId",
		isAuthenticated,
		upload.array("files", 4),
		async (req, res) => {
			try {
				const userId = req.params.userId;

				if (!req.files || req.files.length === 0) {
					// Check if there are files to process
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
					const image = await Image.create({
						userId,
						path: savedImagePath,
					});
				});

				await Promise.all(fileProcessingPromises);

				// Fetch the updated list of user images
				const images = await Image.findAll({ where: { userId } });
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
					const userId = req.params.userId;
					const user = await User.findOne({ where: { id: userId } });
					const userEmail = user ? user.email : "User not found";
					const images = await Image.findAll({
						where: { userId },
					});

					userImagesHtml = /*html*/ `
						<div class="card bg-base-100 text-center my-10">
							<div class="card-body">
								<div class="flex justify-between mx-4">
									<h2 class="card-title font-semibold">Usuario: "${userEmail}"</h2>
										<div class="flex space-x-2">
											<form hx-encoding="multipart/form-data" hx-post="/images/user/${userId}" hx-target="#list-of-users" hx-swap="innerHTML" class="flex space-x-2">
												<label id="select-files-btn" for="upload-new-user-files" class="btn btn-xs sm:btn-sm md:btn-sm lg:btn-md btn-primary font-extrabold text-white">Seleccionar<br>
												archivos</label>
												<input type="file" id="upload-new-user-files" name="files" multiple
												accept="image/jpeg, image/png, application/pdf" style="display: none">
												<button id="submit-new-user-files" class="btn btn-xs sm:btn-sm md:btn-sm lg:btn-md btn-primary font-extrabold text-white" type="submit">Cargar<br>archivos</button>
											</form>
											<button id="download-all-files" class="btn btn-xs sm:btn-sm md:btn-sm lg:btn-md btn-primary font-extrabold text-white">
												Descargar<br>todo
											</button>
										</div>
								</div>
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
										<td id="Archivo" onclick="window.open('/${image.path}', '_blank')"
										class="file-name truncate w-full lg:w-2/3 xl:w-1/2">
											${path.basename(image.path)}
										</td>

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

											<button hx-delete="/images/${
												image.id
											}" hx-target="#image-${image.id}" hx-confirm="Estas seguro que quieres eliminar este archivo?" class="btn btn-square btn-md">
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
						</div>
					</div>
						`;
				}

				// Send the updated user files list as the response
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

	// Get all images
	router.get("/images", isAuthenticated, async (req, res) => {
		try {
			const images = await Image.findAll();
			const imagesHtml = images
				.map(
					(image) => /*html*/ `
						<div>
							<p>Image ID: ${image.id}</p>
							<p>User ID: ${image.userId}</p>
							<img src="${image.path}" alt="Image ${image.id}">
						</div>`,
				)
				.join("");

			res.send(`<div id="image-list">${imagesHtml}</div>`);
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

	router.get("/images/user", isAuthenticated, async (req, res) => {
		try {
			const images = await Image.findAll({ where: { userId: req.user.id } });
			let userImagesHtml = "";

			if (images.length === 0) {
				userImagesHtml = /*html*/ `
					<div id="user-files" class="overflow-x-auto pt-8">
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
					<div id="user-files" class="overflow-x-auto pt-8">
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
								<td id="Archivo" onclick="window.open('/${image.path}', '_blank')"
								class="file-name truncate w-full lg:w-2/3 xl:w-1/2">
								${path.basename(image.path)}
								</td>

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
					</div>`;
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

	/// Get all images from a specific user (FOR ADMIN PANEL VIEW)
	router.get("/images/user/:userId", isAuthenticated, async (req, res) => {
		try {
			const userId = req.params.userId;
			const user = await User.findOne({ where: { id: userId } });
			const userEmail = user ? user.email : "User not found";
			const images = await Image.findAll({
				where: { userId },
			});

			res.send(/*html*/ `
				<div class="card bg-base-100 text-center my-10">
					<div class="card-body">
						<div class="flex justify-between mx-4">
							<h2 class="card-title font-semibold">Usuario: "${userEmail}"</h2>
							<div class="flex space-x-2">
								<form hx-encoding="multipart/form-data" hx-post="/images/user/${userId}" hx-target="#list-of-users" hx-swap="innerHTML" class="flex space-x-2">
									<label id="select-files-btn" for="upload-new-user-files" class="btn btn-xs sm:btn-sm md:btn-sm lg:btn-md btn-primary font-extrabold text-white">Seleccionar<br>
									archivos</label>
									<input type="file" id="upload-new-user-files" name="files" multiple
									accept="image/jpeg, image/png, application/pdf" style="display: none">
									<button id="submit-new-user-files" class="btn btn-xs sm:btn-sm md:btn-sm lg:btn-md btn-primary font-extrabold text-white" type="submit">Cargar<br>archivos</button>
								</form>
								<button id="download-all-files" class="btn btn-xs sm:btn-sm md:btn-sm lg:btn-md btn-primary font-extrabold text-white">
									Descargar<br>todo
								</button>
							</div>
						</div>
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
											<div class="flex justify-center gap-1" data-tip="Descargar">
												<a href="/images/${image.id}" id="download-link" class="btn btn-square btn-md">
													<img src="/assets/icons/download.svg" alt="Descargar">
												</a>
												<button hx-delete="/images/${
													image.id
												}" hx-target="#image-${image.id}" hx-confirm="Estas seguro que quieres eliminar este archivo?" class="btn btn-square btn-md">
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
					</div>
				</div>
			`);
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

			// Might have to add admin privileges check here, or straight up not allow access to admin-panel unless the user is an admin
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

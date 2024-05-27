const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../services/authService");
const { Op } = require("sequelize");
const he = require("he");

module.exports = (User) => {
	// Get logged in user details
	router.get("/users/user", (req, res) => {
		if (req.isAuthenticated()) {
			// Sending a partial HTML snippet to update the user-info div
			res.send(/*html*/ `
        <div class="card-body mx-4">
          <div class="card-title items-center pb-4">
            <div class="flex flex-col md:flex-row justify-center items-center md:justify-between w-full">
              <div
                class="flex flex-col md:flex-row items-center text-center justify-center md:text-start md:items-start md:pl-2">
                <div class="avatar text-center pb-2">
                  <div class="w-16 h-16 rounded-full relative bg-primary">
                    <span
                      class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-4xl font-semibold text-white">${req.user.name
												.charAt(0)
												.toUpperCase()}</span>
                  </div>
                </div>
                <div class="md:flex-col md:ml-4 md:justify-center md:items-center">
                  <div id="user-name" class="font-semibold text-lg md:mt-2">${
										req.user.name
									} ${req.user.lastName}</div>
                  <div id="user-email" class="text-sm mb-4">${req.user.email}</div>
                </div>
              </div>
              <div class="flex">
                <button hx-post="/loans/request" hx-target="#request-loan-button" hx-swap="outerHTML"
                  id="request-loan-button" class="btn btn-primary text-white self-center items-center">Solicitar
                  crédito</button>
              </div>
            </div>
          </div>
          <div class="flex justify-between">
            <div class="flex flex-col font-semibold pl-2">
              Cédula de Identidad: <span id="user-cedula" class="font-normal pb-2">${
								req.user.idNumber
							}</span>
              Teléfono: <span id="user-phone" class="font-normal">${
								req.user.phoneNumber
							}</span>
            </div>
            <div>
              <h1 class="font-bold">Información/Documentos requeridos</h1>
              <ul class="list-disc pl-3">
                <li>Cédula de Identidad (ambos lados)</li>
                <li>Comprobantes de Ingreso</li>
                <li>Factura de servicio</li>
                <li>Referencias personales (3)</li>
                <li>Factura del Negocio de la Persona (persona c/ RUC)</li>
                <li>Patente Comercial</li>
              </ul>
            </div>
          </div>
        </div>
      `);
		} else {
			res.status(401).send(/*html*/ `
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Not logged in</span>
        </div>
      `);
		}
	});

	// Get admin details
	router.get("/users/admin", (req, res) => {
		if (req.isAuthenticated()) {
			// Sending a partial HTML snippet to update the user-info div
			res.send(/*html*/ `
      <div class="flex flex-col items-center justify-center">
        <div class="avatar text-center">
          <div class="w-16 h-16 rounded-full bg-primary">
            <span class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-4xl font-semibold text-white">
              ${req.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
          <div class="font-semibold text-lg">${req.user.name}</div>
          <div class="text-sm">${req.user.email}</div>
      </div>
      `);
		} else {
			res.status(401).send(/*html*/ `
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Not logged in</span>
        </div>
      `);
		}
	});

	// Get all users or search users by name
	router.get("/users", isAuthenticated, async (req, res) => {
		try {
			const searchQuery = req.query["search-input"];
			let users;

			if (searchQuery) {
				users = await User.findAll({
					where: {
						name: { [Op.iLike]: `%${searchQuery}%` },
					},
				});
			} else {
				users = await User.findAll();
			}

			const tableRows = users
				.map(
					(user) => /*html*/ `
          <tr class="hover">
            <td>${user.idNumber}</td>
            <td>${user.name} ${user.lastName}</td>
            <td>${user.phoneNumber}</td>
            <td>${user.email}</td>
            <td>
              <a href="/images/user/${user.id}"
                hx-get="/images/user/${user.id}"
                hx-target="#list-of-users"
                hx-swap="outerHTML"
                hx-push-url="true"
                class="btn btn-md">Documentos del Usuario</a>
            </td>
          </tr>
        `,
				)
				.join("");

			res.send(tableRows);
		} catch (error) {
			console.error("Error fetching users:", error);
			res.status(500).send(/*html*/ `
      <tr>
        <td colspan="4">
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Error fetching users</span>
          </div>
        </td>
      </tr>
    `);
		}
	});

	// Search users by name
	router.get("/users/search", isAuthenticated, async (req, res) => {
		try {
			const searchQuery = req.query["search-input"] || ""; // Ensure a fallback to an empty string if undefined

			const users = await User.findAll({
				where: {
					name: { [Op.iLike]: `%${searchQuery}%` },
				},
			});

			const tableRows = users
				.map(
					(user) => /*html*/ `
          <tr class="hover">
            <td>${user.idNumber}</td>
            <td>${user.name} ${user.lastName}</td>
            <td>${user.phoneNumber}</td>
            <td>${user.email}</td>
            <td>
              <a href="/images/user/${user.id}"
                hx-get="/images/user/${user.id}"
                hx-target="#list-of-users"
                hx-swap="outerHTML"
                hx-push-url="true"
                class="btn btn-md">Datos del Usuario</a>
            </td>
          </tr>
        `,
				)
				.join("");

			res.send(tableRows);
		} catch (error) {
			console.error("Error searching users:", error);
			res.status(500).send(/*html*/ `
      <tr>
        <td colspan="4">
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Error searching users</span>
          </div>
        </td>
      </tr>
    `);
		}
	});

	// Update a user
	router.put("/users/:id", isAuthenticated, async (req, res) => {
		try {
			const { email, password, name } = req.body;
			await User.update(
				{ email: he.encode(email), password, name: he.encode(name) },
				{ where: { id: req.params.id } },
			);
			res.send(`
        <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
          <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold">User updated successfully</span>
        </div>
      `);
		} catch (error) {
			console.error("Error updating user:", error);
			res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Error updating user</span>
        </div>
      `);
		}
	});

	// Delete a user
	router.delete("/users/:id", isAuthenticated, async (req, res) => {
		try {
			await User.destroy({ where: { id: req.params.id } });
			res.sendStatus(204);
		} catch (error) {
			console.error("Error deleting user:", error);
			res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Error deleting user</span>
        </div>
      `);
		}
	});

	return router;
};

const express = require("express");
const router = express.Router();
const {isAuthenticated} = require("../services/authService")


module.exports = (User) => {
    	// Get logged in user details
	router.get("/users/user", (req, res) => {
		if (req.isAuthenticated()) {
			// Sending a partial HTML snippet to update the user-info div
			res.send(/*html*/ `
        <div class="flex flex-col md:flex-row justify-center items-center md:justify-between w-full">
          <div class="flex flex-col md:flex-row items-center text-center justify-center md:text-start md:items-start md:pl-2">
            <div class="avatar text-center pb-2">
              <div class="w-16 h-16 rounded-full relative bg-primary">
                <span class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-4xl font-semibold text-white">${req.user.name
									.charAt(0)
									.toUpperCase()}
                </span>
              </div>
            </div>
            <div class="md:flex-col md:ml-4 md:justify-center md:items-center">
              <div class="font-semibold text-lg md:mt-2">${req.user.name}</div>
              <div class="text-sm mb-4">${req.user.email}</div>
            </div>
          </div>
          <div class="flex">
            <button hx-post="/loans/request" hx-target="#request-loan-button" hx-swap="outerHTML" id="request-loan-button" class="btn btn-primary text-white self-center">
              Solicitar crédito
            </button>
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

	// Get all users
	router.get("/users", isAuthenticated, async (req, res) => {
		try {
			const users = await User.findAll({
				where: {
					loanRequested: true,
				},
			});

			const tableHtml = /*html*/ `
      <div class="overflow-x-auto">
        <table class="table table-zebra max-w-4xl text-l text-center">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users
							.map(
								(user) => /*html*/ `
              <tr>
                <td>${user.name}</td>
                <td>0981-420-681</td>
                <td>${user.email}</td>
                <td>
                  <a href="/images/user/${user.id}"
                    hx-get="/images/user/${user.id}"
                    hx-target="#list-of-users"
                    hx-swap="outerHTML"
                    hx-push-url="true" class="btn btn-md">Ver documentos</a>
                </td>
              </tr>
            `,
							)
							.join("")}
          </tbody>
        </table>
      `;
			res.send(tableHtml);
		} catch (error) {
			console.error("Error fetching users:", error);
			res.status(500).send(`
      <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
        <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
        <span class="font-bold text-center">Error fetching users</span>
      </div>
    `);
		}
	});

	// Update a user
	router.put("/users/:id", isAuthenticated, async (req, res) => {
		try {
			const { email, password, name } = req.body;
			await User.update(
				{ email, password, name },
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
}
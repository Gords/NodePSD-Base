const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../services/authService");

module.exports = (Loan, TypeOfLoan, User, sequelize) => {
	// Create new Loan type
	router.post("/loans", isAuthenticated, async (req, res) => {
		try {
			const typeOfLoan = await TypeOfLoan.create({
				name: "Préstamo Personal",
				description: "Préstamo para uso personal",
			});

			res.status(201).send(`
        <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
          <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold">Type of loan created successfully</span>
        </div>
      `);
		} catch (error) {
			console.error("Failed to create type of loan:", error);
			res.status(500).send(`
        <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
          <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
          <span class="font-bold text-center">Failed to create type of loan</span>
        </div>
      `);
		}
	});

	// Create new Loan entry and update user's loanRequested status
	router.post("/loans/request", isAuthenticated, async (req, res) => {
		const userId = req.user.id;

		try {
			const result = await sequelize.transaction(async (t) => {
				// Create a new TypeOfLoan record if it doesn't exist
				let typeOfLoan = await TypeOfLoan.findOne({
					where: { name: "Préstamo Personal" },
				});
				if (!typeOfLoan) {
					typeOfLoan = await TypeOfLoan.create(
						{
							name: "Préstamo Personal",
							description: "Préstamo para uso personal",
						},
						{ transaction: t },
					);
				}

				// Look for the user
				const user = await User.findByPk(userId, { transaction: t });
				if (!user) {
					throw new Error("User not found");
				}
				// Update the user's loanRequested status
				user.loanRequested = true;
				await user.save({ transaction: t });

				// Create a new loan record
				const loan = await Loan.create(
					{
						userId,
						typeOfLoanId: typeOfLoan.id,
					},
					{ transaction: t },
				);

				return loan;
			});

			res.status(201).send(`
        <button class="btn btn-success no-animation" self-center text-white">
          Solicitud enviada
        </button>
      `);
		} catch (error) {
			console.error("Failed to create loan and update user:", error);
			res.status(500).send(`
        <button disabled class="btn btn-accent no-animation text-white self-center ml-auto">
          Error al enviar
        </button>
      `);
		}
	});

	// Get interest rate
	router.get("/loans/interest", async (req, res) => {
		const interestRate = 0.3027; // Annual interest rate of 30.27% (fixed on the server)
		res.send(interestRate.toString());
	});

	return router;
};

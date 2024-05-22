// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).send(`
      <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
        <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
        <span class="font-bold text-center">Por favor inicia sesion para visitar esta pagina</span>
      </div>
    `);
};

module.exports = {
	isAuthenticated,
};

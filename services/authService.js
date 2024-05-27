// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).send(`
    <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
      <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
      <span class="font-bold text-center">Please log in to access this page</span>
    </div>
  `);
};

const isAdmin = (req, res, next) => {
	if (req.isAuthenticated() && req.user.isAdmin) {
		return next();
	}
	res.status(403).send(`
    <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
      <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
      <span class="font-bold text-center">Unauthorized access. Admin privileges required.</span>
    </div>
  `);
};

module.exports = {
	isAuthenticated,
	isAdmin,
};

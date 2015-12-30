//isJuniorOrSenior
module.exports = function(req, res, next) {

	// User is allowed, proceed to the next policy, 
	// or if this is the last policy, the controller

	if (req.session.me) 
	{
		return next();
	}
	else
	{
		return res.forbidden('You are not permitted to perform this action.');
	}
};
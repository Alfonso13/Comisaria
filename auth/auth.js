module.exports = {
	authUser: function authSession(req, res, next) {
		if(req.cookies.role == 'admin') {
			return res.redirect('/admin/crimes');
		}
		else if(req.cookies.role == 'agent') {
			return res.redirect('/user');
		}
		return next();
	},
	authNoSession: function authNoSession(req, res, next) {
		if(!req.cookies.role) {
			res.redirect('/login');
		}
		return next();
	},
	authAdmin: function authAdmin(req, res, next) {
		if(req.cookies.role == 'user') {
			res.redirect('/login');
		}
		next();
	},
	authAgent: function authAgent(req, res, next){

	}
};
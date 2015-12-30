/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	login: function (req, res) 
	{
		if (req.session.me)
		{
			return res.badRequest("You are already logged in.");
		}

		//Create request parameters in case they are missing
		var emailParam = !req.param('email') ? "" : req.param('email');
		var passwordParam = !req.param('password') ? "" : req.param('password');

		// Try to look up user using the provided email address
		User.findOne({email: emailParam}, function foundUser(err, user)
		{
			if (err) return res.negotiate(err);

			if (!user) return res.notFound();

			if ((user.email === emailParam) && (user.password === passwordParam))
			{
				// Store user id in the user session
				req.session.me = user.id;
				return res.ok();
			}
			else 
			{
				return res.send(400, "Incorrect password");
			}
		});

	},

	logout: function (req, res)
	{
		if (!req.session.me)
		{
			return res.redirect('/');
		}
		else
		{
			//Tell the service for online status that user is logged out
			//setting to 1 because it calculates status by Date().getTime()-lastHomepageLoad) < (twoMinutes)
			User.update({id:req.session.me}, {lastHomepageLoad: 1})
			.then(function (success)
			{
				//wipe cookie
				req.session.me = null;
				return res.redirect('/');
			})
			.catch(function (err)
			{
				return res.negotiate(err);
			});
		}
	},

	getUsersPublic: function (req, res)
	{
		User.find({})
		.sort('createdAt ASC')
		.then(function (userCollection)
		{
			var publicMemberData = UserModule.modifyUsersForPublic(userCollection);
			return res.json(200, publicMemberData);
		})
		.catch(function (err)
		{
			return res.serverError();
		});
	},

	getProfileData: function (req, res)
	{
		if (!req.session.me)
		{
			return res.forbidden();
		}
		else
		{
			User.findOne({ id : req.session.me })
			.then(function (foundUser)
			{
				var profileData = {};

				profileData.name = foundUser.name;
				profileData.email = foundUser.email;
				profileData.car = foundUser.car;
				profileData.avatar = foundUser.avatar;

				return res.json(200, profileData);
			})
			.catch(function (err)
			{
				return res.serverError();
			});
		}
	},

	updateProfile: function (req, res)
	{
		var validProposedUser = {};

		UserModule.validateUpdateProfile(req)
		.then(function (userUpdate)
		{
			User.update({id:req.session.me}, userUpdate)
			.then(function (ok)
			{
				return res.ok();
			});
		})
		.catch(function (err)
		{
			return res.send(400, err);
		})
	},

	create: function (req, res)
	{
		var validProposedUser = {};

		UserModule.validateCreate(req)
		.then(function (proposedUser)
		{
			validProposedUser = proposedUser;
			//check if a user in the Db already has the proposed id
			//Reference to model: see sails/lib/hooks/blueprints/actionUtil.js
			var model = req._sails.models[req.options.model];
			var findOneParameter = { "id" : proposedUser.id};
			return Util.alreadyInModel(model, findOneParameter);
		})
		.then(function ()
		{
			//check if a user in the Db already has the proposed login
			var model = req._sails.models[req.options.model];
			var findOneParameter = { "email" : validProposedUser.email};
			return Util.alreadyInModel(model, findOneParameter);
		})
		.then(function ()
		{
			//if this is reached, the user is valid, unique, and ready to be written to model
			User.create(validProposedUser)
			.exec(function (err, createdUser)
			{
				return err ? res.send(500, err) : res.ok();
			});
		})
		.catch(function (err)
		{
			return res.send(400, err);
		});
	},

	//gets every user in the Db with all of their data
	getUsersPrivate: function (req, res)
	{
		User.find({})
		.sort('createdAt ASC')
		.then(function (foundUsers)
		{
			return res.json(200, foundUsers);
		})
		.catch(function (err)
		{
			return res.send(500, err);
		});
	},

	//admin can update a user's account data
	update: function (req, res)
	{
		//validate request and create an object for update
		UserModule.validateUpdate(req)
		.then(function (userUpdates)
		{
			//update the user's data
			User.update({ id : req.param("id")}, userUpdates)
			.then(function (updatedUser)
			{
				return res.ok();
			});
		})
		.catch(function (err)
		{
			return res.send(400, err);
		});
	},

	delete: function (req, res)
	{
		if (!req.param("id"))
		{
			res.badRequest("User Id Missing");
		}
		else
		{
			User.destroy({ id : req.param("id") })
			.then(function (err) 
			{
				return res.ok();
			})
			.catch(function (err)
			{
				return res.send(400, "Error, User not deleted. Id may be invalid");
			});
		}
	}

};
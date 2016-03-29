module.exports = {

	//validates /updateProfile request and creates object that will update model with .update()
	validateUpdateProfile : function (req)
	{
		var deffered = sails.Q.defer();
		var userUpdate = {};

		if (!req.session.me)
		{
			deffered.reject('User is not validated.');
		}

		if (req.param('oldPassword') === "")
		{
			deffered.reject('Incorrect password.');
		}

		//Reference to model: see sails/lib/hooks/blueprints/actionUtil.js
		var model = req._sails.models[req.options.model];
		var findOneParameter = { "id" : req.session.me};

		//Create request parameters in case they are missing
		var avatar = !req.param('avatar') ? "" :  req.param('avatar');
		var oldPassword = !req.param('oldPassword') ? "" :  req.param('oldPassword');
		var newPassword = !req.param('newPassword') ? "" :  req.param('newPassword');
		var confirmPassword = !req.param('confirmPassword') ? "" :  req.param('confirmPassword');

		Util.existsInModel(model, findOneParameter)
		.then(function (foundUser)
		{
			if (foundUser.password !== oldPassword)
			{
				deffered.reject("Incorrect password");
			}

			//Update password and avatar
			if ((avatar !== "") && ((newPassword || confirmPassword) !== ""))
			{
				if (!validAvitar(avatar))
				{
					deffered.reject('Invalid avatar: PNG, JPG, or JPEG less than 200kb are acceptable');
				}

				if (!validPasswords(newPassword, confirmPassword))
				{
					deffered.reject('Passwords must match and be 1 to 25 characters in length');
				}

				userUpdate = {'password': newPassword, 'avatar': avatar}

				deffered.resolve(userUpdate);
			}
			//Update password only
			else if ((avatar === "") && ((newPassword || confirmPassword) !== ""))
			{
				if (!validPasswords(newPassword, confirmPassword))
				{
					deffered.reject('Passwords must match and be 1 to 25 characters in length');
				}

				userUpdate = {'password': newPassword}

				deffered.resolve(userUpdate);
			}
			//Update avatar only
			else if ((avatar !== "") && ((newPassword && confirmPassword) === ""))
			{
				if (!validAvitar(avatar))
				{
					deffered.reject('Invalid avatar: PNG, JPG, or JPEG less than 200kb are acceptable');
				}

				userUpdate = {'avatar': avatar}

				deffered.resolve(userUpdate);
			}
			else
			{
				deffered.reject('Invalid input');
			}
		})
		.catch(function (err)
		{
			deffered.reject(err);
		});

		return deffered.promise;
	},

	//Validates /user/update request and creates object that will update model with .update()
	validateUpdate : function (req)
	{
		var deffered = sails.Q.defer();
		var userUpdate = {};

		if (!(req.param('email') && req.param('name') && req.param('car') && req.param('permissions') && req.param('id')))
		{
			deffered.reject('Missing "Update" request parameter.');
		}

		var password = !req.param('password') ? "" : req.param('password');

		if (!emailIsValid(req.param('email')))
		{
			deffered.reject('Login is not a vaild email address');
		}
		
		if (!(req.param('permissions') === 'junior' || req.param('permissions') === 'senior'))
		{
			deffered.reject('Invalid permissions, choose "junior" or "senior"');
		}
		
		if (!nameIsValid(req.param('name')))
		{
			deffered.reject('Name is not in "First Last" format or contains invalid characters.');
		}
		
		//populate the object passed to User.update() based on
		//the properties present in the request
		if (password === "")
		{
			userUpdate =  {
					email : req.param("email"),
					name : req.param("name"),
					car : req.param("car"),
					permissions : req.param("permissions")
				};

			deffered.resolve(userUpdate);
		}
		else
		{
			userUpdate =  {
					email : req.param("email"),
					password : password,
					name : req.param("name"),
					car : req.param("car"),
					permissions : req.param("permissions")
				};

			deffered.resolve(userUpdate);
		}

		return deffered.promise;

	},

	//Validates /user/new user request and creates object that will update model with .create()
	validateCreate : function (req)
	{
		var deffered = sails.Q.defer();

		if (!(req.param("email") && req.param("name") && req.param("car") && req.param("permissions") && req.param("password")))
		{
			deffered.reject('Missing "Create" request parameter.');
		}

		if (!emailIsValid(req.param("email")))
		{
			deffered.reject('Login is not a vaild email address');
		}

		if (req.param("car") === "")
		{
			deffered.reject('Car name cannot be blank');
		}

		if (!nameIsValid(req.param("name")))
		{
			deffered.reject('Name cannot be blank or contain invaild characters.');
		}

		if (req.param("permissions") !== "junior" && req.param("permissions") !== "senior")
		{
			deffered.reject('Invalid permissions, choose "junior" or "senior"');
		}

		if (req.param("password").length > 25 || req.param("password") === "")
		{
			deffered.reject("Invalid password. It's too long (>25 characters) or blank (<1).");
		}

		var user = {
			email : req.param("email"),
			password : req.param("password"),
			name : req.param("name"),
			car : req.param("car"),
			permissions : req.param("permissions"),
			id : Util.newGuid()
		};

		deffered.resolve(user);

		return deffered.promise;
	},

	//creates set of modified user objects that can be seen by visitors that are not authenticated
	modifyUsersForPublic : function (userCollection)
	{
		var publicMemberData = new Array();

		for(var i = 0; i < userCollection.length; i++)
		{
			//array of merely a member's first name and online status
			var memberInfo = new Object();

			//make an array of first and last name
			//depends on name syntax being "First Last"
			var firstName = userCollection[i].name.split(" ")[0];

			//bool for user's online status (requested the homepage within the passed 2 minutes)
			var online = ((new Date().getTime()-userCollection[i].lastHomepageLoad) < 120001) ? true : false;

			publicMemberData.push({ name : firstName, status : online, profPic : userCollection[i].avatar });
		}

		return publicMemberData;
	},
}


//returns true for valid email addresses
function emailIsValid(email)
{
	var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return regex.test(email);
}

//returns true if name is "First Last" style
function nameIsValid(name)
{
	var regex = /^[a-z ,.'-]+$/i;
	return regex.test(name);
}

//returns true for proposed base64 pictures that are less 
//than ~280KB that are png, jpg, or jpeg format
function validAvitar(uri)
{
	if (uri.length > 25 && uri.length < 280000) 
	{
		var sub3 = uri.substring(0, 22);
		if (sub3 === ("data:image/png;base64," || "data:image/jpg;base64," || "data:image/jpeg;base64"))
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else
	{
		return false;
	}
}

//returns true if the new string and confirm string are acceptable for a password change
function validPasswords (newPassword, confirmPassword)
{
	if (newPassword.length > 25 || newPassword.length < 1)
	{
		return false;
	}

	if (newPassword !== confirmPassword)
	{
		return false;
	}

	return true;
}
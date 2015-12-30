/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	showHomePage: function (req, res)
	{
		if (!req.session.me)
		{
			return res.view('homepage', {me:'', posts: ''});
		}

		//gets set in promise chain
		var foundUser;
		var foundPosts;

		User.findOne(req.session.me)
		.then(function (sessionUser)
		{
			if (!sessionUser)
			{
				return res.render('homepage');
			}
			else
			{
				foundUser = sessionUser;
				return Post.find({}).populate('author').sort('date ASC');
			}
		})
		.then(function (allPosts)
		{
			foundPosts = allPosts;
			var time = new Date().getTime();
			return User.update({ id: foundUser.id }, { lastHomepageLoad: time });
		})
		.then(function (updated)
		{
			//return homepage view, all post data, and the user's full name
			return res.view('homepage',
			{
				me : { name: foundUser.name, permissions: foundUser.permissions },
				posts : foundPosts
			});
		})
		.catch(function (err)
		{
			return res.negotiate(err);
		});
	},

	//returns About page
	showAboutPage: function (req, res)
	{
		return res.view('about');
	},

	//returns Profile page
	showProfilePage: function (req, res)
	{
		return res.view('profile');
	},

	//returns Profile page
	showAdminPanelPage: function (req, res)
	{
		return res.view('admin-panel');
	}

};


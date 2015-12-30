/**
 * PostController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	//creates a new post
	new: function (req, res)
	{
		if (!req.session.me) return res.forbidden();

		if (!req.param('postContent')) return res.badRequest("Empty post body not permitted");

		User.findOne(req.session.me)
		.then(function foundUser(user) 
		{
			if (!user) return res.forbidden();

			if (user.id !== req.session.me) return res.forbidden();

			var author = user.id;
			var id = Util.newGuid();
			var content = req.param('postContent');
		  	var date = new Date().getTime().toString();

		  	var newPost = {
		  		author : author,
				content : content,
				id : id,
				date : date
			};

			Post.create(newPost)
			.then(function (created)
			{
				return res.ok();
			})
			.catch(function (err)
			{
				return res.serverError('Failed to Post');
			});
		})
		.catch(function (err)
		{
			return res.serverError('Failed to Post');
		});
	},

	//deletes a selected post
	delete: function (req, res)
	{
		if (!req.session.me) return res.forbidden();

		//set parameter in case it is missing
		var postId = !req.param('postId') ? "" : req.param('postId');

		var foundUser; //set in promise chain

		Util.existsInModel(req._sails.models['user'], req.session.me)
		.then(function (user)
		{
			foundUser = user;
			return Util.existsInModel(req._sails.models['post'], postId);
		})
		.then(function (foundPost)
		{
			if (req.session.me === foundPost.authorId || foundUser.permissions === 'senior')
			{
				Post.destroy({id:foundPost.id})
				.then(function (created)
				{
					return res.ok();
				})
				.catch(function (err)
				{
					return res.serverError('Failed to delete');
				});
			}
		})
		.catch(function (err)
		{
			return res.serverError(err);
		});		
	},

	getAllPosts: function (req, res)
	{
		if (!req.session.me)
		{
			return res.forbidden();
		}
		else
		{
			Post.find({})
			.populate('author')
			.sort('date DESC')
			.then(function (allPosts) 
			{
				return res.json(200, allPosts);
			})
			.catch(function (err)
			{
				return res.serverError('Failed to get all posts');
			});
		}
	}
};
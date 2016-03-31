var app = angular.module('ngSocialClub', []);

//Login Controller
app.controller('ngLoginController', ['$scope', '$http',
function($scope, $http)
{
	$scope.submitLoginForm = function ()
	{	
		if ($scope.loginForm.userName && $scope.loginForm.password)
		{
			$http.put('/login', {

				email: $scope.loginForm.userName,
				password: $scope.loginForm.password

			})
			.then(function onSuccess ()
			{
				window.location = '/';
			})
			.catch(function onError (sailsResponse)
			{
				console.log("login error");
				return;
			});
		}
	}

}]);

//Home Controller
app.controller('ngHomeController', ['$scope', '$http',
function($scope, $http)
{
	angular.element(document).ready(function () 
	{
        $scope.getMemberData();
    });

	$scope.getMemberData = function ()
	{	
		$http({
		  method: 'GET',
		  url: '/getUsersPublic'
		})
		.then(function onSuccess (sailsResponse)
		{
			$scope.memberData = sailsResponse.data;
		})
		.catch(function onError (sailsResponse)
		{
			console.log("Error, could not get user data");
			return;
		});

	}

	$scope.submitNewPost = function ()
	{
		$http.post('/post/new', {

			postContent: $scope.post.content

		})
		.then(function onSuccess ()
		{
			window.location = '/';
		})
		.catch(function onError (sailsResponse)
		{
			console.log("post error");
			return;
		});
	}

	$scope.deletePost = function (id)
	{
		console.log(id);
		$http.post('/post/delete', {

			postId: id

		})
		.then(function onSuccess ()
		{
			window.location = '/';
		})
		.catch(function onError (sailsResponse)
		{
			console.log("delete post error");
			return;
		});
	}

}]);

//Profile Controller
app.controller('ngProfileController', ['$scope', '$http',
function($scope, $http)
{
	//to handle a new profile picture
    var imgInput = document.getElementById('imgInput');
	imgInput.addEventListener('change', handleImg, false);
	var canvas = document.getElementById('imgCanvas');
	var ctx = canvas.getContext('2d');
	var newAvatarUri = "";

	angular.element(document).ready(function () 
	{
        $scope.getProfileData();
        $scope.updateStatus = " ";
    });

	$scope.getProfileData = function ()
	{	
		$http({
		  method: 'GET',
		  url: '/getProfileData'
		})
		.then(function onSuccess (sailsResponse)
		{
			$scope.profileData = sailsResponse.data;
		})
		.catch(function onError (sailsResponse)
		{
			console.log("Error, could not get profile data");
			return;
		});

	}

	$scope.updateProfile = function ()
	{
		if (newAvatarUri !== "Invalid")
		{
			$http.put('/updateProfile', {

			oldPassword: $scope.profileData.oldPassword,
			newPassword: $scope.profileData.newPassword,
			confirmPassword: $scope.profileData.confirmPassword,
			avatar: newAvatarUri

			})
			.then(function onSuccess (sailsResponse)
			{
				$scope.updateStatus = "Update Successful";
				location.reload(true);
			})
			.catch(function onError (sailsResponse)
			{
				$scope.updateStatus = sailsResponse.data;
				return;
			});
		}
		else
		{
			$scope.updateStatus = "Invalid file type.";
		}
		
	}

	function handleImg (e)
	{
		//make sure there exists a file before anything is done
		if (e.target.files[0])
		{
			var file = e.target.files[0];

			//make sure the picture is 200kb or less, and that it's a valid file
			if (file.size <= 200000 &&
				file.type === 'image/png' ||
				file.type === 'image/jpeg' ||
				file.type === 'image/jpg')
			{
				var reader = new FileReader();

				reader.onload = function(event)
				{
					var img = new Image();

					img.onload = function()
					{
						canvas.width = 50;
						canvas.height = 50;
						ctx.drawImage(img, 0, 0, img.width,img.height,0, 0, canvas.width, canvas.height);
					}

					//set the image into the canvas and to the varible for ajax
					newAvatarUri = img.src = event.target.result;
				}
				reader.readAsDataURL(file);
			}
			else
			{
				//Ajax call will not be made
				newAvatarUri = "Invalid";
			}
		}
	}

}]);

//Admin Panel Controller
app.controller('ngAdminPanelController', ['$scope', '$http', '$timeout',
function($scope, $http, $timeout)
{
	//This only helps load all the users when the page loads.
	//The rest of the ajax is implemented with jquery in admin-panel.js
	angular.element(document).ready(function () 
	{
		$scope.getAllUsers();
	});

	$scope.getAllUsers = function ()
	{	
		$http({
			method: 'GET',
			url: '/user'
		})
		.then(function onSuccess (sailsResponse)
		{
			$scope.allUsers = sailsResponse.data;

			//waits for DOM to finish updating before executing
			$timeout(function ()
			{
				//admin-panel.js
				setButtonFunctionality();
			}, 0);
		})
		.catch(function onError (sailsResponse)
		{
			console.log("Error, could not get all user data");
			return;
		});

	}

}]);
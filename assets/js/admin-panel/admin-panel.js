function setButtonFunctionality ()
{
	//get all user sections and edit buttons on the page
	allUserSections = $(".user-section");
	allEditButtons = $(".edit-button");

	//apply click event to all edit buttons
	
	allEditButtons.on("click", function ()
	{
		editButtonPressed($(this).attr("name"));
	});

	//create new user button functionality
	$('#create-button').on("click", function(){createUser();});
}

function editButtonPressed (id)
{
	if (allUserSections.length > 0)
	{
		var currentEditButton = $(allEditButtons[id]);
		var currentUserSection = $(allUserSections[id]);

		//hide all edit buttons on the page except the selected
		allEditButtons.addClass("hide");
		currentEditButton.removeClass("hide");

		//change labels to inputs
		labelsToInputs(id);

		//add the new password input
		currentUserSection
		.children('.submit-container')
		.before('<span class="new-password"><b>New Password:</b> <input type="password"></span>');

		//change the edit button to a save button
		currentEditButton.off();
		currentEditButton.attr("value", "Save");
		currentEditButton.attr("onclick", "updateUser(" + id + ")");

		//create a delete and cancel button
		currentUserSection
		.children(".submit-container")
		.append('<input class="delete-button" onclick="deleteUser(' + id + ')" type="submit" value="Delete"><input class="cancel-button" onclick="cancelEdit('+ id +')" type="submit" value="Cancel">');
	}
	else
	{
		console.log("Not any users to edit or internal error occured.");
	}
}

function cancelEdit (id)
{
	if (allUserSections.length > 0)
	{
		var currentEditButton = $(allEditButtons[id]);
		var currentUserSection = $(allUserSections[id]);

		//change the save button back to an edit button
		currentEditButton.attr("value", "Edit");

		//remove delete, cancel, and new password
		currentUserSection.children().children(".delete-button").remove();
		currentUserSection.children().children(".cancel-button").remove();
		currentUserSection.children(".new-password").remove();

		//convert input fields back to labels
		inputsToLabels(id);

		//show all edit buttons on the page
		allEditButtons.removeClass("hide");

		//remove onclick from the save/edit button
		currentEditButton.attr("onclick","");

		//reattach event
		currentEditButton.on("click", function ()
		{
			editButtonPressed($(this).attr("name"));
		});
	}
	else
	{
		console.log("Cancel edit error occured.");
	}
}

function labelsToInputs (id)
{
	$(allUserSections[id])
	.children('span')
	.children('label')
	.replaceWith(function(){return $('<input type="text" value="'+$(this).contents().text()+'">');});
}

function inputsToLabels (id)
{
	$(allUserSections[id])
	.children('span')
	.children('input')
	.replaceWith(function(){return $('<label>'+$(this).contents().context.value+'</label>');});
}

function updateUser (id)
{
	//get all of the model data for ajax
	var userSection = $(allUserSections[id]);

	var userId = userSection.children('span').children('span').html();
	var name = $(userSection.children('span').children('input').get(0)).val();
	var car = $(userSection.children('span').children('input').get(1)).val();
	var permissions = $(userSection.children('span').children('input').get(2)).val();
	var email = $(userSection.children('span').children('input').get(3)).val();
	var password = $(userSection.children('span').children('input').get(4)).val();

	//update the user
	$.ajax(
	{
		method: "PUT",
		url: "/user/update",
		data: {
			id: userId,
			name: name,
			car: car,
			permissions: permissions,
			email: email,
			password: password
		}
	})
	.done(function()
	{
		//use this to update the ui, not actually cancel
		cancelEdit(id);
	})
	.fail()
	.always();
}

function deleteUser (id)
{
	var userId = $(allUserSections[id]).children('span').children('span').html();

	$.ajax(
	{
		method: "POST",
		url: "/user/delete",
		data: {
			id: userId
		}
	})
	.done(function()
	{
		window.location.reload();
	})
	.fail(function()
	{
		//use this to update the ui, not actually cancel
		cancelEdit(id);
	});
}

function createUser ()
{
	//get all of the model data for ajax
	var name = $('#newName').val();
	var car = $('#newCar').val();
	var permissions = $('#newPermissions').val();
	var email = $('#newLogin').val();
	var password = $('#newPassword').val();

	//update the user
	$.ajax(
	{
		method: "POST",
		url: "/user/new",
		data: {
			name: name,
			car: car,
			permissions: permissions,
			email: email,
			password: password
		}
	})
	.done(function()
	{
		window.location.reload();
	})
	.fail(function(){});
}
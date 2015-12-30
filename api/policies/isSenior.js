//isSenior
module.exports = function(req, res, next) {

  //checks user's permissions property
  //returns next() if they are senior, else forbidden

  if (!req.session.me)
  {
    forbidden();
  }

  if (req.session)
  {
    User.findOne(req.session.me, function (err, user)
    {
      if (user)
      {
        //find the user with the id and make sure the permission is "senior"
        if (user.permissions === 'senior')
        {
          return next();
        }
        //reaches here if user is logged in but not "senior"
        forbidden();
      }
    });
  }

  function forbidden()
  {
    return res.forbidden('You are not permitted to perform this action.');
  }

};
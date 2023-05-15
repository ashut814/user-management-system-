exports.isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      
    }
    else {
      res.redirect('/');
    }
    next();
  } catch (error) {
    console.log(error);
  }
}

exports.isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect('/login');
    }
    next();
  } catch (error) {
    console.log(error);
  }
}
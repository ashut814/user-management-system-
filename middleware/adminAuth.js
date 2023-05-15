exports.isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {

    }
    else {
      res.redirect('/admin');
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
}

exports.isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect('/admin/home');
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
}
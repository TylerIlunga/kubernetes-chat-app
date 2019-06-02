module.exports = {
  home(req, res) {
    const viewData = { appTitle: 'chatty', headerTitle: 'Home' };
    res.render('home', { viewData });
  },
  chat(req, res) {
    if (!(req.query && req.query.username && req.query.room)) {
      return res.redirect('/404');
    }
    const viewData = {
      appTitle: 'chatty',
      room: req.query.room,
      username: req.query.username,
    };
    res.render('chat', { viewData });
  },
  error(req, res) {
    const viewData = { error: 'Page not found' };
    return res.render('error', { viewData });
  },
};

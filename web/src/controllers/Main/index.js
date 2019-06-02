const appTitle = 'Chatty :)';
module.exports = {
  home(req, res) {
    const viewData = { appTitle, headerTitle: 'Home' };
    res.render('home', { viewData });
  },
  chat(req, res) {
    if (!(req.query && req.query.username && req.query.room)) {
      return res.redirect('/404');
    }
    const viewData = {
      appTitle,
      headerTitle: `Room: ${req.query.room}`,
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

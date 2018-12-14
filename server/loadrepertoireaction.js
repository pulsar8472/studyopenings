class LoadRepertoireAction {
  constructor(database) {
    this.database_ = database;
  }

  post(request, response) {
    if (!request.user || !request.user.sub) {
      response
          .status(403)
          .send('You are not logged in.');
          return;
    }
    this.database_
        .getRepertoiresForOwner(request.user.sub)
        .then(repertoires => {
          response.send(repertoires.length
              ? repertoires[0].serializeForClient()
              : {});
        })
        .catch(err => {
          response
              .status(500)
              .send(err);
        });
  }
}

exports.LoadRepertoireAction = LoadRepertoireAction;
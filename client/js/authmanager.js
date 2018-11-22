class AuthManager {
  constructor(
      logInButtonElement,
      logOutButtonElement,
      helloElement,
      pictureElement) {
    this.logInButtonElement_ = logInButtonElement;
    this.logOutButtonElement_ = logOutButtonElement;
    this.helloElement_ = helloElement;
    this.pictureElement_ = pictureElement;

    this.auth_ = new auth0.WebAuth({
      domain: Config.AUTH0_DOMAIN,
      clientID: Config.AUTH0_CLIENT_ID,
      audience: Config.AUTH0_AUDIENCE,
      redirectUri: location.href,
      responseType: 'token id_token',
      scope: 'openid profile read:repertoires write:repertoires',
      leeway: 60
    });

    this.logInButtonElement_.onclick = this.logIn_.bind(this);
    this.logOutButtonElement_.onclick = this.logOut_.bind(this);
    this.sessionInfo_ = null;
  }

  getSessionInfo() {
    return this.sessionInfo_;
  }

  detectSession() {
    return new Promise(function(resolve, reject) {
      if (window.location.hash) {
        this.auth_.parseHash(
            this.handleAuthResult_.bind(this, resolve, reject));
        return;
      }

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        resolve(false);
        this.showLogInButton_();
        return;
      }
      this.auth_.client.userInfo(
          accessToken, this.handleUserProfile_.bind(this, resolve, reject));
    }.bind(this));
  }

  handleAuthResult_(resolve, reject, err, authResult) {
    window.location.hash = '';
    if (authResult && authResult.accessToken && authResult.idToken) {
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      this.auth_.client.userInfo(
          authResult.accessToken,
          this.handleUserProfile_.bind(this, resolve, reject));
    } else {
      if (err) {
        reject(err);
        return;
      }
      this.showLogInButton_();
      resolve(false);
    }
  }

  handleUserProfile_(resolve, reject, err, profile) {
    if (err) {
      console.error('Auth error:');
      console.error(err);
      this.showLogInButton_();
      reject(err);
    }
    this.sessionInfo_ = {
      userId: profile.sub,
      accessToken: localStorage.getItem('access_token'),
      nickname: profile.nickname,
      pictureUrl: profile.picture
    };
    this.showLoggedInUser_(profile.nickname || 'anonymous');
    resolve(true);
  }

  logIn_() {
    this.auth_.authorize();
  }

  logOut_() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('anonymous_repertoire');
    // Refresh the page.
    location.reload();
  }

  showLogInButton_() {
    this.logInButtonElement_.classList.toggle("hidden", false);
    this.logOutButtonElement_.classList.toggle("hidden", true);
    this.helloElement_.classList.toggle("hidden", true);
    this.pictureElement_.classList.toggle("hidden", true);
  }

  showLoggedInUser_() {
    this.logInButtonElement_.classList.toggle("hidden", true);
    this.logOutButtonElement_.classList.toggle("hidden", false);
    this.helloElement_.classList.toggle("hidden", false);
    this.pictureElement_.classList.toggle("hidden", false);
    this.helloElement_.innerText = 'Hi, ' + this.sessionInfo_.nickname + '!';
    this.pictureElement_.src = this.sessionInfo_.pictureUrl;
  }
}
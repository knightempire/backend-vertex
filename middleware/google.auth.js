const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const session = require('express-session');
const googleLogin = require('../controllers/google.login');

function initGoogleAuth(app) {
  console.log('🔧 Initializing Google Auth middleware...');

  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('✅ Google OAuth callback triggered');
    console.log('🔍 User Profile:', profile);

    // Simulate DB lookup
    const user = {
      id:    profile.id,
      name:  profile.displayName,
      email: profile.emails?.[0]?.value,
    };

    console.log('🧑 Authenticated User:', user);
    done(null, user);
  }));

  passport.serializeUser((user, done) => {
    console.log('💾 Serializing user:', user);
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    console.log('📂 Deserializing user:', obj);
    done(null, obj);
  });

  // Routes
  app.get('/auth/google',
    (req, res, next) => {
      console.log('➡️ Redirecting to Google for authentication');
      next();
    },
    passport.authenticate('google', { scope: ['profile','email'] })
  );

  app.get('/auth/google/callback',
    (req, res, next) => {
      console.log('➡️ Google callback triggered');
      next();  // Continue to the next middleware
    },
    passport.authenticate('google', { failureRedirect: `${process.env.STATIC_URL}/login`, session: false }),
    (req, res, next) => {
      console.log('✅ Google authentication successful');
      next();  // Continue to the next middleware
    },
    googleLogin // Call the controller after authentication
  );
  

}

module.exports = initGoogleAuth;

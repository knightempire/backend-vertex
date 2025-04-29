const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const session = require('express-session');

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
      console.log('🔙 Google callback received');
      next();
    },
    passport.authenticate('google', { failureRedirect: 'http://localhost:8080/login', session: false }),
    (req, res) => {
      console.log('🔐 Creating JWT for user:', req.user);

      const token = jwt.sign(
        { id: req.user.id, name: req.user.name, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('📦 JWT:', token);

      res.redirect(`${process.env.VITE_CLIENT_URL}/login?token=${token}`);
    }
  );
}

module.exports = initGoogleAuth;

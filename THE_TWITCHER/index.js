/*
 ______ _____   ____   _____ _______ ____  _               _____ _  __
|  ____|  __ \ / __ \ / ____|__   __|  _ \| |        /\   / ____| |/ /
| |__  | |__) | |  | | (___    | |  | |_) | |       /  \ | |    | ' / 
|  __| |  _  /| |  | |\___ \   | |  |  _ <| |      / /\ \| |    |  <  
| |    | | \ \| |__| |____) |  | |  | |_) | |____ / ____ \ |____| . \ 
|_|    |_|  \_\\____/|_____/   |_|  |____/|______/_/    \_\_____|_|\_\
*/

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const TwitchStrategy = require('passport-twitch-new').Strategy;
const path = require('path');

const app = express();
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new TwitchStrategy({
    clientID: '9bktovbw0wkgvqlkp1lr4y8ka4ktw2',
    clientSecret: 'voy26yns730gyj3k2nvfod59649bsm',
    callbackURL: 'http://localhost:3000/auth/twitch/callback',
    scope: 'user:read:email'
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        res.redirect('/connexion');
    }
});

app.get('/connexion', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        res.sendFile(__dirname + '/public' + '/connexion.html');
    }
});


app.get('/auth/twitch', passport.authenticate('twitch'));

app.get('/auth/twitch/callback',
    passport.authenticate('twitch', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile');
    }
);

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        const profile = {
            id: req.user.id,
            login: req.user.login,
            display_name: req.user.display_name,
            email: req.user.email,
            view_count: req.user.view_count,
            created_at: req.user.created_at,
            profile_image_url: req.user.profile_image_url
        };

        res.sendFile(path.join(__dirname, 'public', 'profil.html')); // Envoie le fichier profil.html
    } else {
        res.redirect('/connexion');
    }
});

app.get('/profile-data', (req, res) => {
    if (req.isAuthenticated()) {
        const profileData = {
            id: req.user.id,
            login: req.user.login,
            display_name: req.user.display_name,
            email: req.user.email,
            view_count: req.user.view_count,
            created_at: req.user.created_at,
            profile_image_url: req.user.profile_image_url
        };

        res.json(profileData);
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy((err) => {
            res.clearCookie('connect.sid'); // Supprime le cookie de session
            res.redirect('/connexion');
        });
    });
});

app.use((req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        res.redirect('/connexion');
    }
});


// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(404).send('Error 404: Page not found');
});


app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});

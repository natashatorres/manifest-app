const { ObjectID } = require("bson");
const user = require("./models/user");

module.exports = function (app, passport, db, ObjectId) {

  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
  });
  const fs = require('fs');
  const path = require('path');
  const upload = multer({ storage: storage });
  const userSchema = require('./models/user')

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    console.log(req.user.img)
    db.collection('messages').find({userId: req.user._id}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        messages: result,
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });


  // message board routes ===============================================================
  // all users manifestations
  app.get('/allmanifestations', function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('allmanifestations.ejs', {
        user: req.user,
        messages: result,
      })
     
    })
    req.logout();
    // res.render('allmanifestations.ejs');
  });

  app.post('/messages', (req, res) => {
    db.collection('messages').save({ name: req.body.name, msg: req.body.msg, date: req.body.date, like: 0, userId: req.user._id}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })


  //add images
  app.post('/imageUpload', upload.single('image'), (req, res, next) => {
    console.log('starting image upload')
    var obj = {
      name: req.body.name,
      desc: req.body.desc,
      img: {
        data: fs.readFileSync(path.join(__dirname + '/../uploads/' + req.file.filename)),
        contentType: 'image/png'
      }
    }
    console.log(obj)
    userSchema.findOneAndUpdate({
      _id: req.user._id,
    },
      obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          console.log('Saved image to database')
          res.redirect('/profile');
      }
  });
 

  });

  app.put('/messages/like', (req, res) => {


    db.collection('messages')
      .findOneAndUpdate({
        _id: ObjectId(req.body.id)
      }, {
        $inc: {
          like: 1,
        },
    
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({
      _id: ObjectId(req.body.id)
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })


  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

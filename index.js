const express = require("express")
const path = require('path')
const app = express();
const bodyParser = require('body-parser');
const mg = require('mongoose')
const session = require('express-session');
const cookieParser = require('cookie-parser');

const generateUniqueId = require('./modules/generateUniqueId.js');
const schema = require('./schema/usuarios.js');
const videosDb = require('./schema/videos.js');

mg.set('strictQuery', true);
mg.connect("mongodb+srv://nicolas:nicolasdias123@cluster0.mpxhhxs.mongodb.net/?retryWrites=true&w=majority").then(() => console.log("Conectado no banco de dados"))

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('pages', path.join(__dirname, 'pages'));

app.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    if (req.url === '/login' || req.url === '/signup' || req.url === '/') {
      next();
    } else {
      res.redirect('/');
    }
  }
});

app.get('/', (req, res) => {
  res.render("pages/home/home.ejs");
});

app.get('/login', (req, res) => {
  res.render("pages/login/login.ejs");
});



async function verifyLogin(username, password){
  let search = await schema.findOne({ username: username, password: password })  
  return search

}

 app.post('/login', async (req, res) => {

   let username = req.body.uname
   let password = req.body.password

   let verify = await verifyLogin(username, password)
   if(verify != null){
     req.session.user = { id:  verify.id};
     res.redirect("/profile")
     console.log(req.session.user.id)
      
   }else{
     res.render("pages/login/loginfailed.ejs")
   }

 });


app.get('/profile', async function (req, res) {
  // this is only called when there is an authentication user due to isAuthenticated
  let userInfo = await schema.findOne({ id: req.session.user.id} )
  let videos = await videosDb.find({ videoOwnerId: userInfo.id })
  // console.log(userInfo.id)
  // console.log(videos)

  res.render("pages/profile/personal.ejs", {
    username: userInfo.username,
    followers: userInfo.followers,
    following: userInfo.following,
    posts: userInfo.posts,
    avatar: userInfo.avatar,
    videos: videos
    

  })
})

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

async function searchName(username){
  let usernameDb = schema.findOne({ username: username })
  return usernameDb
}
async function searchEmail(email){
  let emailDb = schema.findOne({ email: email })
  return emailDb
}


app.post('/signup', async (req, res) => {
  let username = req.body.user;
  let email = req.body.email;
  let password = req.body.psw;
  let passwordReapeat = req.body.psrr

  let id = await generateUniqueId()

  let usernameDb = await searchName(username)
  let emailDb = await searchEmail(email)

  let error = [
    { status: "As senhas passadas não se correspondem.", type: "Password" },
    { status: "A senha deve ter 8 caracteres ou mais", type: "Password" },
    { status: "Este email já pertence à outra conta.", type: "Email" },
    { status: "Este username já pertence à outra conta.", type: "Username" },

  ]
  if (password !== passwordReapeat) {
    res.render("pages/login/signuperror.ejs", {
      error:error[0]
    })
  } else if (passwordReapeat < 8 || password < 8) {
     res.render("pages/login/signuperror.ejs", {
      error:error[1]
    })
  }

  if(usernameDb == null && emailDb == null){
    schema.insertMany({id: id, username: username,  email: email, password: password })
    res.render("pages/login/accountcreated.ejs")
  }

  if(usernameDb != null){
    if(usernameDb.username != username){
      if(emailDb != null){
        if(emailDb.email != email){
          schema.insertMany({ id: id, username: username,  email: email, password: password })
          res.render("pages/login/accountcreated.ejs")
        }else{
          res.render("pages/login/signuperror.ejs", {
            error:error[2]
          })
        }
      }else{
        schema.insertMany({ username: username,  email: email, password: password })
        res.render("pages/login/accountcreated.ejs")
      }
    }else{
      res.render("pages/login/signuperror.ejs", {
        error:error[3]
      })
    }
  }

  if(usernameDb == null){
    if(emailDb != null){
      if(emailDb.email != email){
        schema.insertMany({ id: id, username: username,  email: email, password: password })
        res.render("pages/login/accountcreated.ejs")
      }else{
        res.render("pages/login/signuperror.ejs", {
          error:error[2]
        })
      }
    }
  }

});

app.get('/signup', (req, res) => {
  res.render("pages/login/signup.ejs");
});


app.get('/portal', (req, res) => {
  res.render("pages/profile/portal.ejs")
})

app.post('/portal', async (req, res) => {
  let id = await generateUniqueId()
  let description = req.body.desc
  let title = req.body.title
  let owner = await schema.findOne({ id: req.session.user.id })
  videosDb.insertMany({ id: id, videoOwnerId: req.session.user.id, likes: "0", time: "1", thumbnail: "./public/images/ascvas.jpg", description: description, ownerAvatar: owner.avatar, ownerUsername: owner.username, videoName: title })
  res.redirect('/profile');
})

const port = 8080

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})

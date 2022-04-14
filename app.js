const express = require("express");
const axios = require("axios");
const app = express();
//app.use(express.json());
const {
  models: { User, Note },
} = require("./db");
const path = require("path");
const env = require("./.env");
const jwt = require("jsonwebtoken");

try {
  f43167d78bf47a2ba42d;
} catch (error) {
  console.log(error);
  console.log("YOU NEED ENVIRONMENT VARIABLES");
}

process.env.client_id = env.client_id;
process.env.client_secret = env.client_secret;

app.use(express.json());

app.use("/dist", express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/note/:id", async (req, res, next) => {
  try {
    res.send(
      await Note.deleteByToken(req.params.id, req.headers.authorization)
    );
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/notes", async (req, res, next) => {
  try {
    res.send(await Note.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/note", async (req, res, next) => {
  try {
    res.send(await Note.addByToken(req.headers.authorization, req.body.note));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/github/callback", async (req, res, next) => {
  try {
    let response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        code: req.query.code,
      },
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    const data = response.data;
    if (data.error) {
      const error = Error(data.error);
      error.status = 401;
      throw error;
    }
    response = await axios.get("https://api.github.com/user", {
      headers: {
        authorization: `token ${data.access_token}`,
      },
    });
    console.log(` this is the github_${response.data.login}`);

    const newUser = await User.byGithub(`github_${response.data.login}`);
    const jwtToken = jwt.sign({ id: newUser.id }, process.env.JWT);
    res.send(`
    <html>
      <head>
        <script>
          window.localStorage.setItem('token', '${jwtToken}')
          window.document.location = '/'
        </script>
      </head>
    </html>
    `);
    //console.log("this is the newUser", newUser);
    //res.send(newUser);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/purchases", async (req, res, next) => {
  try {
    const user = await User.byToken(req.headers.authorization);
    res.send("TODO Send the purchases for this user");
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;

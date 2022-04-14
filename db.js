const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const Note = conn.define("note", {
  txt: STRING,
});

const User = conn.define("user", {
  username: {
    type: STRING,
    allowNull: false,
    unique: true,
  },
  password: STRING,
});

User.hasMany(Note);
Note.belongsTo(User);

User.addHook("beforeSave", async (user) => {
  if (user.changed("password")) {
    const hashed = await bcrypt.hash(user.password, 3);
    user.password = hashed;
  }
});

User.byGithub = async (githubUser) => {
  console.log("this is what came in githubuser", githubUser);

  const user = await User.findOne({
    where: {
      username: githubUser,
    },
  });
  console.log("this is the db user", user);
  if (!user) {
    const createdUser = await User.create({ username: githubUser });
    console.log("this is not a user");
    return createdUser;
  }
  return user;
};

User.byToken = async (token) => {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(payload.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (user) {
      return user;
    }
  } catch (ex) {
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  }
};

Note.byToken = async (token) => {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const notes = await Note.findAll({
      where: {
        userId: payload.id,
      },
    });
    if (notes) {
      console.log(notes);
      return notes;
    }
  } catch (ex) {
    console.log(ex);
  }
};

Note.addByToken = async (token, note) => {
  const { id } = await jwt.verify(token, process.env.JWT);
  if (id) {
    const noteData = Note.create({ txt: note, userId: id });
    return noteData;
  }

  error = Error("Bad Credentials");
  error.status(401);
  throw error;
};

Note.deleteByToken = async (noteId, token) => {
  console.log("This is the token", token);
  const user = await jwt.verify(token, process.env.JWT);
  const deleteNote = await Note.findOne({
    where: {
      userId: user.id,
      id: noteId,
    },
  });
  if (deleteNote) {
    await deleteNote.destroy();
    return deleteNote;
  }
};

User.authenticate = async ({ username, password }) => {
  const user = await User.findOne({
    where: {
      username,
    },
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    return jwt.sign({ id: user.id }, process.env.JWT);
  }
  const error = Error("bad credentials!!!!!!");
  error.status = 401;
  throw error;
};

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  const notes = [
    { txt: `Hello World`, userId: lucy.id },
    { txt: `Foo Bar`, userId: moe.id },
    { txt: `Center A Div`, userId: moe.id },
    { txt: `Select All From Database`, userId: larry.id },
    { txt: `HTTP error: status code 404`, userId: larry.id },
  ];
  await Promise.all(notes.map((newNote) => Note.create(newNote)));
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Note,
  },
};

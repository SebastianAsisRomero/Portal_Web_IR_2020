const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'contraseña',
  passReqToCallback: true
}, async (req, email, contraseña, done) => {
  console.log(req.body)
  console.log(email)
  console.log(contraseña)
  const rows = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  console.log(rows.length);
  /*if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(contraseña, user.contraseña)
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.email));
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }
  */
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'contraseña',
  passReqToCallback: true
}, async (req, email, contraseña, done) => {

  const { nombre, apellido, sexo, edad, telefono, DNI, departamento, provincia, distrito,estado,domicilio } = req.body;
  const newUser = { 
    DNI,
    nombre,
    apellido,
    edad,
    sexo,
    departamento,
    provincia,
    distrito,
    domicilio,
    telefono,
    estado,
    email,
    contraseña, 
  };
  newUser.contraseña = await helpers.encryptPassword(contraseña);
  // Saving in the Database
  const result = await pool.query('INSERT INTO usuarios SET ? ', [newUser]);
  console.log("la ptmdre");
  newUser.idusuario = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.idusuario);
});

passport.deserializeUser(async (idusuario, done) => {
  const rows = await pool.query('SELECT * FROM usuarios WHERE idusuario= ?', [idusuario]);
  done(null, rows[0]);
});
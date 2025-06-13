const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const router = express.Router();
const Workout = require('../app/models/workouts');
const TrainingPlan = require('../app/models/trainingPlan');
const Exercise = require('../app/models/exercise');
const User = require('../app/models/user');
const sequelize = require('./database');
const { Op, where } = require('sequelize');
const { getMonday, getNextMonday} = require('../app/utils/dateUtils');
const path = require('path');
const { on } = require('events');
const app = express();
const PORT = 8080;

app.use(express.json());

app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + '/public')));
app.use(session({

  secret: 'e1ef60b67b2421b3f9f0d0060ac3b8fd01f9ba6d2a374b9e978f6b5d543a9f42b2d738ab9d7e3f0c41a9fd336ed4d770c450fbd78ae3d7e82b9f0a1c2de34b8',
  resave: false,
  saveUninitialized: false,

}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'senha'}, async (email, password, done) => {

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return done(null, false, { message: 'Usuário não encontrado.' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return done(null, false, { message: 'Senha incorreta.' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {

  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {

  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

function verificarAutenticado(req, res, next) {

  if (req.isAuthenticated()) {

    return next();
  }

  res.redirect('/login');
}

function getDiaAtual() {

    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const hoje = new Date();

    return dias[hoje.getDay()];
}

User.hasMany(TrainingPlan, { foreignKey: 'userId' });
TrainingPlan.belongsTo(User, { foreignKey: 'userId' });
TrainingPlan.hasMany(Exercise, { foreignKey: 'trainingPlanId', onDelete: 'CASCADE' });
Exercise.belongsTo(TrainingPlan, { foreignKey: 'trainingPlanId' });

app.get('/login', (req, res) => {

  res.render('login.html');
});

app.get('/api/treinos', verificarAutenticado, async (req, res) => {

  const planos = await TrainingPlan.findAll({
    where: { userId: req.user.id }});
  res.json(planos);
});

app.post('/api/treinos', verificarAutenticado, async (req, res) => {

  try {

    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Nome do treino é obrigatório.' });

    const novo = await TrainingPlan.create({

      userId : req.user.id,
      name
    });

    res.status(201).json(novo);

  } catch (error) {

    console.error(error);
    res.sendStatus(500);
  }
});

app.delete('/api/treinos/:id', verificarAutenticado, async (req, res) => {

  await TrainingPlan.destroy({
    where: { id: req.params.id, userId: req.user.id }
  });

  res.sendStatus(204);
});

app.get('/api/exercicios', verificarAutenticado, async (req, res) => {

  const { planId } = req.query;
  const lista = await Exercise.findAll({
    where: { trainingPlanId: planId },
    order: [['id', 'ASC']]
  });

  res.json(lista);
});

app.post('/api/exercicios', verificarAutenticado, async (req, res) => {

  const { planId, name, series, repetitions } = req.body;
  const novo = await Exercise.create({ trainingPlanId: planId, name, series, repetitions });

  res.status(201).json(novo);
});

app.delete('/api/exercicios/:id', verificarAutenticado, async (req, res) => {

  await Exercise.destroy({
    where: { id: req.params.id}
  });

  res.sendStatus(204);
});

app.post('/login', passport.authenticate('local', {

  successRedirect: '/menu',
  failureRedirect: '/login',
  failureFlash: false
}));

app.get('/logout', (req, res) => {

  req.logout((err) => {

    if (err) {

      return next(err);
    }

    res.redirect('/login');
  });
});

app.get('/cadastro', (req, res) => {

  res.render('cadastro.html');
});

app.post('/usuarios/cadastrar', async (req, res) => {

  const { nome, email, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {

    return res.send("As senhas não coincidem. <a href='/cadastro'>Por favor, tente novamente.</a>");
  }

  try {

    const existente = await User.findOne({ where: { email } });
    if (existente) {

      return res.send("Já existe um usuário cadastrado com este e-mail. <a href='/cadastro'>Por favor, tente novamente.</a>");
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const novoUsusario = await User.create({
      name: nome,
      email: email,
      password: hashedPassword
    });

    console.log('Usuário cadastrado:', novoUsusario);
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.send("Erro ao cadastrar usuário. Tente novamente.");
  }
});

app.get('/menu', verificarAutenticado, async (req, res) =>{
    
    const diaAtual = getDiaAtual();
    const hoje = new Date();
    const monday = getMonday(hoje);
    const nextMonday = getNextMonday(hoje);

    try {

      const treinosRealizados = await Workout.count({

        where: {
          date: {
            [Op.gte]: monday,
            [Op.lt]: nextMonday
          },
          userId: req.user.id
        }
      });

      console.log('Treinos contados:', treinosRealizados);

      res.render('inicioScreen.html', { diaAtual, treinosRealizados, user: req.user });
    }

    catch (error) {

      console.error('Erro ao contar treinos:', error);
      res.render('inicioScreen.html', { diaAtual, treinosRealizados: 0, user: req.user });
    }

});

app.post('/treino/fazer', verificarAutenticado, async (req, res) => {

  try {

    const hoje = new Date();
    const inicio = getMonday(hoje);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(hoje);
    fim.setHours(23, 59, 59, 999);

    await Workout.create({

      userId: req.user.id,
      date: hoje,
      details: 'Treino registrado com sucesso!'
    });

    res.redirect('/menu');
  }

  catch (error) {

    console.error('Erro ao registrar treino:', error);
    res.redirect('/menu');
  }
});

app.get('/treinos/montar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'montarTreinoScreen.html'));
});
app.get('/treinos/consultar', (req, res) => {
  res.send('<h1>Página de Consultar Treino</h1><p>Aqui você poderá consultar seus treinos.</p><a href="/">Voltar ao Menu</a>');
});
app.get('/rotina/montar', (req, res) => {
  res.send('<h1>Página de Montar Rotina Alimentar</h1><p>Aqui você poderá criar sua rotina alimentar.</p><a href="/">Voltar ao Menu</a>');
});
app.get('/rotina/consultar', (req, res) => {
  res.send('<h1>Página de Consultar Rotina Alimentar</h1><p>Aqui você poderá consultar suas rotinas alimentares.</p><a href="/">Voltar ao Menu</a>');
});
app.get('/perfil', (req, res) => {
  res.send('<h1>Página de Perfil</h1><p>Aqui você verá suas informações de perfil.</p><a href="/">Voltar ao Menu</a>');
});

sequelize.sync().then(() => {

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

})
.catch((error) => {
  console.error('Erro ao sincronizar o banco de dados:', error);
});



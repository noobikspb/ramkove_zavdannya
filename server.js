const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

let users = [];

app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Усі поля обов'язкові" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Пароль повинен містити щонайменше 6 символів" });
    }
    
    const userExists = users.some(user => user.username === username || user.email === email);
    if (userExists) {
      return res.status(400).json({ message: "Користувач з таким іменем або email вже існує" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    res.status(201).json({ message: "Реєстрація успішна" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Усі поля обов'язкові" });
    }
    
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ message: "Невірне ім'я користувача або пароль" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Невірне ім'я користувача або пароль" });
    }
    
    res.status(200).json({ 
      message: "Вхід успішний",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

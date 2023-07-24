// Установка необходимых пакетов
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

// Подключение к базе данных MongoDB
mongoose
  .connect("mongodb://localhost/sso", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Успешное подключение к базе данных"))
  .catch((error) =>
    console.error("Ошибка при подключении к базе данных:", error)
  );

// Определение модели пользователя
const User = mongoose.model("User", {
  username: String,
  password: String,
});

// Создание экземпляра приложения Express
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Настройка сессии
app.use(
  session({
    secret: "somesecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// Маршрут для отображения формы входа
app.get("/login", (req, res) => {
  res.render("login");
});

// Маршрут для обработки формы входа
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Поиск пользователя в базе данных
  const user = await User.findOne({ username, password });

  // Если пользователь не найден, вернуть ошибку
  if (!user) {
    return res.render("login", {
      error: "Неверное имя пользователя или пароль",
    });
  }

  // Сохранение информации о пользователе в сессии
  req.session.user = user;

  // Перенаправление на защищенную страницу
  res.redirect("/dashboard");
});

// Маршрут для отображения защищенной страницы
app.get("/dashboard", (req, res) => {
  // Проверка наличия информации о пользователе в сессии
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("dashboard", {
    user: req.session.user,
  });
});

// Маршрут для выхода из системы
app.get("/logout", (req, res) => {
  // Очистка информации о пользователе из сессии
  req.session.destroy();

  res.redirect("/login");
});

// Запуск сервера
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});

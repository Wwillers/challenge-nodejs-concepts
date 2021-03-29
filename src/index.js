const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccount = users.find((user) => user.username === username);

  if (!userAccount) {
    return response.status(404).json({ error: 'User not found!' });
  }

  request.userAccount = userAccount;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find((user) => user.username === username);

  if (userExist) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  return response.json(userAccount.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  userAccount.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = userAccount.todos.find((userTodo) => userTodo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'ToDo not found!' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;

  const todo = userAccount.todos.find((userTodo) => userTodo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;

  const todo = userAccount.todos.findIndex((userTodo) => userTodo.id === id);

  if (todo === -1) {
    return response.status(404).json({ error: 'ToDo not found!' });
  }

  userAccount.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;

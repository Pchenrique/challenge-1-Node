const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: 'User not found'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if(userExists){
    return response.status(400).json({ error: "Username already exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  if(user.todos.length === 0){
    return response.status(404).json({ error: 'Todo not found!'});
  }

  const todo = user.todos.map(
    (todo) => {
      if(todo.id === request.params.id){
        todo.title = title;
        todo.deadline = new Date(deadline);
        
        return todo;
      }
  });

  if(todo === 0){
    return response.status(404).json({ error: 'Todo not found!'});
  }

  return response.json({ title: todo[0].title, deadline: todo[0].deadline, done: todo[0].done });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  if(user.todos.length === 0){
    return response.status(404).json({ error: 'Todo not found!'});
  }

  const todo = user.todos.map(
    (todo) => {
      if(todo.id === request.params.id){
        todo.done = true;
        
        return todo;
      }
  });

  if(todo === 0){
    return response.status(404).json({ error: 'Todo not found!'});
  }

  return response.json(todo[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todoIndex = user.todos.findIndex(todoItem => todoItem.id === request.params.id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
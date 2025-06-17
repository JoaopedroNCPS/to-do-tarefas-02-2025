const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());


app.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.post('/users', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    const user = await prisma.user.create({ data: { name } });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});


app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({ include: { user: true } });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

app.post('/tasks', async (req, res, next) => {
  try {
    const { description, sector, priority, userId, status } = req.body;
    if (!description || !sector || !priority || !userId || !status) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const task = await prisma.task.create({
      data: { description, sector, priority, userId, status }
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, sector, priority, userId, status } = req.body;
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { description, sector, priority, userId, status }
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: 'Tarefa excluída.' });
  } catch (err) {
    next(err);
  }
});

 
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro inesperado.' });
});


process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

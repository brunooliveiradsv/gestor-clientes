// 1. Importar as dependências
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Cliente = require('./models/Cliente.js'); // Modelo importado

// 2. Inicializar o Express
const app = express();
const PORT = process.env.PORT || 3001;

// 3. Configurar os Middlewares
app.use(cors());
app.use(express.json());

// 4. Rotas da API
app.get('/', (req, res) => {
  res.send('<h1>API do Gestor de Clientes</h1>');
});

// ROTA PARA CRIAR UM NOVO CLIENTE (CREATE)
app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, endereco } = req.body;
    const novoCliente = new Cliente({ nome, cpf, email, telefone, endereco });
    const clienteSalvo = await novoCliente.save();
    res.status(201).json(clienteSalvo);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Erro: CPF já cadastrado." });
    }
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar criar o cliente." });
  }
});

// ROTA PARA BUSCAR TODOS OS CLIENTES (READ)
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find({}).sort({ createdAt: -1 });
    res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar clientes." });
  }
});

// ROTA PARA DELETAR UM CLIENTE (DELETE)
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    // 1. Pega o ID a partir dos parâmetros da URL (ex: /api/clientes/60b8d2...)
    const { id } = req.params;

    // 2. Valida se o ID tem o formato correto do MongoDB antes de buscar
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de cliente inválido.' });
    }

    // 3. Encontra o cliente pelo ID e o remove do banco de dados
    const clienteRemovido = await Cliente.findByIdAndDelete(id);

    // 4. Se findByIdAndDelete não encontrar um cliente com esse ID, ele retorna null
    if (!clienteRemovido) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }

    // 5. Retorna uma mensagem de sucesso
    res.status(200).json({ message: 'Cliente removido com sucesso.' });

  } catch (error) {
    console.error("Erro ao remover cliente:", error);
    res.status(500).json({ message: "Erro interno do servidor ao remover cliente." });
  }
});

// 5. Conectar ao MongoDB e Iniciar o Servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('A conexão com o MongoDB falhou:', err);
  });
// 1. Importar as dependências
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Cliente = require('./models/Cliente.js');

// 2. Inicializar o Express
const app = express();
const PORT = process.env.PORT || 3001;

// 3. Configuração Robusta do CORS (ATUALIZADO)
const corsOptions = {
  origin: 'https://gestorclientes.netlify.app', // Permite requisições APENAS do seu site na Netlify
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS", // Permite todos os métodos que usamos
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
};
app.use(cors(corsOptions));

// 4. Middlewares
app.use(express.json());

// 5. Rotas da API (continuam as mesmas)
app.get('/', (req, res) => {
  res.send('<h1>API do Gestor de Clientes</h1>');
});

app.post('/api/clientes', async (req, res) => { /* ... (código da rota POST) ... */ 
  try { const { nome, cpf, email, telefone, endereco } = req.body; const novoCliente = new Cliente({ nome, cpf, email, telefone, endereco }); const clienteSalvo = await novoCliente.save(); res.status(201).json(clienteSalvo); } catch (error) { console.error("Erro ao criar cliente:", error); if (error.code === 11000) { return res.status(409).json({ message: "Erro: CPF já cadastrado." }); } res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar criar o cliente." }); }
});

app.get('/api/clientes', async (req, res) => { /* ... (código da rota GET all) ... */ 
  try { const clientes = await Cliente.find({}).sort({ createdAt: -1 }); res.status(200).json(clientes); } catch (error) { console.error("Erro ao buscar clientes:", error); res.status(500).json({ message: "Erro interno do servidor ao buscar clientes." }); }
});

app.delete('/api/clientes/:id', async (req, res) => { /* ... (código da rota DELETE) ... */
  try { const { id } = req.params; if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID de cliente inválido.' }); } const clienteRemovido = await Cliente.findByIdAndDelete(id); if (!clienteRemovido) { return res.status(404).json({ message: 'Cliente não encontrado.' }); } res.status(200).json({ message: 'Cliente removido com sucesso.' }); } catch (error) { console.error("Erro ao remover cliente:", error); res.status(500).json({ message: "Erro interno do servidor ao remover cliente." }); }
});

app.get('/api/clientes/:id', async (req, res) => { /* ... (código da rota GET one) ... */
  try { const { id } = req.params; if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID de cliente inválido.' }); } const cliente = await Cliente.findById(id); if (!cliente) { return res.status(404).json({ message: 'Cliente não encontrado.' }); } res.status(200).json(cliente); } catch (error) { console.error("Erro ao buscar cliente por ID:", error); res.status(500).json({ message: "Erro interno do servidor." }); }
});

app.put('/api/clientes/:id', async (req, res) => { /* ... (código da rota PUT) ... */
  try { const { id } = req.params; if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID de cliente inválido.' }); } const clienteAtualizado = await Cliente.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); if (!clienteAtualizado) { return res.status(404).json({ message: 'Cliente não encontrado.' }); } res.status(200).json(clienteAtualizado); } catch (error) { console.error("Erro ao atualizar cliente:", error); if (error.code === 11000) { return res.status(409).json({ message: "Erro: CPF já cadastrado em outro cliente." }); } res.status(500).json({ message: "Erro interno do servidor ao atualizar cliente." }); }
});


// 6. Conectar ao MongoDB e Iniciar o Servidor
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
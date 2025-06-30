// 1. Importar o Mongoose
const mongoose = require('mongoose');

// 2. Definir o Schema (a estrutura) do Cliente
const clienteSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true, // O campo é obrigatório
        trim: true      // Remove espaços em branco no início e no fim
    },
    cpf: {
        type: String,
        required: true,
        unique: true,   // Garante que não haverá dois clientes com o mesmo CPF
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true // Salva o e-mail sempre em letras minúsculas
    },
    telefone: {
        type: String,
        trim: true
    },
    endereco: {
        type: String,
        trim: true
    }
}, {
    // Adiciona os campos 'createdAt' e 'updatedAt' automaticamente
    timestamps: true 
});

// 3. Criar o Modelo a partir do Schema
// O Mongoose pegará o nome 'Cliente', colocará em minúsculas e no plural ('clientes'),
// e usará isso para nomear a "collection" (a "tabela") no banco de dados.
const Cliente = mongoose.model('Cliente', clienteSchema);

// 4. Exportar o Modelo
module.exports = Cliente;
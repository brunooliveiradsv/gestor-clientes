document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores e Configurações (continuam os mesmos) ---
    const form = document.getElementById('form-cliente');
    const tabelaCorpo = document.getElementById('corpo-tabela');
    const tabelaCabecalho = document.querySelector('#tabela-clientes thead');
    const filtroInput = document.getElementById('filtro-busca');
    // ... todos os outros seletores ...
    const cpfInput = document.getElementById('cpf');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const enderecoInput = document.getElementById('endereco');
    const cpfEscondidoInput = document.getElementById('cpf-escondido');
    const btnCancelar = document.getElementById('btn-cancelar');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalButtons = document.getElementById('modal-buttons');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProxima = document.getElementById('btn-proxima');
    const infoPagina = document.getElementById('info-pagina');


    const API_URL = 'http://localhost:3001/api';
    let sortState = { key: 'nome', order: 'asc' };
    let currentPage = 1;
    const rowsPerPage = 10;
    let todosOsClientes = [];

    // --- Funções de Validação (continuam as mesmas) ---
    const validarEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(String(email).toLowerCase());
    const validarCPF = (cpf) => {
        cpf = String(cpf).replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let soma = 0; let resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };
    
    // --- Funções de API e UI (com `removerCliente` atualizado) ---
    const getClientes = async () => { /* ... (continua a mesma) ... */
        try {
            const response = await fetch(`${API_URL}/clientes`);
            if (!response.ok) throw new Error('A resposta da rede não foi OK.');
            todosOsClientes = await response.json();
            return todosOsClientes;
        } catch (error) {
            console.error("Erro ao buscar clientes da API:", error);
            showAlert('Erro de Conexão', 'Não foi possível carregar os clientes.');
            return [];
        }
    };
    const showModal = (title, message, buttonsConfig) => { /* ... */ modalTitle.textContent = title; modalMessage.textContent = message; modalButtons.innerHTML = ''; buttonsConfig.forEach(config => { const button = document.createElement('button'); button.textContent = config.text; button.className = `btn ${config.class}`; button.addEventListener('click', () => { hideModal(); if (config.onClick) config.onClick(); }); modalButtons.appendChild(button); }); modalOverlay.classList.remove('hidden'); };
    const hideModal = () => modalOverlay.classList.add('hidden');
    const showAlert = (title, message) => showModal(title, message, [{ text: 'OK', class: 'btn-primary' }]);
    const showConfirm = (title, message, onConfirm) => showModal(title, message, [{ text: 'Cancelar', class: 'btn-secondary' }, { text: 'Confirmar', class: 'btn-danger', onClick: onConfirm }]);
    const showError = (input, message) => { const formGroup = input.parentElement; const errorSpan = formGroup.querySelector('.error-message'); input.classList.add('error'); errorSpan.textContent = message; errorSpan.style.display = 'block'; };
    const clearAllErrors = () => { form.querySelectorAll('.error').forEach(input => { const formGroup = input.parentElement; const errorSpan = formGroup.querySelector('.error-message'); input.classList.remove('error'); errorSpan.textContent = ''; errorSpan.style.display = 'none'; }); };
    const renderizarTabela = async (usarCache = false) => { /* ... (continua a mesma) ... */
        let clientes = usarCache ? todosOsClientes : await getClientes();
        const termoBusca = filtroInput.value.toLowerCase();
        clientes.sort((a, b) => {
            const valA = a[sortState.key] || '';
            const valB = b[sortState.key] || '';
            return sortState.order === 'asc' ? valA.localeCompare(valB, 'pt-BR') : valB.localeCompare(valA, 'pt-BR');
        });
        const clientesFiltrados = termoBusca ? clientes.filter(c => c.nome.toLowerCase().includes(termoBusca) || c.cpf.includes(termoBusca)) : clientes;
        const totalRows = clientesFiltrados.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        if (currentPage > totalPages && totalPages > 0) { currentPage = totalPages; }
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const clientesDaPagina = clientesFiltrados.slice(startIndex, endIndex);
        tabelaCorpo.innerHTML = '';
        if (clientesDaPagina.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 32px;">Nenhum cliente encontrado.</td></tr>`;
            document.getElementById('paginacao-container').style.display = 'none';
        } else {
            document.getElementById('paginacao-container').style.display = 'flex';
            clientesDaPagina.forEach(cliente => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${cliente.nome}</td><td>${cliente.cpf}</td><td>${cliente.email}</td><td>${cliente.telefone}</td><td>${cliente.endereco || 'Não informado'}</td>
                    <td>
                        <button class="btn-acao btn-editar" data-id="${cliente._id}" title="Editar">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg>
                        </button>
                        <button class="btn-acao btn-remover" data-id="${cliente._id}" title="Remover">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        </button>
                    </td>`;
                tabelaCorpo.appendChild(tr);
            });
        }
        infoPagina.textContent = `Página ${currentPage} de ${totalPages || 1}`;
        btnAnterior.disabled = currentPage === 1;
        btnProxima.disabled = currentPage === totalPages || totalPages === 0;
        document.querySelectorAll('.sortable').forEach(th => { th.classList.remove('sort-asc', 'sort-desc'); if (th.dataset.sortKey === sortState.key) th.classList.add(`sort-${sortState.order}`); });
    };
    const salvarCliente = async (event) => { /* ... (continua a mesma) ... */
        event.preventDefault(); clearAllErrors(); let isValid = true;
        const nome = nomeInput.value.trim(); const email = emailInput.value.trim(); const cpf = cpfInput.value.trim();
        if (!nome) { showError(nomeInput, 'O campo Nome é obrigatório.'); isValid = false; }
        if (!validarEmail(email)) { showError(emailInput, 'O formato do e-mail é inválido.'); isValid = false; }
        if (!cpfInput.disabled && !validarCPF(cpf)) { showError(cpfInput, 'O CPF inserido não é válido.'); isValid = false; }
        if (!isValid) return;
        const clienteData = { nome, cpf, email, telefone: telefoneInput.value.trim(), endereco: enderecoInput.value.trim() };
        try {
            const response = await fetch(`${API_URL}/clientes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clienteData) });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) { showError(cpfInput, errorData.message); } 
                else { throw new Error(errorData.message || 'Erro ao salvar cliente.'); }
                return;
            }
            form.reset();
            showAlert('Sucesso!', 'Cliente salvo com sucesso.');
            renderizarTabela();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            showAlert('Erro', 'Não foi possível salvar o cliente.');
        }
    };
    
    // ATUALIZADA
    const removerCliente = async (id) => {
        showConfirm('Confirmar Remoção', 'Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.', async () => {
            try {
                const response = await fetch(`${API_URL}/clientes/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha ao remover o cliente.');
                }
                
                showAlert('Sucesso', 'Cliente removido com sucesso.');
                renderizarTabela(); // Atualiza a tabela para remover o cliente da UI

            } catch (error) {
                console.error("Erro ao remover cliente:", error);
                showAlert('Erro', `Não foi possível remover o cliente. Erro: ${error.message}`);
            }
        });
    };

    // AINDA A IMPLEMENTAR
    const prepararEdicao = (id) => {
        showAlert('Em Breve', 'A funcionalidade de editar será implementada em breve.');
        // TODO: Implementar a lógica de API para buscar um cliente e preencher o formulário
    };

    // --- Event Listeners ---
    // ... (todos os outros event listeners continuam os mesmos)
    form.addEventListener('submit', salvarCliente);
    btnCancelar.addEventListener('click', () => { form.reset(); clearAllErrors(); cpfInput.disabled = false; btnCancelar.style.display = 'none'; });
    filtroInput.addEventListener('input', () => { currentPage = 1; renderizarTabela(true); });
    tabelaCabecalho.addEventListener('click', (event) => { const th = event.target.closest('.sortable'); if (th) { currentPage = 1; const key = th.dataset.sortKey; sortState.order = (sortState.key === key && sortState.order === 'asc') ? 'desc' : 'asc'; sortState.key = key; renderizarTabela(true); } });
    btnAnterior.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderizarTabela(true); } });
    btnProxima.addEventListener('click', () => { const totalPages = Math.ceil(todosOsClientes.filter(c => filtroInput.value ? (c.nome.toLowerCase().includes(filtroInput.value.toLowerCase()) || c.cpf.includes(filtroInput.value)) : true).length / rowsPerPage); if (currentPage < totalPages) { currentPage++; renderizarTabela(true); } });
    tabelaCorpo.addEventListener('click', (event) => {
        const btnEditar = event.target.closest('.btn-editar');
        const btnRemover = event.target.closest('.btn-remover');
        if (btnEditar) prepararEdicao(btnEditar.dataset.id);
        if (btnRemover) removerCliente(btnRemover.dataset.id);
    });

    renderizarTabela();
});
// ============================================================
// script.js — Banco Escolar Digital
// Sistema bancário escolar: contas, depósitos, saques e histórico.
// ============================================================

// ============================================================
// BLOCO 1 — CONFIGURAÇÃO E ESTADO
// ============================================================

// Lista de contas cadastradas (dados de exemplo para a turma)
const contas = [
    {
        numero: 10001,
        titular: 'Ana Beatriz Souza',
        cpf: '123.456.789-01',
        tipo: 'comum',
        saldo: 0,
        limite: 0,
        movimentacoes: []
    },
    {
        numero: 10002,
        titular: 'Bruno Henrique Lima',
        cpf: '234.567.890-12',
        tipo: 'especial',
        saldo: 0,
        limite: 500,
        movimentacoes: []
    },
    {
        numero: 10003,
        titular: 'Carla Mendes Rocha',
        cpf: '345.678.901-23',
        tipo: 'especial',
        saldo: 1200,
        limite: 800,
        movimentacoes: [
            { tipo: 'Depósito', valor: 1500, data: new Date('2025-01-10T09:30:00') },
            { tipo: 'Saque', valor: 300, data: new Date('2025-01-12T14:05:00') }
        ]
    }
];

// ============================================================
// BLOCO 2 — FUNÇÕES AUXILIARES
// ============================================================

// Formata um número como moeda brasileira (R$)
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Formata uma data para o padrão brasileiro
function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR');
}

// Gera um número de conta de 5 dígitos que ainda não existe
function gerarNumeroConta() {
    let numero;
    do {
        numero = Math.floor(10000 + Math.random() * 90000);
    } while (contas.some(conta => conta.numero === numero));
    return numero;
}

// Busca uma conta pelo número; retorna null se não encontrar
function buscarConta(numero) {
    const encontrada = contas.find(conta => String(conta.numero) === String(numero));
    return encontrada || null;
}

// Total disponível: saldo + limite para conta especial, apenas saldo para conta comum
function calcularTotalDisponivel(conta) {
    if (conta.tipo === 'especial') {
        return conta.saldo + conta.limite;
    }
    return conta.saldo;
}

// Quanto do limite já foi utilizado (saldo negativo)
function calcularLimiteUsado(conta) {
    return Math.max(0, -conta.saldo);
}

// Exibe uma mensagem de sucesso ou erro em um elemento e limpa após 4 segundos
function exibirMensagem(elementoId, texto, tipo) {
    const el = document.getElementById(elementoId);
    if (!el) return;
    el.textContent = texto;
    el.classList.remove('sucesso', 'erro');
    el.classList.add('mensagem', tipo === 'sucesso' ? 'sucesso' : 'erro');
    setTimeout(() => limparMensagem(elementoId), 4000);
}

// Limpa o texto e as classes de uma mensagem
function limparMensagem(elementoId) {
    const el = document.getElementById(elementoId);
    if (!el) return;
    el.textContent = '';
    el.classList.remove('mensagem', 'sucesso', 'erro');
}

// ============================================================
// BLOCO 3 — NAVEGAÇÃO
// ============================================================

// Mostra apenas a tela pedida. Se a tela não existir, volta para o menu.
function trocarTela(idTela) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.add('oculto'));

    const telaAlvo = document.getElementById(idTela);
    if (telaAlvo) {
        telaAlvo.classList.remove('oculto');
    } else {
        const menu = document.getElementById('tela-menu');
        if (menu) menu.classList.remove('oculto');
    }

    document.querySelectorAll('[data-tela]').forEach(botao => {
        botao.classList.toggle('ativo', botao.dataset.tela === idTela);
    });
}

// Mostra a data e hora atual e atualiza a cada segundo
function atualizarDataHora() {
    const elemento = document.getElementById('dataHora');
    if (!elemento) return;
    const atualizar = () => {
        elemento.textContent = new Date().toLocaleString('pt-BR');
    };
    atualizar();
    setInterval(atualizar, 1000);
}

// ============================================================
// BLOCO 4 — RENDERIZAÇÃO
// ============================================================

// Preenche o seletor de contas, preservando a seleção atual se a conta ainda existir
function atualizarSelectContas() {
    const select = document.getElementById('selectConta');
    if (!select) return;
    const selecaoAnterior = select.value;

    select.innerHTML = '';

    const padrao = document.createElement('option');
    padrao.value = '';
    padrao.textContent = 'Selecione uma conta';
    select.appendChild(padrao);

    contas.forEach(conta => {
        const option = document.createElement('option');
        option.value = conta.numero;
        option.textContent = conta.numero + ' — ' + conta.titular;
        select.appendChild(option);
    });

    select.value = buscarConta(selecaoAnterior) ? selecaoAnterior : '';
}

// Atualiza as contas disponíveis para transferência
function atualizarSelectsTransferencia() {
    const selectOrigem = document.getElementById('selectOrigem');
    const selectDestino = document.getElementById('selectDestino');

    if (!selectOrigem || !selectDestino) return;

    selectOrigem.innerHTML = '';
    selectDestino.innerHTML = '';

    const padraoOrigem = document.createElement('option');
    padraoOrigem.value = '';
    padraoOrigem.textContent = 'Selecione uma conta';

    selectOrigem.appendChild(padraoOrigem);

    const padraoDestino = document.createElement('option');
    padraoDestino.value = '';
    padraoDestino.textContent = 'Selecione uma conta';

    selectDestino.appendChild(padraoDestino);

    contas.forEach(conta => {
        const optionOrigem = document.createElement('option');

        optionOrigem.value = conta.numero;
        optionOrigem.textContent = conta.numero + ' — ' + conta.titular;

        selectOrigem.appendChild(optionOrigem);

        const optionDestino = document.createElement('option');

        optionDestino.value = conta.numero;
        optionDestino.textContent = conta.numero + ' — ' + conta.titular;

        selectDestino.appendChild(optionDestino);
    });
}

// Mostra saldo, limite, total e histórico da conta selecionada
function renderizarPainelConta() {
    const select = document.getElementById('selectConta');
    const conta = select ? buscarConta(select.value) : null;

    const saldoEl = document.getElementById('saldoAtual');
    const limiteEl = document.getElementById('limiteDisponivel');
    const totalEl = document.getElementById('totalDisponivel');
    const historico = document.getElementById('historico');

    if (!conta) {
        if (saldoEl) { saldoEl.textContent = '—'; saldoEl.classList.remove('saldo-negativo'); }
        if (limiteEl) limiteEl.textContent = '—';
        if (totalEl) totalEl.textContent = '—';
        if (historico) historico.innerHTML = '';
        return;
    }

    if (saldoEl) {
        saldoEl.textContent = formatarMoeda(conta.saldo);
        if (conta.saldo < 0) {
            saldoEl.classList.add('saldo-negativo');
        } else {
            saldoEl.classList.remove('saldo-negativo');
        }
    }
    if (limiteEl) limiteEl.textContent = formatarMoeda(conta.limite - calcularLimiteUsado(conta));
    if (totalEl) totalEl.textContent = formatarMoeda(calcularTotalDisponivel(conta));

    renderizarHistorico(conta);
}

// Monta a lista de movimentações da conta
function renderizarHistorico(conta) {
    const historico = document.getElementById('historico');
    if (!historico) return;
    historico.innerHTML = '';

    if (conta.movimentacoes.length === 0) {
        const vazio = document.createElement('div');
        vazio.className = 'vazio';
        vazio.textContent = 'Nenhuma movimentação registrada.';
        historico.appendChild(vazio);
        return;
    }

    conta.movimentacoes.forEach(mov => {
        const item = document.createElement('div');
        item.className = 'item ' + (mov.tipo === 'Depósito' ? 'mov-deposito' : (mov.tipo === 'Saque' ? 'mov-saque' : ''));

        const tipo = document.createElement('span');
        tipo.textContent = mov.tipo;

        const data = document.createElement('span');
        data.className = 'data';
        data.textContent = formatarData(mov.data);

        const valor = document.createElement('span');
        valor.className = 'valor-mov';
        valor.textContent = formatarMoeda(mov.valor);

        item.appendChild(tipo);
        item.appendChild(data);
        item.appendChild(valor);
        historico.appendChild(item);
    });
}

// Monta a tabela com todas as contas
function renderizarContas() {
    const corpo = document.getElementById('corpoTabela');
    if (!corpo) return;
    corpo.innerHTML = '';

    if (contas.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.textContent = 'Nenhuma conta cadastrada.';
        tr.appendChild(td);
        corpo.appendChild(tr);
        return;
    }

    contas.forEach(conta => {
        const tr = document.createElement('tr');

        const tdTitular = document.createElement('td');
        tdTitular.textContent = conta.titular;

        const tdNumero = document.createElement('td');
        tdNumero.textContent = conta.numero;

        const tdTipo = document.createElement('td');
        tdTipo.textContent = conta.tipo === 'especial' ? 'Especial' : 'Comum';

        const tdSaldo = document.createElement('td');
        tdSaldo.textContent = formatarMoeda(conta.saldo);

        const tdLimite = document.createElement('td');
        tdLimite.textContent = formatarMoeda(conta.limite);

        const tdTotal = document.createElement('td');
        tdTotal.textContent = formatarMoeda(calcularTotalDisponivel(conta));

        const tdAcao = document.createElement('td');
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.dataset.conta = conta.numero;
        botao.textContent = 'Movimentar';
        tdAcao.appendChild(botao);

        tr.appendChild(tdTitular);
        tr.appendChild(tdNumero);
        tr.appendChild(tdTipo);
        tr.appendChild(tdSaldo);
        tr.appendChild(tdLimite);
        tr.appendChild(tdTotal);
        tr.appendChild(tdAcao);
        corpo.appendChild(tr);
    });
}

// ============================================================
// ===== ÁREA DO ALUNO — IMPLEMENTE AS FUNÇÕES ABAIXO =========
// ============================================================

// Realiza um depósito na conta selecionada
function depositar() {
    const campo = document.getElementById('valorDeposito');
    const valor = Number(campo.value); 

    if (campo.value.trim() === '' || !Number.isFinite(valor) || valor <= 0) {
        exibirMensagem('msg-movimentacao', 'Digite um valor válido!', 'erro');
        return;
    }

    const conta = buscarConta(
        document.getElementById('selectConta').value
    );

    if (!conta) {
        exibirMensagem('msg-movimentacao', 'Selecione uma conta!', 'erro');
        return;
    }

    conta.saldo += valor;

    conta.movimentacoes.push({
        tipo: 'Depósito',
        valor: valor,
        data: new Date()
    });

    renderizarPainelConta();
    renderizarContas();

    campo.value = '';

    exibirMensagem('msg-movimentacao', 'Depósito realizado com sucesso!', 'sucesso');
}

// Realiza um saque na conta selecionada
function sacar() {
    const campo = document.getElementById('valorSaque');
    const valor = Number(campo.value);

    if(campo.value.trim() === '' || !Number.isFinite(valor) || valor <= 0) {
        exibirMensagem('msg-movimentacao', 'Digite um valor válido!', 'erro');
        return;
    }

    const conta = buscarConta(
        document.getElementById('selectConta').value
    );

    if (!conta) {
        exibirMensagem('msg-movimentacao', 'Selecione uma conta!', 'erro');
        return;
    }

    const totalDisponivel = calcularTotalDisponivel(conta);

    if(valor > totalDisponivel) {
        exibirMensagem('msg-movimentacao', 'Saldo insuficiente!', 'erro');
        return;
    }

    conta.saldo -= valor;

    conta.movimentacoes.push({
        tipo: 'Saque',
        valor: valor,
        data: new Date()
    });

    renderizarPainelConta();
    renderizarContas();

    campo.value = '';

    exibirMensagem('msg-movimentacao', 'Saque realizado com sucesso!', 'sucesso');
}

// Realiza transferências entre contas bancárias
function transferir() {
    const campo = document.getElementById('valorTransferencia');
    const valor = Number(campo.value);

    const numeroOrigem = document.getElementById('selectOrigem').value;
    const numeroDestino = document.getElementById('selectDestino').value;

    if(campo.value.trim() === '' || !Number.isFinite(valor) || valor <= 0) {
        exibirMensagem('msg-transferencia', 'Digite um valor válido!', 'erro');
        return;
    }

    const contaOrigem = buscarConta(numeroOrigem);

    if (!contaOrigem) {
        exibirMensagem('msg-transferencia', 'Selecione uma conta de origem!', 'erro');
        return;
    }

    const contaDestino = buscarConta(numeroDestino);

    if (!contaDestino) {
        exibirMensagem('msg-transferencia', 'Selecione uma conta de destino!', 'erro');
        return;
    }

    if (numeroOrigem === numeroDestino) {
        exibirMensagem('msg-transferencia', 'Não é permitido transferir para a mesma conta!', 'erro');
        return;
    }

    const totalDisponivel = calcularTotalDisponivel(contaOrigem);

    if (valor > totalDisponivel) {
        exibirMensagem('msg-transferencia', 'Saldo insuficiente para transferência!', 'erro');
        return;
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    contaOrigem.movimentacoes.push({
        tipo: 'Transferência enviada',
        valor: valor,
        data: new Date()
    });

    contaDestino.movimentacoes.push({
        tipo: 'Transferência recebida',
        valor: valor,
        data: new Date()
    });

    renderizarPainelConta();
    renderizarContas();

    campo.value = '';

    exibirMensagem('msg-transferencia', 'Transferência realizada com sucesso!', 'sucesso');
}

// ============================================================
// BLOCO 6 — INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // a) Listeners de navegação
    document.querySelectorAll('[data-tela]').forEach(botao => {
        botao.addEventListener('click', () => trocarTela(botao.dataset.tela));
    });

    // b) Cadastro de nova conta
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (evento) => {
            evento.preventDefault();
            limparMensagem('msg-cadastro');

            const nome = document.getElementById('nome').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            const numeroInformado = document.getElementById('numeroConta').value.trim();
            const tipoConta = document.getElementById('tipoConta');
            const campoLimite = document.getElementById('campo-limite');
            const inputLimite = document.getElementById('limite');
            const limiteInformado = inputLimite.value.trim();

            if (!nome) {
                exibirMensagem('msg-cadastro', 'Informe o nome do titular.', 'erro');
                return;
            }

            let limite = 0;
            if (tipoConta.value === 'especial') {
                limite = Number(limiteInformado);
                if (limiteInformado === '' || isNaN(limite) || limite < 0) {
                    exibirMensagem('msg-cadastro', 'Informe um limite numérico igual ou maior que zero.', 'erro');
                    return;
                }
            }

            let numero;
            if (numeroInformado === '') {
                numero = gerarNumeroConta();
            } else {
                numero = Number(numeroInformado);
                if (buscarConta(numero)) {
                    exibirMensagem('msg-cadastro', 'Já existe uma conta com este número.', 'erro');
                    return;
                }
            }

            contas.push({
                numero: numero,
                titular: nome,
                cpf: cpf,
                tipo: tipoConta.value,
                saldo: 0,
                limite: limite,
                movimentacoes: []
            });

            exibirMensagem('msg-cadastro', 'Conta ' + numero + ' cadastrada com sucesso!', 'sucesso');

            formCadastro.reset();
            tipoConta.value = 'comum';
            campoLimite.classList.add('oculto');
            inputLimite.value = '';

            renderizarContas();
            atualizarSelectContas();
            atualizarSelectsTransferencia();
            renderizarPainelConta();
        });
    }

    // c) Mostrar ou esconder o campo de limite conforme o tipo de conta
    const tipoContaSelect = document.getElementById('tipoConta');
    if (tipoContaSelect) {
        tipoContaSelect.addEventListener('change', () => {
            const campoLimite = document.getElementById('campo-limite');
            const inputLimite = document.getElementById('limite');
            if (tipoContaSelect.value === 'especial') {
                campoLimite.classList.remove('oculto');
            } else {
                campoLimite.classList.add('oculto');
                inputLimite.value = '';
            }
        });
    }

    // d) Clique em "Movimentar" na tabela de contas (delegação de evento)
    const corpoTabela = document.getElementById('corpoTabela');
    if (corpoTabela) {
        corpoTabela.addEventListener('click', (evento) => {
            const botao = evento.target.closest('[data-conta]');
            if (botao) {
                document.getElementById('selectConta').value = botao.dataset.conta;
                trocarTela('tela-movimentacoes');
                renderizarPainelConta();
            }
        });
    }

    // e) Troca de conta no seletor
    const selectConta = document.getElementById('selectConta');
    if (selectConta) {
        selectConta.addEventListener('change', renderizarPainelConta);
    }

    // f) Formulário de depósito
    const formDeposito = document.getElementById('form-deposito');
    if (formDeposito) {
        formDeposito.addEventListener('submit', (evento) => {
            evento.preventDefault();
            depositar();
        });
    }

    // g) Formulário de saque
    const formSaque = document.getElementById('form-saque');
    if (formSaque) {
        formSaque.addEventListener('submit', (evento) => {
            evento.preventDefault();
            sacar();
        });
    }

    // h) Formulário de transferência
    const formTransferencia = document.getElementById('form-transferencia');
    if (formTransferencia) {
        formTransferencia.addEventListener('submit', (evento) => {
            evento.preventDefault();
            transferir();
        });
    }

    // i) Chamadas finais de inicialização
    atualizarDataHora();
    atualizarSelectContas();
    atualizarSelectsTransferencia();
    renderizarContas();
    renderizarPainelConta();
    trocarTela('tela-menu');
});
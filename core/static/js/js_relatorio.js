const receita_bruta = document.getElementById('receita-bruta');
const ticket = document.getElementById('ticket');
const total_pedidos = document.getElementById('total-pedidos');
const dinheiro_pagar = document.getElementById('dinheiro-pagar');
const pix_pagar = document.getElementById('pix-pagar');
const credito_pagar = document.getElementById('credito-pagar');
const itens_vendidos = document.getElementById('itens-vendidos');
const horario_de_pico = document.getElementById('horario-de-pico');
const lista_produto_vendas = document.getElementById('lista');
const itens_estoque = document.getElementById('itens-estoque');
const alerta_ruptura = document.getElementById('alerta-ruptura');
const cliente_ativos = document.getElementById('cliente-ativos');
const cliente_lista = document.getElementById('cliente-lista');
const btn_filtrar = document.getElementById('btn-filtrar');

const formatarMoeda = (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function atualizar_tela(data) {

    // --- Financeiro ---
    receita_bruta.innerHTML = formatarMoeda(data.financeiro.receita_bruta);
    ticket.innerHTML = formatarMoeda(data.financeiro.ticket_medio);
    total_pedidos.innerHTML = data.financeiro.total_pedidos;

    let valDinheiro = 0, valPix = 0, valCredito = 0;

    data.financeiro.meio_pagamento.forEach(item => {
        const nomeMeio = item.meio.toLowerCase();
        if (nomeMeio.includes('dinheiro')) valDinheiro += item.total;
        else if (nomeMeio.includes('pix')) valPix += item.total;
        else valCredito += item.total;
    });

    dinheiro_pagar.innerHTML = formatarMoeda(valDinheiro);
    pix_pagar.innerHTML = formatarMoeda(valPix);
    credito_pagar.innerHTML = formatarMoeda(valCredito);

    // --- Vendas e Operação ---
    itens_vendidos.innerHTML = data.vendas_operacao.itens_vendidos;
    horario_de_pico.innerHTML = data.vendas_operacao.horario_pico;

    lista_produto_vendas.innerHTML = '';
    if (data.vendas_operacao.produtos_mais_vendidos.length === 0) {
        lista_produto_vendas.innerHTML = '<tr><td colspan="2">Nenhum produto encontrado</td></tr>';
    } else {
        data.vendas_operacao.produtos_mais_vendidos.forEach(produto => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.qtd}</td>
            `;
            lista_produto_vendas.appendChild(linha);
        });
    }

    // --- Estoque ---
    itens_estoque.innerHTML = `${data.estoque.itens_em_estoque} un.`;
    alerta_ruptura.innerHTML = `${data.estoque.alertas_ruptura} Itens`;

    // --- Fidelidade de Clientes ---
    cliente_ativos.innerHTML = data.fidelidade_clientes.clientes_ativos;

    cliente_lista.innerHTML = '';
    if (data.fidelidade_clientes.top_clientes.length === 0) {
        cliente_lista.innerHTML = '<tr><td colspan="3">Nenhum cliente encontrado</td></tr>';
    } else {
        data.fidelidade_clientes.top_clientes.forEach(cliente => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.total_pedidos}</td>
                <td>${formatarMoeda(cliente.total_gasto)}</td>
            `;
            cliente_lista.appendChild(linha);
        });
    }
}

async function carregar_tela() {
    const inputDE = document.getElementById("data_inicio").value;
    const inputATE = document.getElementById("data_fim").value;

    const url = new URL('pegar_relatorio/', window.location.origin);

    if (inputDE) url.searchParams.append('de', inputDE);
    if (inputATE) url.searchParams.append('ate', inputATE);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.sucesso) {
            console.log("dados carregados com sucesso");
            console.log(data);
            atualizar_tela(data);
        } else {
            alert("[err]: erro ao carregar os dados");
        }
    } catch (erro) {
        console.error("erro ao buscar relatório:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregar_tela();
    btn_filtrar.addEventListener("click", carregar_tela);
});
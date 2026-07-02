document.addEventListener("DOMContentLoaded", () => {

let total = 0;

const botoesFiltro = document.querySelectorAll(".filter-btn");
const produtos = document.querySelector(".products-grid");
const carrinho = document.querySelector(".cart-list");

const totalDisplay = document.getElementById("total-value");

const addArea = document.getElementById("add-product-area");
const gridProdutos = document.querySelector(".products-grid");


// FILTRO DE PRODUTOS

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");

        const filtro = botao.dataset.filter;

        if (filtro === "add") {

            gridProdutos.style.display = "none";
            addArea.style.display = "block";
            return;

        }

        gridProdutos.style.display = "grid";
        addArea.style.display = "none";

        const cards = document.querySelectorAll(".product-card");

        cards.forEach(produto => {

            if (filtro === "todos") {
                produto.style.display = "flex";
            }
            else if (produto.classList.contains(filtro)) {
                produto.style.display = "flex";
            }
            else {
                produto.style.display = "none";
            }

        });

    });

});


// ADICIONAR ITEM AO PEDIDO

produtos.addEventListener("click", (event) => {

    const botao = event.target.closest(".add-item-btn");

    if (!botao) return;

    const nome = botao.dataset.name;
    const preco = parseFloat(botao.dataset.price);

    let itemExistente = carrinho.querySelector(`[data-name="${nome}"]`);

    if (itemExistente) {

        let quantidade = parseInt(itemExistente.dataset.qtd);
        quantidade++;

        itemExistente.dataset.qtd = quantidade;

        itemExistente.querySelector(".item-qtd").textContent = quantidade + "x";

        const novoTotal = quantidade * preco;

        itemExistente.querySelector(".item-preco").textContent =
            novoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    } else {

        const item = document.createElement("div");
        item.classList.add("cart-item");

        item.dataset.name = nome;
        item.dataset.qtd = 1;

        item.innerHTML = `
            <span class="item-qtd">1x</span> ${nome}
            <strong class="item-preco">${preco.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</strong>
        `;

        carrinho.appendChild(item);

    }

    total += preco;

    totalDisplay.textContent =
        total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

});


// PAGAMENTO

let metodoPagamento = "Dinheiro";

const botoesPagamento = document.querySelectorAll(".method-btn");

botoesPagamento.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesPagamento.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");

        metodoPagamento = botao.textContent;

    });

});

// TROCO

const inputRecebido = document.getElementById("valor-recebido");
const trocoDisplay = document.getElementById("troco-value");

inputRecebido.addEventListener("input", () => {

    const recebido = parseFloat(inputRecebido.value);

    if (isNaN(recebido)) {

        trocoDisplay.textContent = "R$ 0,00";
        return;
    }

    const troco = recebido - total;

    trocoDisplay.textContent = troco >= 0
        ? troco.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
        : "R$ 0,00";

});


// CADASTRAR NOVO PRODUTO

const btnAddProduto = document.getElementById("btn-add-produto");

btnAddProduto.addEventListener("click", () => {

    const nome = document.getElementById("novo-nome").value;
    const preco = document.getElementById("novo-preco").value;
    const tipo = document.getElementById("novo-tipo").value;

    if (!nome || !preco) {
        alert("Preencha todos os campos");
        return;
    }

    const produto = document.createElement("div");
    produto.classList.add("product-card", tipo);

    produto.innerHTML = `
        <div class="product-det">
            <h4>${nome}</h4>
            <span class="item-price">R$ ${parseFloat(preco).toFixed(2)}</span>
        </div>

        <button class="add-item-btn" data-name="${nome}" data-price="${preco}">
            <i class="fas fa-plus"></i>
        </button>
    `;

    gridProdutos.appendChild(produto);

    document.getElementById("novo-nome").value = "";
    document.getElementById("novo-preco").value = "";

});

});

function salvarProdutos() {

    const produtos = [];

    document.querySelectorAll(".product-card").forEach(produto => {

        const nome = produto.querySelector("h4").textContent;
        const preco = produto.querySelector(".item-price").textContent.replace("R$","").trim();
        const tipo = produto.classList.contains("lanche") ? "lanche" : "bebida";

        produtos.push({
            nome,
            preco,
            tipo
        });

    });

    localStorage.setItem("produtosSIGL", JSON.stringify(produtos));

}

function carregarProdutos() {

    const produtosSalvos = JSON.parse(localStorage.getItem("produtosSIGL"));

    if(!produtosSalvos) return;

    const grid = document.querySelector(".products-grid");

    grid.innerHTML = "";

    produtosSalvos.forEach(prod => {

        const produto = document.createElement("div");
        produto.classList.add("product-card", prod.tipo);

        produto.innerHTML = `
            <div class="product-det">
                <h4>${prod.nome}</h4>
                <span class="item-price">R$ ${prod.preco}</span>
            </div>

            <button class="add-item-btn" data-name="${prod.nome}" data-price="${prod.preco}">
                <i class="fas fa-plus"></i>
            </button>
        `;

        grid.appendChild(produto);

    });

}
const btnFinalizar = document.querySelector(".btn-finalize-order:last-of-type");

btnFinalizar.addEventListener("click", async (event) => {
    event.preventDefault();

    const itensCarrinho = [...document.querySelectorAll(".cart-item")].map(item => ({
        nome: item.dataset.name,
        quantidade: parseInt(item.dataset.qtd)
    }));

    if (itensCarrinho.length === 0) {
        alert("Adicione ao menos um item ao pedido.");
        return;
    }

    const clienteId = document.querySelector('select[name="cliente"]').value;
    const observacoes = document.getElementById("observacoes").value;
    const valorRecebido = parseFloat(document.getElementById("valor-recebido").value) || 0;

    const dados = {
        itens: itensCarrinho,
        cliente_id: clienteId || null,
        observacoes: observacoes,
        forma_pagamento: document.querySelector(".method-btn.active").textContent.trim(),
        valor_recebido: valorRecebido,
        total: total
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const resposta = await fetch("/finalizar-pedido/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            window.location.href = resultado.redirect_url;
        } else {
            alert(resultado.erro || "Erro ao finalizar pedido.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao finalizar pedido.");
    }
});
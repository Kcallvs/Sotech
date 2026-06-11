document.addEventListener("DOMContentLoaded", () => {

const tabela = document.querySelector(".inventory-table tbody");
const busca = document.querySelector(".search-input");

const itensCriticos = document.querySelector(".summary-card:nth-child(1) strong");
const itensVencendo = document.querySelector(".summary-card:nth-child(2) strong");
const totalItens = document.querySelector(".summary-card:nth-child(3) strong");


// =========================
// FILTRO DE BUSCA
// =========================

busca.addEventListener("input", () => {

    const valor = busca.value.toLowerCase();

    document.querySelectorAll(".inventory-table tbody tr").forEach(linha => {

        const texto = linha.textContent.toLowerCase();

        linha.style.display = texto.includes(valor) ? "" : "none";

    });

});


// =========================
// FUNÇÃO VERIFICAR VALIDADE
// =========================

function verificarValidade(dataValidade){

    const hoje = new Date();

    const partes = dataValidade.split("/");
    const validade = new Date(partes[2], partes[1]-1, partes[0]);

    const diferenca = validade - hoje;

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

    if(dias < 0){
        return "critico";
    }

    if(dias <= 7){
        return "vencendo";
    }

    return "normal";

}


// =========================
// ATUALIZAR STATUS
// =========================

function atualizarStatus(){

    const linhas = document.querySelectorAll(".inventory-table tbody tr");

    linhas.forEach(linha => {

        const data = linha.children[4].textContent;

        const status = verificarValidade(data);

        const badge = linha.querySelector(".badge");

        if(status === "critico"){
            badge.textContent = "Crítico";
            badge.className = "badge red";
        }

        if(status === "vencendo"){
            badge.textContent = "Vencendo";
            badge.className = "badge yellow";
        }

        if(status === "normal"){
            badge.textContent = "Normal";
            badge.className = "badge green";
        }

    });

}


// =========================
// ATUALIZAR RESUMO
// =========================

function atualizarResumo(){

    const linhas = document.querySelectorAll(".inventory-table tbody tr");

    let criticos = 0;
    let vencendo = 0;

    linhas.forEach(linha => {

        const status = linha.querySelector(".badge").textContent;

        if(status.includes("Crítico")) criticos++;

        if(status.includes("Vencendo")) vencendo++;

    });

    itensCriticos.textContent = criticos;
    itensVencendo.textContent = vencendo;
    totalItens.textContent = linhas.length;

}


// =========================
// EXECUTAR AO CARREGAR
// =========================

atualizarStatus();
atualizarResumo();


// =========================
// ATUALIZAR QUANTIDADE
// =========================

tabela.addEventListener("click", (e)=>{

const botao = e.target.closest(".fa-sync");

if(!botao) return;

const linha = botao.closest("tr");

let qtd = linha.children[2].textContent;
qtd = parseInt(qtd);

const novaQtd = prompt("Nova quantidade:", qtd);

if(novaQtd !== null){

linha.children[2].textContent = novaQtd + " un";

}

});


// =========================
// EDITAR PRODUTO
// =========================

tabela.addEventListener("click", (e)=>{

const botao = e.target.closest(".fa-edit");

if(!botao) return;

const linha = botao.closest("tr");

const nome = linha.children[0].textContent;
const categoria = linha.children[1].textContent;

const novoNome = prompt("Editar nome:", nome);
const novaCategoria = prompt("Editar categoria:", categoria);

if(novoNome) linha.children[0].innerHTML = "<strong>"+novoNome+"</strong>";
if(novaCategoria) linha.children[1].textContent = novaCategoria;

});



// =========================
// MODAL - ENTRADA DE MATERIAL
// =========================

const btnEntrada = document.getElementById("btnEntrada");
const modal = document.getElementById("modalCliente");
const btnCancelar = document.getElementById("btnCancelar");
const form = document.getElementById("formEntrada");

// abrir modal
btnEntrada.addEventListener("click", () => {
    modal.style.display = "flex";
});

// fechar modal
btnCancelar.addEventListener("click", () => {
    modal.style.display = "none";
});

// fechar clicando fora
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// submit do modal
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const categoria = document.getElementById("categoria").value;
    const qtd = document.getElementById("qtd").value;
    const ideal = document.getElementById("ideal").value;
    const validade = document.getElementById("validade").value;

    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td><strong>${nome}</strong></td>
        <td>${categoria}</td>
        <td>${qtd} un</td>
        <td>${ideal} un</td>
        <td>${validade}</td>
        <td><span class="badge green">Normal</span></td>
        <td>
            <button class="action-icon"><i class="fas fa-sync"></i></button>
            <button class="action-icon"><i class="fas fa-edit"></i></button>
        </td>
    `;

    tabela.appendChild(linha);

    atualizarStatus();
    atualizarResumo();

    form.reset();
    modal.style.display = "none";
});

});
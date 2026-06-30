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
        hoje.setHours(0, 0, 0, 0);
    
        let validade;
    
        // Aceita tanto "dd/mm/yyyy" (texto na tabela) quanto "yyyy-mm-dd" (input type="date")
        if (dataValidade.includes("/")) {
            const partes = dataValidade.split("/");
            validade = new Date(partes[2], partes[1] - 1, partes[0]);
        } else if (dataValidade.includes("-")) {
            const partes = dataValidade.split("-");
            validade = new Date(partes[0], partes[1] - 1, partes[2]);
        } else {
            // formato desconhecido, evita "Invalid Date" quebrando o resto
            return "normal";
        }
    
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
    
    // Checagem defensiva: se algum elemento não existir, avisa no console
    // em vez de travar silenciosamente o resto do script.
    if (!btnEntrada) console.error('Elemento #btnEntrada não encontrado no HTML.');
    if (!modal) console.error('Elemento #modalCliente não encontrado no HTML.');
    if (!btnCancelar) console.error('Elemento #btnCancelar não encontrado no HTML.');
    
    if (btnEntrada && modal && btnCancelar) {
    
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
    
        // só fecha o modal ao enviar, sem mexer na tabela
        // (tira esse listener se quiser que o form realmente faça o POST pro Django)
        if (form) {
            form.addEventListener("submit", () => {
                modal.style.display = "none";
            });
        }
    
    }
    
    });
// VERIFICAR VALIDADE 
function verificarValidade(dataValidadeStr) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = dataValidadeStr.split("-");
    const validade = new Date(ano, mes - 1, dia);
    const dias = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

    if (dias < 0) return ["Crítico", "badge red"];
    if (dias <= 7) return ["Vencendo", "badge yellow"];
    return ["Normal", "badge green"];
}


document.addEventListener("DOMContentLoaded", () => {

    const busca = document.querySelector(".search-input");
    const listaItems = document.getElementById("estoque_lista");

    const totalEl = document.getElementById("total");
    const criticoEl = document.getElementById("critico");
    const vencendoEl = document.getElementById("vencendo");


    // STATUS + RESUMO 

    function atualizarStatusEResumo() {
        const linhas = listaItems.querySelectorAll("tr[data-validade]");

        let criticos = 0;
        let vencendo = 0;

        linhas.forEach(linha => {
            const [texto, classe] = verificarValidade(linha.dataset.validade);
            const badge = linha.querySelector(".status-badge");

            if (badge) {
                badge.textContent = texto;
                badge.className = classe + " status-badge";
            }

            if (texto === "Crítico") criticos++;
            if (texto === "Vencendo") vencendo++;
        });

        if (totalEl) totalEl.textContent = linhas.length;
        if (criticoEl) criticoEl.textContent = criticos;
        if (vencendoEl) vencendoEl.textContent = vencendo;
    }

    atualizarStatusEResumo();


    // FILTRO DE BUSCA 

    if (busca) {
        busca.addEventListener("keyup", () => {
            const termo = busca.value.toLowerCase();
            const linhas = listaItems.querySelectorAll("tr[data-validade]");

            linhas.forEach(linha => {
                const texto = linha.textContent.toLowerCase();
                linha.style.display = texto.includes(termo) ? "" : "none";
            });
        });
    }

});
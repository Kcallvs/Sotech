document.addEventListener("DOMContentLoaded", () => {

    const botoesStatus = document.querySelectorAll(".btn-status");

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
        || document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];

    botoesStatus.forEach(botao => {

        botao.addEventListener("click", async () => {

            const id = botao.dataset.id;
            const novoStatus = botao.dataset.novoStatus;

            try {
                const resposta = await fetch(`/pedido/status/${id}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrftoken
                    },
                    body: JSON.stringify({ status: novoStatus })
                });

                const resultado = await resposta.json();

                if (resultado.sucesso) {
                    window.location.reload();
                } else {
                    alert(resultado.erro || "Erro ao atualizar status.");
                }
            } catch (erro) {
                console.error(erro);
                alert("Erro ao atualizar status.");
            }

        });

    });

});
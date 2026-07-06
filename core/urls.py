
from django.urls import path
from .views import *

urlpatterns = [
    #rota, view resposável, nome de referência
    
    path('',inicio,name="inicio"),

    path('sair/',sair,name="sair"),
    
    path('login/',autenticar,name="login"),

    path('cadastro/', cadastro, name="cadastro"),
    path('dashboard/',dashboard,name="dashboard"),

    path('pedido/status/<int:id>/', atualizar_status_pedido, name='atualizar_status_pedido'),


    path('pedido/',novo_pedido,name="pedido"),
    path('produto_remover/<int:id>/',produto_remover,name="produto_remover"),

    path('finalizar-pedido/', finalizar_pedido, name='finalizar_pedido'),
    path('historico/',historico,name="historico"),
    path('estoque/',estoque,name="estoque"),
    path('clientes/',clientes,name="clientes"),
    path('funcionarios/',funcionarios,name="funcionarios"),
    path('relatorio/',relatorio,name="relatorio"),

    path("cliente_editar/<int:id>/",cliente_editar,name="cliente_editar"),
    path("cliente_remover/<int:id>/",cliente_remover,name="cliente_remover"),

    # por enquanto vai ser assim talvez a gente mude pra id em numero
    path("funcionario_remover/<str:id>/",funcionario_remover,name="funcionario_remover"),

    path('perfil/',perfil,name="perfil"),

    path('pegar_estoque/',pegar_estoque,name="pegar_estoque")
]

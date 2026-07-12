
from django import views
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
    path('estoque/<int:pk>/editar/',estoque_editar, name='estoque_editar'),
    path('estoque/<int:pk>/remover/',estoque_remover, name='estoque_remover'),
   
    
    path('relatorio/',relatorio,name="relatorio"),

    path('clientes/',clientes,name="clientes"),
    path("cliente_editar/<int:id>/",cliente_editar,name="cliente_editar"),
    path("cliente_remover/<int:id>/",cliente_remover,name="cliente_remover"),


    path('funcionarios/',funcionarios,name="funcionarios"),
    path("funcionario_editar/<str:id>/",funcionario_editar,name="funcionario_editar"),
    path("funcionario_remover/<str:id>/",funcionario_remover,name="funcionario_remover"),

    path('perfil/',perfil,name="perfil"),

    path('pegar_estoque/',pegar_estoque,name="pegar_estoque"),
    path('pegar_relatorio/',relatorios_gerais,name="pegar_relatorio")

]

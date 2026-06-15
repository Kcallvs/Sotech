
from django.urls import path
from .views import *

urlpatterns = [
    #rota, view resposável, nome de referência
    
    path('',inicio,name="inicio"),
    path('login/',login,name="login"),
    path('cadastro/',cadastro,name="cadastro"),
    path('dashboard/',dashboard,name="dashboard"),
    path('perfil/',perfil,name="perfil"),
    path('pedido/',novo_pedido,name="pedido"),
    path('historico/',historico,name="historico"),
    path('estoque/',estoque,name="estoque"),
    path('clientes/',clientes,name="clientes"),
    path('funcionarios/',funcionarios,name="funcionarios"),
    path('relatorio/',relatorio,name="relatorio"),
    path("cliente_editar/<int:id>/",cliente_editar,name="cliente_editar"),
    path("cliente_remover/<int:id>/",cliente_remover,name="cliente_remover")
]

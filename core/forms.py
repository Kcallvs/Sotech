from django import forms
from .models import Funcionario, Cliente,Produto,Estoque
# from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

class FuncionarioFormCadastro(UserCreationForm):
    class Meta:
        model =  Funcionario
        fields = ['first_name','last_name','cargo','turno','cpf','username','telefone']

class EstoqueForm(forms.ModelForm):
    class Meta:
        model = Estoque
        fields = ["nome","categoria","lote","quantidade","tamanho_estoque","validade"]
    

class ProdutoForm(forms.ModelForm):
    class Meta:
        model = Produto
        fields = ['nome', 'preco', 'categoria', 'estoque']

class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = ['id','nome','telefone','endereco']

        widgets={
            
            'nome' : forms.TextInput(attrs={
                'placeholder' : 'Nome Completo'
            }),

            'endereco' : forms.TextInput(attrs={
                'placeholder' : 'Endereço Completo'
            }),

            'telefone' : forms.TextInput(attrs={
                'placeholder' : 'Telefone (XX) XXXXX-XXXX'
            })
        }

# class FuncionarioForm(forms.ModelForm):
#     class meta:
#         model = Funcionario
#         fields = ['cargo','turno','cpf']

        

        
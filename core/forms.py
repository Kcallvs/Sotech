from django import forms
from .models import Cliente,Produto
# from django.contrib.auth import get_user_model
# from django.contrib.auth.forms import UserCreationForm, UserChangeForm

# CustomUser = get_user_model()


class ProdutoForm(forms.ModelForm):
    class Meta:
        model = Produto
        fields = ['nome','preco','categoria']

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

        

        
from django import forms
from .models import Cliente,Produto,Estoque
# from django.contrib.auth import get_user_model
# from django.contrib.auth.forms import UserCreationForm, UserChangeForm

# CustomUser = get_user_model()



# class FuncionarioForm(forms.ModelForm):
#     class Meta:
#         model =  Funcionario
#         fiels = ['fist_name','last_name','cargo','turno','cpf','password']
       
#         widgets = {
#             'password': forms.PasswordInput(),
#         }

class EstoqueForm(forms.ModelForm):
    class Meta:
        model = Estoque
        fields = []
    

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

        

        
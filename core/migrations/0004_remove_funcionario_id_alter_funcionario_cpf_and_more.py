from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_remove_estoque_localizacao_estoque_nome'),
    ]

    operations = [
        migrations.AlterField(
            model_name='funcionario',
            name='cpf',
            field=models.CharField(max_length=14, verbose_name='CPF'),
        ),
        migrations.AlterField(
            model_name='funcionario',
            name='turno',
            field=models.CharField(max_length=30, verbose_name='Turno'),
        ),
    ]

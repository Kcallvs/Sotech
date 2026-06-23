# SOTECH

[soluções tecnológicas]

O Sotech é um sistema de gerenciamento desenvolvido para pequenos estabelecimentos do ramo alimentício, especialmente lanchonetes.


para usar o sistema é recomendado o uso de um venv junto ao
arquivo dependencias.txt para instalar <b>dependencias</b>

```
python -m venv venv
venv\Scripts\activate
pip install -r dependencias.txt
```

para modificações em relação as tabelas do banco de dados...


```
python manage.py makemigrations
python manage.py migrate
```

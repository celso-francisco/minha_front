# Use uma image base com um servidor web(por exemplo, Ngnix)
# O nginex é um servidor leve e de código fonte aberto para realizar equisições HTTP
FROM nginx:latest

# Copia os arquivos necessários para executar o programa para p servidor web
COPY . /usr/share/nginx/html

# O Nginx expoe a porta por padrão, onde o servidor irá rodar
EXPOSE 80

# comando para iniciar o servidor web Nginx em primeiro plano
CMD [ "nginx", "-g", "daemon off;" ]
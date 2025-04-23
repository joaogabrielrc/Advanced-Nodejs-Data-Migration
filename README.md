# Advanced Node.js Data Migration

Este projeto demonstra técnicas avançadas de manipulação de dados e streaming em Node.js, com foco em operações de leitura, escrita e migração de dados entre sistemas. Ele utiliza o PostgreSQL como banco de dados e explora diferentes abordagens para lidar com grandes volumes de dados de forma eficiente.

## Estrutura do Projeto

Abaixo está a estrutura do projeto e uma breve descrição de cada diretório:

## Tecnologias Utilizadas

- **Node.js**: Plataforma para execução de código JavaScript no servidor.
- **PostgreSQL**: Banco de dados relacional utilizado para armazenar e manipular os dados.
- **Docker**: Ferramenta para criar e gerenciar contêineres, usada para configurar o PostgreSQL.
- **Express**: Framework para criação de servidores HTTP.
- **pg**: Biblioteca para interação com o PostgreSQL.
- **pg-cursor**: Biblioteca para manipulação de cursores no PostgreSQL.
- **pg-query-stream**: Biblioteca para streaming de consultas no PostgreSQL.
- **pg-copy-streams**: Biblioteca para operações de cópia no PostgreSQL.

## Funcionalidades

1. **Leitura de Arquivos**:
   - Leitura síncrona e assíncrona de arquivos grandes para entender as diferenças de desempenho.

2. **Streaming de Dados entre Aplicações Web**:
   - Demonstração de como transmitir dados entre um servidor e um cliente usando streams.

3. **Inserção de Dados no PostgreSQL**:
   - Diferentes abordagens para inserir grandes volumes de dados, incluindo:
     - Inserção comum.
     - Inserção em lotes (batch insert).
     - Inserção usando `COPY` com streams.

4. **Exportação de Dados do PostgreSQL**:
   - Exportação de grandes volumes de dados usando:
     - `pg-cursor` para manipulação de cursores.
     - `pg-query-stream` para streaming de consultas.

5. **Migração de Dados JSON entre Bancos PostgreSQL**:
   - Exportação e importação de dados em formato JSON entre bancos PostgreSQL usando streams.

## Como Executar

1. **Configurar o Banco de Dados**:
   - Certifique-se de que o Docker está instalado.
   - Execute o comando abaixo para iniciar o PostgreSQL:
     ```sh
     docker compose up -d --build
     ```

2. **Instalar Dependências**:
   - Instale as dependências do projeto:
     ```sh
     npm install
     ```

3. **Executar os Exemplos**:
   - Navegue até o diretório desejado e execute os scripts com Node.js:
     ```sh
     node <nome-do-arquivo>.js
     ```

4. **Testar os Servidores**:
   - Use ferramentas como `curl` ou navegadores para acessar os endpoints expostos pelos servidores.

## Exemplos de Execução

### Exportação de Dados com `pg-cursor`
```sh
curl -X GET -o output.file http://localhost:3000/export

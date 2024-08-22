# RPG Online - Versão 0.1

## Descrição do Projeto
Este projeto é um RPG online baseado em HTML, onde os jogadores podem criar personagens, lutar contra monstros, usar habilidades e itens, e progredir em nível. O jogo está sendo desenvolvido com foco em funcionalidades básicas inicialmente, com melhorias e polimentos planejados para etapas futuras.

## Funcionalidades Implementadas

### 1. Sistema de Registro e Login
- **Registro de Usuário**: Os usuários podem se registrar com um nome de usuário e senha.
- **Login**: Os usuários podem fazer login com as credenciais registradas.

### 2. Criação de Personagens
- **Criação de Personagens**: Os usuários podem criar personagens escolhendo nome, raça e classe.

### 3. Sistema de Combate
- **Combate Básico**: Personagens podem iniciar um combate contra um monstro gerado aleatoriamente.
- **Sistema de Turnos**: Combate em turnos onde o personagem e o monstro se alternam para atacar.

### 4. Habilidades e Itens
- **Habilidades**: Implementação básica de habilidades que podem ser usadas durante o combate.
- **Itens**: Sistema inicial para uso de itens durante o combate.

## Próximas Etapas
- **Aprimoramento do Sistema de Habilidades e Itens**: Gerenciar o `characterId` de forma dinâmica durante o combate.
- **Implementação de Ganho de Experiência e Progressão de Nível**: Adicionar sistema de experiência e progressão de nível.
- **Testes e Correções**: Testar completamente as funcionalidades implementadas e corrigir possíveis bugs.

## Instruções para Execução
1. Instale as dependências com `npm install`.
2. Execute o servidor com `node server.js`.
3. Acesse as funcionalidades através das URLs fornecidas:
   - Registro: `http://localhost:3000/register`
   - Login: `http://localhost:3000/login`
   - Criação de Personagem: `http://localhost:3000/create-character`
   - Listar Personagens: `http://localhost:3000/list-characters`
   - Combate: `http://localhost:3000/combat`

## Estrutura de Pastas
- `node_modules/` - Dependências do projeto
- `server.js` - Arquivo principal do servidor
- `public/` - Arquivos HTML separados para cada funcionalidade

## Histórico de Versões
- **Versão 0.1**: Implementação inicial com registro, login, criação de personagens, sistema de combate básico, e mecânicas de habilidades e itens.

## Contribuição
- Discussões sobre melhorias e novos recursos são bem-vindas. Sinta-se à vontade para abrir discussões ou enviar pull requests.

## Licença
Este projeto está licenciado sob a ISC License.

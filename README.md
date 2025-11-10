# SSO Gov.br - Autenticação com NestJS

## O que é SSO Gov.br?

O SSO (Single Sign-On) Gov.br é um serviço de autenticação único fornecido pelo governo brasileiro. Permite que usuários façam login em aplicações usando suas credenciais governamentais, como CPF e senha, de forma segura e padronizada. Utiliza OAuth 2.0 com OpenID Connect para autenticação federada.

Este projeto implementa uma integração pura (sem bibliotecas externas específicas) com o SSO Gov.br usando NestJS, incluindo PKCE para maior segurança.

## Instalação

1. Clone o repositório:
   ```
   git clone <url-do-repositorio>
   cd nestjs-sso-govbr
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env` (veja seção de configuração).

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
GOVBR_URL_PROVIDER=https://sso.staging.acesso.gov.br
GOVBR_URL_SERVICE=https://api.staging.acesso.gov.br
GOVBR_REDIRECT_URI=http://app.localhost/openid
GOVBR_SCOPES=openid+email+phone+profile
GOVBR_CLIENT_ID=app.dth.mdic.gov.br
GOVBR_CLIENT_SECRET=
GOVBR_LOGOUT_URI=http://app.localhost/logout/govbr
```

Ajuste os valores conforme seu ambiente (staging ou produção).

## Uso

### Rotas Disponíveis

- `GET /`: Redireciona para `/user`
- `GET /user`: Retorna informações do usuário logado (JSON) ou erro 401 se não logado
- `GET /login`: Inicia o processo de login, redirecionando para o Gov.br
- `GET /openid`: Callback do Gov.br após autenticação
- `GET /logout`: Faz logout e redireciona para logout do Gov.br
- `GET /logout/govbr`: Callback de logout, redireciona para /

### Exemplo de Uso

1. Acesse `/login` para iniciar login.
2. Após autenticação, será redirecionado para `/`.
3. Acesse `/user` para ver os dados do usuário.

## Estrutura do Projeto

- `src/app/domain/`: Entidades de domínio (ex: GovBrUser)
- `src/app/application/services/`: Lógica de negócio (GovBrPureService)
- `src/app/infrastructure/`: Utilitários (PKCE)
- `src/app/presentation/controllers/`: Controllers REST (OAuthController)

## Desenvolvimento

Para rodar em modo desenvolvimento:
```
npm run start:dev
```

Para build:
```
npm run build
```

Para testes:
```
npm run test
```

## Contribuição

Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto é open source. Verifique a licença específica.

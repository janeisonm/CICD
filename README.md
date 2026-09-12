# Gestão Estratégica - Coordenadoria de Inovações e Culturas Digitais

Plataforma de monitoramento, indicadores, linha do tempo e prestação de contas.

---

## 🚀 Como Executar em Máquina Local (Passo a Passo)

### 1. Pré-requisito
Certifique-se de ter o **Node.js** (versão 18 ou superior) instalado no computador.
- Caso não tenha: baixe e instale pelo site oficial: [https://nodejs.org](https://nodejs.org) (versão LTS recomendada).

---

### 2. Passo a Passo no Terminal (Windows, macOS ou Linux)

Abra a pasta do projeto no Terminal (ou Prompt de Comando / PowerShell no Windows) e execute:

#### **Passo 1: Instalar as dependências** (apenas na primeira vez)
```bash
npm install
```

#### **Passo 2: Iniciar o servidor local**
```bash
npm run dev
```

#### **Passo 3: Acessar a aplicação**
O terminal exibirá o endereço local. Abra o seu navegador (Chrome, Edge, Firefox) e acesse:
👉 **`http://localhost:3000`**

---

### 💡 Alternativa Rápida no Windows:
Se estiver usando o Windows, basta dar dois cliques no arquivo **`iniciar_local.bat`** incluído na raiz da pasta. Ele instalará as dependências automaticamente e abrirá o sistema.

---

### ⚠️ Dica Importante:
Por se tratar de uma aplicação moderna desenvolvida em **React + TypeScript + Vite**, ela precisa ser executada através do comando `npm run dev` (ou de um servidor local como `npm run preview`). 

Dar duplo clique diretamente no arquivo `index.html` não carrega a aplicação pois os navegadores bloqueiam módulos TypeScript e scripts modernos quando abertos via `file://`.

---

### 📦 Comandos Disponíveis:
- `npm run dev`: Inicia o ambiente de desenvolvimento local na porta 3000 com recarregamento rápido.
- `npm run build`: Gera os arquivos finais de produção nas pastas `/dist` e `/docs`.
- `npm run preview`: Testa a versão compilada de produção localmente.

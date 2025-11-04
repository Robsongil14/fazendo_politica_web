# ✅ CHECKLIST DE VALIDAÇÃO PÓS-INSTALAÇÃO
## Fazendo Política Web - Verificação Completa do Sistema

---

## 🎯 OBJETIVO DESTE CHECKLIST

Este checklist garante que **TUDO** está funcionando corretamente após a instalação do sistema Fazendo Política Web.

**Use este checklist:**
- ✅ Após instalação inicial
- ✅ Após atualizações do sistema
- ✅ Para diagnóstico de problemas
- ✅ Para validação periódica

**Tempo estimado**: 15-20 minutos

---

## 📋 CHECKLIST PRINCIPAL

### 🔧 FASE 1: INSTALAÇÃO DO SERVIDOR

#### 1.1 Verificação de Privilégios
- [ ] **Executou scripts como administrador**
- [ ] **UAC configurado ou desabilitado temporariamente**
- [ ] **Antivírus não está bloqueando arquivos**

**Como verificar:**
```cmd
# Execute este comando como administrador
whoami /priv | findstr "SeDebugPrivilege"
```
✅ **Deve mostrar**: `SeDebugPrivilege` habilitado

#### 1.2 Instalação do Node.js
- [ ] **Node.js instalado e funcionando**
- [ ] **NPM disponível**
- [ ] **Versão compatível (16+ recomendado)**

**Como verificar:**
```cmd
node --version
npm --version
```
✅ **Deve mostrar**: Versões do Node.js e NPM

#### 1.3 Instalação do PM2
- [ ] **PM2 instalado globalmente**
- [ ] **PM2 funcionando corretamente**
- [ ] **Comando pm2 disponível**

**Como verificar:**
```cmd
pm2 --version
pm2 list
```
✅ **Deve mostrar**: Versão do PM2 e lista de processos

#### 1.4 Estrutura de Diretórios
- [ ] **Pasta `C:\FazendoPoliticaWeb` criada**
- [ ] **Permissões corretas na pasta**
- [ ] **Subpastas necessárias existem**

**Como verificar:**
```cmd
dir C:\FazendoPoliticaWeb
dir C:\FazendoPoliticaWeb\logs
dir C:\FazendoPoliticaWeb\backup
```
✅ **Deve mostrar**: Estrutura de pastas criada

#### 1.5 Configuração do Firewall
- [ ] **Regra de entrada criada para porta 3000**
- [ ] **Regra de saída criada para porta 3000**
- [ ] **Regras ativas e funcionando**

**Como verificar:**
```cmd
netsh advfirewall firewall show rule name="Fazendo Politica Web"
```
✅ **Deve mostrar**: Regras de firewall configuradas

---

### 📦 FASE 2: DEPLOY DA APLICAÇÃO

#### 2.1 Arquivos da Aplicação
- [ ] **Arquivo `package.json` copiado**
- [ ] **Pasta `.next` (build) copiada**
- [ ] **Pasta `public` copiada**
- [ ] **Pasta `src` copiada**
- [ ] **Arquivos de configuração copiados**

**Como verificar:**
```cmd
dir C:\FazendoPoliticaWeb\package.json
dir C:\FazendoPoliticaWeb\.next
dir C:\FazendoPoliticaWeb\public
dir C:\FazendoPoliticaWeb\src
```
✅ **Deve mostrar**: Todos os arquivos essenciais

#### 2.2 Dependências
- [ ] **`npm install` executado com sucesso**
- [ ] **`node_modules` criado**
- [ ] **Dependências de produção instaladas**

**Como verificar:**
```cmd
cd C:\FazendoPoliticaWeb
dir node_modules
npm list --depth=0
```
✅ **Deve mostrar**: Dependências instaladas sem erros

#### 2.3 Configuração do PM2
- [ ] **Arquivo `ecosystem.config.js` criado**
- [ ] **Configurações corretas no arquivo**
- [ ] **PM2 configurado para produção**

**Como verificar:**
```cmd
type C:\FazendoPoliticaWeb\ecosystem.config.js
```
✅ **Deve conter**: Configurações de produção (NODE_ENV, PORT, etc.)

#### 2.4 Variáveis de Ambiente
- [ ] **Arquivo `.env.local` existe**
- [ ] **Variáveis essenciais configuradas**
- [ ] **Formato correto do arquivo**

**Como verificar:**
```cmd
type C:\FazendoPoliticaWeb\.env.local
```
✅ **Deve conter**: NODE_ENV=production, PORT=3000, etc.

---

### 🚀 FASE 3: INICIALIZAÇÃO DO SISTEMA

#### 3.1 Inicialização da Aplicação
- [ ] **PM2 inicia a aplicação sem erros**
- [ ] **Processo está rodando**
- [ ] **Status "online" no PM2**

**Como verificar:**
```cmd
pm2 status
```
✅ **Deve mostrar**: `fazendo-politica-web` com status `online`

#### 3.2 Logs do Sistema
- [ ] **Logs não mostram erros críticos**
- [ ] **Aplicação iniciou corretamente**
- [ ] **Porta 3000 está sendo usada**

**Como verificar:**
```cmd
pm2 logs fazendo-politica-web --lines 20
```
✅ **Deve mostrar**: Logs de inicialização sem erros

#### 3.3 Uso de Porta
- [ ] **Porta 3000 está em uso pela aplicação**
- [ ] **Não há conflitos de porta**
- [ ] **Aplicação está ouvindo conexões**

**Como verificar:**
```cmd
netstat -ano | findstr :3000
```
✅ **Deve mostrar**: Processo Node.js usando porta 3000

---

### 🌐 FASE 4: TESTES DE CONECTIVIDADE

#### 4.1 Acesso Local
- [ ] **`http://localhost:3000` carrega**
- [ ] **Página principal aparece**
- [ ] **Sem erros 404 ou 500**
- [ ] **Tempo de carregamento < 5 segundos**

**Como testar:**
1. Abra navegador
2. Digite: `http://localhost:3000`
3. Pressione Enter

✅ **Deve mostrar**: Página do sistema carregada

#### 4.2 Acesso por IP Local
- [ ] **`http://[IP_LOCAL]:3000` funciona**
- [ ] **Mesmo conteúdo do localhost**
- [ ] **Acessível de outros computadores da rede**

**Como testar:**
```cmd
# Descobrir IP local
ipconfig | findstr "IPv4"
# Testar no navegador: http://[IP_ENCONTRADO]:3000
```
✅ **Deve mostrar**: Página acessível pelo IP local

#### 4.3 Teste de Firewall
- [ ] **Firewall não bloqueia conexões**
- [ ] **Regras estão ativas**
- [ ] **Acesso externo permitido**

**Como testar:**
```cmd
# De outro computador na rede
telnet [IP_DO_SERVIDOR] 3000
```
✅ **Deve conectar**: Sem timeout ou erro de conexão

---

### 🔧 FASE 5: CONFIGURAÇÃO DE REDE

#### 5.1 Informações de Rede
- [ ] **IP local identificado**
- [ ] **Gateway identificado**
- [ ] **IP público identificado**
- [ ] **Informações anotadas**

**Como verificar:**
```cmd
# Execute o script
configurar_rede.bat
```
✅ **Deve mostrar**: Todas as informações de rede

#### 5.2 Conectividade Interna
- [ ] **Ping para localhost funciona**
- [ ] **Ping para gateway funciona**
- [ ] **Ping para internet funciona**

**Como testar:**
```cmd
ping localhost
ping 192.168.1.1
ping google.com
```
✅ **Deve mostrar**: Respostas de ping sem perda de pacotes

#### 5.3 Port Forwarding (se necessário)
- [ ] **Roteador acessível**
- [ ] **Port forwarding configurado**
- [ ] **Porta 3000 redirecionada**
- [ ] **IP interno correto**

**Como verificar:**
- Acesse o roteador (geralmente 192.168.1.1)
- Verifique configuração de Port Forwarding
- Teste acesso externo

---

### 🔒 FASE 6: SEGURANÇA E PERFORMANCE

#### 6.1 Configurações de Segurança
- [ ] **Firewall ativo e configurado**
- [ ] **Apenas porta 3000 liberada**
- [ ] **Regras específicas criadas**

**Como verificar:**
```cmd
netsh advfirewall show allprofiles
```
✅ **Deve mostrar**: Firewall ativo com regras específicas

#### 6.2 Performance do Sistema
- [ ] **Uso de CPU < 50% em idle**
- [ ] **Uso de RAM < 80%**
- [ ] **Espaço em disco suficiente (>5GB)**

**Como verificar:**
```cmd
pm2 monit
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
```
✅ **Deve mostrar**: Recursos dentro dos limites normais

#### 6.3 Estabilidade
- [ ] **Aplicação roda por 10+ minutos sem crash**
- [ ] **Sem restarts automáticos excessivos**
- [ ] **Logs estáveis**

**Como verificar:**
```cmd
# Aguarde 10 minutos, depois execute:
pm2 status
```
✅ **Deve mostrar**: Uptime > 10 minutos, restarts = 0 ou poucos

---

### 🎯 FASE 7: TESTES FUNCIONAIS

#### 7.1 Interface do Usuário
- [ ] **Página principal carrega completamente**
- [ ] **Menu de navegação funciona**
- [ ] **Links internos funcionam**
- [ ] **Formulários respondem**

**Como testar:**
1. Navegue pelas páginas principais
2. Teste formulários de pesquisa
3. Verifique se dados carregam

✅ **Deve funcionar**: Navegação fluida sem erros

#### 7.2 APIs e Dados
- [ ] **Conexão com banco de dados funciona**
- [ ] **APIs respondem corretamente**
- [ ] **Dados são exibidos**

**Como testar:**
- Acesse páginas que mostram dados
- Teste funcionalidades de pesquisa
- Verifique se informações aparecem

✅ **Deve mostrar**: Dados carregados corretamente

#### 7.3 Responsividade
- [ ] **Funciona em desktop**
- [ ] **Funciona em tablet**
- [ ] **Funciona em celular**

**Como testar:**
- Redimensione a janela do navegador
- Teste em diferentes dispositivos
- Use ferramentas de desenvolvedor (F12)

✅ **Deve adaptar**: Layout responsivo em todos os tamanhos

---

## 🚨 CHECKLIST DE PROBLEMAS CRÍTICOS

### ❌ Se QUALQUER item falhar:

#### Problema: Node.js não instalado
**Solução:**
1. Baixe de https://nodejs.org
2. Execute como administrador
3. Reinicie o computador
4. Teste: `node --version`

#### Problema: PM2 não funciona
**Solução:**
```cmd
npm install -g pm2
pm2 --version
```

#### Problema: Aplicação não inicia
**Solução:**
```cmd
cd C:\FazendoPoliticaWeb
npm install --production
pm2 restart fazendo-politica-web
```

#### Problema: Firewall bloqueia
**Solução:**
```cmd
# Execute como administrador
netsh advfirewall firewall add rule name="Fazendo Politica Web" dir=in action=allow protocol=TCP localport=3000
```

#### Problema: Não acessa de outros computadores
**Solução:**
1. Execute `configurar_firewall.bat` como administrador
2. Verifique IP local: `ipconfig`
3. Teste: `http://[IP_LOCAL]:3000`

---

## 📊 RELATÓRIO DE VALIDAÇÃO

### Template para Documentar Resultados:

```
========================================
RELATÓRIO DE VALIDAÇÃO - FAZENDO POLÍTICA WEB
Data: ___/___/______
Responsável: _________________
========================================

FASE 1 - INSTALAÇÃO DO SERVIDOR:
□ Privilégios: OK / FALHA
□ Node.js: OK / FALHA  
□ PM2: OK / FALHA
□ Diretórios: OK / FALHA
□ Firewall: OK / FALHA

FASE 2 - DEPLOY DA APLICAÇÃO:
□ Arquivos: OK / FALHA
□ Dependências: OK / FALHA
□ PM2 Config: OK / FALHA
□ Variáveis: OK / FALHA

FASE 3 - INICIALIZAÇÃO:
□ Aplicação: OK / FALHA
□ Logs: OK / FALHA
□ Porta: OK / FALHA

FASE 4 - CONECTIVIDADE:
□ Acesso Local: OK / FALHA
□ Acesso IP: OK / FALHA
□ Firewall: OK / FALHA

FASE 5 - REDE:
□ Informações: OK / FALHA
□ Conectividade: OK / FALHA
□ Port Forward: OK / FALHA / N/A

FASE 6 - SEGURANÇA:
□ Firewall: OK / FALHA
□ Performance: OK / FALHA
□ Estabilidade: OK / FALHA

FASE 7 - FUNCIONAL:
□ Interface: OK / FALHA
□ APIs: OK / FALHA
□ Responsivo: OK / FALHA

INFORMAÇÕES COLETADAS:
IP Local: ________________
IP Público: ______________
Gateway: ________________
Versão Node.js: __________
Versão PM2: _____________

PROBLEMAS ENCONTRADOS:
_________________________________
_________________________________
_________________________________

SOLUÇÕES APLICADAS:
_________________________________
_________________________________
_________________________________

STATUS FINAL: ✅ APROVADO / ❌ REPROVADO

OBSERVAÇÕES:
_________________________________
_________________________________
========================================
```

---

## ✅ VALIDAÇÃO FINAL

### ✅ Sistema APROVADO se:
- **Todas as fases** passaram sem erros críticos
- **Acesso local** funciona perfeitamente
- **Aplicação** está estável por 15+ minutos
- **Logs** não mostram erros
- **Performance** está adequada

### ❌ Sistema REPROVADO se:
- **Qualquer fase crítica** falhou
- **Aplicação** não inicia ou crasha
- **Acesso local** não funciona
- **Erros críticos** nos logs
- **Performance** muito baixa

### 🔄 Próximos Passos após Aprovação:
1. **Documente** as configurações finais
2. **Configure** acesso externo (se necessário)
3. **Treine** usuários finais
4. **Agende** manutenção preventiva
5. **Configure** backups automáticos

---

**🎉 Parabéns!** Se chegou até aqui com tudo ✅, seu sistema está **100% funcional** e pronto para uso em produção!
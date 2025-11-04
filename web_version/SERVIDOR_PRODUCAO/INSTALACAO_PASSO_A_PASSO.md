# 📖 INSTALAÇÃO PASSO A PASSO - FAZENDO POLÍTICA WEB
## Guia Completo para Configurar seu Servidor de Produção

---

## 🎯 OBJETIVO DESTE GUIA

Este guia vai te ajudar a instalar e configurar o sistema **Fazendo Política Web** em um servidor dedicado, passo a passo, de forma simples e segura.

**Tempo estimado**: 30-45 minutos  
**Nível de dificuldade**: Iniciante a Intermediário

---

## 📋 ANTES DE COMEÇAR

### ✅ O que você precisa ter:

1. **Computador/Servidor** com:
   - Windows 10, Windows 11 ou Windows Server
   - Pelo menos 4GB de RAM
   - 20GB de espaço livre no disco
   - Conexão com a internet

2. **Acesso de Administrador**:
   - Você precisa ser administrador do computador
   - Ou ter a senha de administrador

3. **Arquivos do Sistema**:
   - Esta pasta `SERVIDOR_PRODUCAO` completa
   - Todos os arquivos `.bat` inclusos

### ⚠️ IMPORTANTE - LEIA ANTES DE CONTINUAR:

- **Execute SEMPRE como Administrador** quando solicitado
- **Não feche** as janelas durante a instalação
- **Aguarde** cada processo terminar completamente
- **Anote** as informações que aparecerem na tela

---

## 🚀 PARTE 1: INSTALAÇÃO DO SERVIDOR

### PASSO 1.1: Preparar o Ambiente

1. **Copie esta pasta** `SERVIDOR_PRODUCAO` para o servidor onde vai instalar
2. **Coloque em um local fácil**, como `C:\` ou `Desktop`
3. **Abra a pasta** e verifique se todos os arquivos estão lá:
   - ✅ `instalar_servidor.bat`
   - ✅ `deploy_aplicacao.bat`
   - ✅ `configurar_rede.bat`
   - ✅ `verificar_status.bat`
   - ✅ `backup_aplicacao.bat`

### PASSO 1.2: Executar a Instalação

1. **Localize o arquivo** `instalar_servidor.bat`
2. **Clique com o botão DIREITO** sobre ele
3. **Selecione** "Executar como administrador"
4. **Se aparecer uma tela de segurança**, clique em "Sim"

### PASSO 1.3: Acompanhar a Instalação

**O que vai acontecer:**
- ⏳ Verificação de privilégios de administrador
- ⏳ Download e instalação do Node.js (se necessário)
- ⏳ Instalação do PM2 (gerenciador de processos)
- ⏳ Criação da pasta `C:\FazendoPoliticaWeb`
- ⏳ Configuração do Firewall do Windows
- ⏳ Configuração de inicialização automática

**Tempo estimado**: 5-10 minutos

### PASSO 1.4: Verificar se deu certo

**Sinais de sucesso:**
- ✅ Apareceu "INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
- ✅ Foi criada a pasta `C:\FazendoPoliticaWeb`
- ✅ Não apareceram mensagens de erro em vermelho

**Se algo deu errado:**
- ❌ Verifique se executou como administrador
- ❌ Verifique sua conexão com a internet
- ❌ Execute novamente o script

---

## 📦 PARTE 2: DEPLOY DA APLICAÇÃO

### PASSO 2.1: Preparar os Arquivos da Aplicação

**IMPORTANTE**: Você precisa ter os arquivos da aplicação web prontos:
- Pasta `.next` (build da aplicação)
- Pasta `public` (arquivos estáticos)
- Pasta `src` (código fonte)
- Arquivo `package.json`
- Arquivo `.env.local` (configurações)

### PASSO 2.2: Executar o Deploy

1. **Localize o arquivo** `deploy_aplicacao.bat`
2. **Clique duas vezes** para executar (não precisa ser como administrador)
3. **Aguarde** o processo terminar

### PASSO 2.3: Acompanhar o Deploy

**O que vai acontecer:**
- ⏳ Parada de serviços em execução
- ⏳ Backup da versão anterior (se existir)
- ⏳ Cópia dos novos arquivos
- ⏳ Instalação das dependências
- ⏳ Configuração do PM2
- ⏳ Inicialização da aplicação

**Tempo estimado**: 2-5 minutos

### PASSO 2.4: Verificar se a aplicação está rodando

1. **Abra seu navegador** (Chrome, Firefox, Edge)
2. **Digite na barra de endereço**: `http://localhost:3000`
3. **Pressione Enter**

**Se deu certo:**
- ✅ A página do sistema carregou
- ✅ Você consegue navegar no sistema

**Se não funcionou:**
- ❌ Execute `verificar_status.bat` para ver o que aconteceu
- ❌ Verifique se todos os arquivos foram copiados corretamente

---

## 🌐 PARTE 3: CONFIGURAÇÃO DE REDE

### PASSO 3.1: Descobrir Informações da Rede

1. **Execute o arquivo** `configurar_rede.bat`
2. **Anote as informações** que aparecerem:
   - 📝 **IP Local**: (exemplo: 192.168.1.100)
   - 📝 **Gateway**: (exemplo: 192.168.1.1)
   - 📝 **IP Público**: (exemplo: 200.100.50.25)

### PASSO 3.2: Testar Acesso Local

1. **No próprio servidor**, abra o navegador
2. **Teste estes endereços**:
   - `http://localhost:3000` ✅
   - `http://[SEU_IP_LOCAL]:3000` ✅

**Exemplo**: Se seu IP local é 192.168.1.100, teste:
- `http://192.168.1.100:3000`

### PASSO 3.3: Testar Acesso na Rede Local

1. **Em outro computador** da mesma rede
2. **Abra o navegador**
3. **Digite**: `http://[IP_LOCAL_DO_SERVIDOR]:3000`

**Se não funcionar:**
- ❌ Verifique se o firewall está configurado
- ❌ Execute `configurar_firewall.bat` como administrador

---

## 🔧 PARTE 4: CONFIGURAÇÃO PARA ACESSO EXTERNO

### PASSO 4.1: Acessar o Roteador

1. **Abra o navegador**
2. **Digite o IP do Gateway** (normalmente `192.168.1.1`)
3. **Faça login** com usuário e senha do roteador

**Senhas comuns de roteador:**
- admin / admin
- admin / password
- admin / 1234
- (veja a etiqueta do roteador)

### PASSO 4.2: Configurar Port Forwarding

1. **Procure por**: "Port Forwarding", "Virtual Server" ou "Redirecionamento de Porta"
2. **Crie uma nova regra** com:
   - **Nome**: Fazendo Politica Web
   - **Porta Externa**: 3000
   - **Porta Interna**: 3000
   - **IP Interno**: [IP do seu servidor]
   - **Protocolo**: TCP
3. **Salve** a configuração

### PASSO 4.3: Testar Acesso Externo

1. **Use seu celular** (desconecte do WiFi, use dados móveis)
2. **Abra o navegador**
3. **Digite**: `http://[SEU_IP_PUBLICO]:3000`

**Se funcionou:**
- ✅ Parabéns! Seu servidor está acessível pela internet

**Se não funcionou:**
- ❌ Verifique a configuração do port forwarding
- ❌ Alguns provedores bloqueiam certas portas
- ❌ Aguarde alguns minutos e teste novamente

---

## ✅ PARTE 5: VERIFICAÇÃO FINAL

### CHECKLIST DE VALIDAÇÃO

Execute este checklist para garantir que tudo está funcionando:

#### Instalação do Servidor:
- [ ] Node.js instalado: Execute `node --version` no cmd
- [ ] PM2 instalado: Execute `pm2 --version` no cmd
- [ ] Pasta criada: Existe `C:\FazendoPoliticaWeb`
- [ ] Firewall configurado: Porta 3000 liberada

#### Aplicação:
- [ ] Aplicação rodando: Execute `verificar_status.bat`
- [ ] Acesso local: `http://localhost:3000` funciona
- [ ] Sem erros: Execute `pm2 logs` e verifique

#### Rede:
- [ ] IP local identificado
- [ ] Acesso na rede local funciona
- [ ] Port forwarding configurado
- [ ] Acesso externo funciona (opcional)

### COMANDOS ÚTEIS PARA VERIFICAÇÃO

```cmd
# Ver se a aplicação está rodando
pm2 status

# Ver logs da aplicação
pm2 logs

# Reiniciar a aplicação
pm2 restart fazendo-politica-web

# Ver informações de rede
ipconfig

# Testar conectividade
ping google.com
```

---

## 🆘 SOLUÇÃO DE PROBLEMAS RÁPIDOS

### Problema: "Acesso negado" durante instalação
**Solução**: Execute como administrador

### Problema: "Node.js não encontrado"
**Solução**: Reinicie o computador após a instalação

### Problema: "Aplicação não inicia"
**Solução**: 
1. Execute `verificar_status.bat`
2. Execute `pm2 logs` para ver erros
3. Verifique se todos os arquivos foram copiados

### Problema: "Não consigo acessar de outros computadores"
**Solução**:
1. Execute `configurar_firewall.bat` como administrador
2. Verifique se o IP está correto
3. Teste primeiro na mesma rede

### Problema: "Não consigo acessar da internet"
**Solução**:
1. Verifique o port forwarding no roteador
2. Confirme o IP público
3. Teste com dados móveis do celular

---

## 📞 INFORMAÇÕES IMPORTANTES

### URLs de Acesso:
- **Local**: http://localhost:3000
- **Rede Local**: http://[IP_LOCAL]:3000
- **Internet**: http://[IP_PUBLICO]:3000

### Arquivos Importantes:
- **Aplicação**: `C:\FazendoPoliticaWeb\`
- **Configuração PM2**: `C:\FazendoPoliticaWeb\ecosystem.config.js`
- **Logs**: Execute `pm2 logs` para ver

### Comandos de Controle:
- **Iniciar**: `pm2 start ecosystem.config.js`
- **Parar**: `pm2 stop fazendo-politica-web`
- **Reiniciar**: `pm2 restart fazendo-politica-web`
- **Status**: `pm2 status`

---

## 🎉 PARABÉNS!

Se você chegou até aqui e tudo está funcionando, **parabéns**! 

Seu servidor **Fazendo Política Web** está:
- ✅ Instalado corretamente
- ✅ Rodando automaticamente
- ✅ Acessível na rede
- ✅ Configurado para iniciar com o sistema

**Próximos passos:**
1. Configure um domínio personalizado (opcional)
2. Configure HTTPS com certificado SSL (recomendado)
3. Configure backups automáticos
4. Monitore o uso de recursos

**Para suporte adicional**, consulte o arquivo `GUIA_SERVIDOR_PRODUCAO.md` para informações mais técnicas.

---

**📧 Dúvidas?** Consulte a documentação completa ou entre em contato com o suporte técnico.
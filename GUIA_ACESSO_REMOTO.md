# 🌐 Guia de Configuração para Acesso Remoto

## 📋 Opções Disponíveis

### **Opção 1: Servidor Local + DNS Dinâmico (Recomendado)**
- ✅ Totalmente gratuito
- ✅ Controle total dos dados
- ✅ Sem limitações de tráfego
- ⚠️ Requer configuração de rede

### **Opção 2: Hospedagem em Nuvem**
- ✅ Fácil configuração
- ✅ Alta disponibilidade
- ⚠️ Possíveis limitações no plano gratuito

---

## 🏠 **OPÇÃO 1: Servidor Local + DNS Dinâmico**

### **Passo 1: Serviços de DNS Dinâmico Gratuitos**

#### **DuckDNS (Mais Simples)**
- 🌐 Site: https://www.duckdns.org/
- ✅ Totalmente gratuito
- ✅ Fácil configuração
- ✅ Subdomínio: `seuapp.duckdns.org`

#### **No-IP (Mais Popular)**
- 🌐 Site: https://www.noip.com/
- ✅ Plano gratuito disponível
- ✅ Renovação a cada 30 dias (gratuito)
- ✅ Subdomínio: `seuapp.ddns.net`

#### **Dynu (Mais Recursos)**
- 🌐 Site: https://www.dynu.com/
- ✅ Plano gratuito generoso
- ✅ Múltiplos subdomínios
- ✅ Subdomínio: `seuapp.dynu.net`

### **Passo 2: Configuração do Roteador**
1. **Abrir Porta 3000** no roteador
2. **Port Forwarding**: Porta 3000 → IP do seu computador
3. **IP Estático Local** para seu computador

### **Passo 3: Configuração do Windows Firewall**
```batch
# Permitir porta 3000 no Windows Firewall
netsh advfirewall firewall add rule name="Fazendo Politica Web" dir=in action=allow protocol=TCP localport=3000
```

### **Passo 4: Iniciar Servidor de Produção**
```bash
npm run start
```

---

## ☁️ **OPÇÃO 2: Hospedagem em Nuvem Gratuita**

### **Vercel (Recomendado para Next.js)**
- 🌐 Site: https://vercel.com/
- ✅ Otimizado para Next.js
- ✅ Deploy automático via Git
- ✅ SSL gratuito
- ✅ Domínio: `seuapp.vercel.app`

### **Netlify**
- 🌐 Site: https://netlify.com/
- ✅ Fácil configuração
- ✅ Deploy via Git ou drag-and-drop
- ✅ Domínio: `seuapp.netlify.app`

### **Railway**
- 🌐 Site: https://railway.app/
- ✅ Suporte a banco de dados
- ✅ Deploy via Git
- ✅ Domínio: `seuapp.railway.app`

---

## 🚀 **Configuração Rápida - DuckDNS**

### **1. Criar Conta no DuckDNS**
1. Acesse: https://www.duckdns.org/
2. Faça login com Google/GitHub
3. Crie um subdomínio: `fazendopolitica.duckdns.org`
4. Anote seu **token**

### **2. Configurar IP Dinâmico**
Crie um arquivo `atualizar_ip.bat`:
```batch
@echo off
curl "https://www.duckdns.org/update?domains=fazendopolitica&token=SEU_TOKEN_AQUI&ip="
timeout /t 300
goto :loop
```

### **3. Configurar Roteador**
- **IP do Computador**: 192.168.1.100 (exemplo)
- **Porta Externa**: 3000
- **Porta Interna**: 3000
- **Protocolo**: TCP

### **4. Iniciar Aplicação**
```bash
npm run start
```

### **5. Testar Acesso**
- Local: `http://localhost:3000`
- Remoto: `http://fazendopolitica.duckdns.org:3000`

---

## 🔧 **Scripts Automáticos**

### **Iniciar Servidor (iniciar_servidor_web.bat)**
```batch
@echo off
echo Iniciando servidor web Fazendo Politica...
cd /d "C:\Users\robso\Desktop\nosso_app\fazendo_politica_web\web_version"
npm run start
pause
```

### **Configurar Firewall (configurar_firewall_web.bat)**
```batch
@echo off
echo Configurando Windows Firewall...
netsh advfirewall firewall add rule name="Fazendo Politica Web" dir=in action=allow protocol=TCP localport=3000
echo Firewall configurado com sucesso!
pause
```

---

## 📱 **Acesso Mobile**

Após configurar, você poderá acessar de:
- 📱 **Celular**: `http://fazendopolitica.duckdns.org:3000`
- 💻 **Outros Computadores**: `http://fazendopolitica.duckdns.org:3000`
- 🌐 **Qualquer Lugar**: `http://fazendopolitica.duckdns.org:3000`

---

## ⚡ **Próximos Passos**

1. ✅ Build de produção (em andamento)
2. 🔧 Configurar DNS dinâmico
3. 🌐 Configurar roteador
4. 🔥 Configurar firewall
5. 🚀 Testar acesso remoto

---

## 🆘 **Suporte**

Se precisar de ajuda:
1. Verifique se o servidor está rodando
2. Teste acesso local primeiro
3. Verifique configurações do roteador
4. Confirme regras do firewall
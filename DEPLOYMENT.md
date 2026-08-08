# VPS Deployment Guide

Complete guide to deploy WhatsDeveloper-Evolution stack on your VPS.

---

## 📋 Prerequisites

- Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name (optional, for SSL)
- Minimum 2GB RAM
- 20GB storage

---

## 🚀 Step 1: Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v18+
npm --version
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Git
```bash
sudo apt install -y git
```

---

## 🗄️ Step 2: Database Setup

### Create Evolution Database
```bash
sudo -u postgres psql
```

Inside PostgreSQL:
```sql
CREATE DATABASE evolution;
CREATE USER evolutionuser WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE evolution TO evolutionuser;
\q
```

---

## 📦 Step 3: Clone Repository

```bash
# Clone the repo
cd /var/www
sudo git clone https://github.com/DevDodge/whatsDev-Evo.git
cd whatsDev-Evo

# Set permissions
sudo chown -R $USER:$USER /var/www/whatsDev-Evo
```

---

## ⚙️ Step 4: Configure Evolution API

```bash
cd /var/www/whatsDev-Evo/evolution-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
```

### Evolution API .env Configuration
```bash
# Server
SERVER_PORT=8080
SERVER_URL=http://localhost:8080

# Database
DATABASE_URL=postgresql://evolutionuser:your-secure-password@localhost:5432/evolution

# Authentication
AUTHENTICATION_API_KEY=your-evolution-api-key-here

# Instance
INSTANCE_REJECT_CALL=true
INSTANCE_MSG_CALL=Automated system - calls not accepted

# Webhook
WEBHOOK_GLOBAL_ENABLED=false

# Logs
LOG_LEVEL=ERROR
LOG_COLOR=true
```

### Build and Run Migration
```bash
npm run build
npm run db:migrate
```

### Start with PM2
```bash
pm2 start dist/src/main.js --name evolution-api
pm2 save
```

---

## 🌉 Step 5: Configure Backend Bridge

```bash
cd /var/www/whatsDev-Evo/whatsdeveloper-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
```

### Backend Bridge .env Configuration
```bash
# Server
PORT=3000
NODE_ENV=production

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-evolution-api-key-here
DEFAULT_INSTANCE_NAME=MAIN

# Security
JWT_SECRET=your-jwt-secret-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (your domain or *)
CORS_ORIGIN=*
```

### Build and Start
```bash
npm run build
pm2 start dist/index.js --name whatsdeveloper-backend
pm2 save
```

---

## 🔄 Step 6: Setup PM2 Startup

```bash
# Generate startup script
pm2 startup

# Copy and run the command shown (something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user

# Save PM2 processes
pm2 save

# Enable PM2 to start on boot
sudo systemctl enable pm2-your-user
```

---

## 🌐 Step 7: Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx
```bash
sudo apt install -y nginx
```

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/whatsdev
```

Add:
```nginx
# Backend Bridge
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Evolution API (optional - usually keep internal)
server {
    listen 80;
    server_name evolution.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/whatsdev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Step 8: SSL with Let's Encrypt (Optional)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificates
```bash
sudo certbot --nginx -d api.yourdomain.com -d evolution.yourdomain.com
```

### Auto-renewal
```bash
sudo certbot renew --dry-run
```

---

## 🔥 Step 9: Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## ✅ Step 10: Verify Installation

### Check Services
```bash
pm2 list
```

You should see:
- ✅ evolution-api (online)
- ✅ whatsdeveloper-backend (online)

### Test Endpoints

#### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "service": "WhatsDeveloper Backend Bridge",
  "version": "1.0.0"
}
```

#### API Docs
Open in browser:
```
http://your-server-ip:3000/api-docs
```

Or with domain:
```
https://api.yourdomain.com/api-docs
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Backend logs
pm2 logs whatsdeveloper-backend

# Evolution logs
pm2 logs evolution-api

# All logs
pm2 logs

# Clear logs
pm2 flush
```

### Monitor Resources
```bash
pm2 monit
```

### Restart Services
```bash
pm2 restart evolution-api
pm2 restart whatsdeveloper-backend

# Or restart all
pm2 restart all
```

---

## 🔄 Updating Deployment

### Pull Latest Changes
```bash
cd /var/www/whatsDev-Evo
git pull origin main
```

### Update Backend
```bash
cd whatsdeveloper-backend
npm install
npm run build
pm2 restart whatsdeveloper-backend
```

### Update Evolution
```bash
cd ../evolution-api
npm install
npm run build
npm run db:migrate
pm2 restart evolution-api
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs whatsdeveloper-backend --lines 50

# Check .env configuration
cd /var/www/whatsDev-Evo/whatsdeveloper-backend
cat .env

# Restart
pm2 restart whatsdeveloper-backend
```

### Evolution API Issues
```bash
# Check database connection
sudo -u postgres psql -d evolution -c "SELECT 1;"

# Check logs
pm2 logs evolution-api --lines 50

# Reset instance
cd /var/www/whatsDev-Evo/evolution-api
npm run db:reset
pm2 restart evolution-api
```

### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U evolutionuser -d evolution -h localhost
```

### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
```

---

## 📱 Step 11: Connect WhatsApp Instance

### 1. Create Instance
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: your-evolution-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "MAIN",
    "qrcode": true
  }'
```

### 2. Get QR Code
```bash
curl http://localhost:8080/instance/qrcode/MAIN \
  -H "apikey: your-evolution-api-key"
```

### 3. Scan QR Code with WhatsApp
Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan QR

### 4. Verify Connection
```bash
curl http://localhost:3000/api/instance/status \
  -H "X-API-Token: your-evolution-api-key" \
  -H "X-Device-UUID: test-device-123"
```

---

## 🎯 Production Checklist

- [ ] PostgreSQL database created and secured
- [ ] Strong passwords for database and API keys
- [ ] Evolution API running on PM2
- [ ] Backend Bridge running on PM2
- [ ] PM2 startup configured
- [ ] Nginx reverse proxy configured
- [ ] SSL certificates installed (Let's Encrypt)
- [ ] Firewall rules configured
- [ ] WhatsApp instance connected
- [ ] Test send message endpoint
- [ ] Webhook registered (if using n8n)
- [ ] Monitoring setup (PM2 logs)
- [ ] Backup strategy for database

---

## 🔐 Security Best Practices

1. **Change Default Credentials**
   - Use strong, unique API keys
   - Generate secure JWT secrets
   - Use strong database passwords

2. **Environment Variables**
   - Never commit .env files
   - Use different keys for production

3. **Firewall**
   - Only expose necessary ports
   - Use UFW or iptables

4. **SSL**
   - Always use HTTPS in production
   - Keep certificates updated

5. **Updates**
   - Regularly update npm packages
   - Keep system packages updated
   - Monitor security advisories

---

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs`
2. Review troubleshooting section
3. Open issue on GitHub

---

**🚀 Your WhatsDeveloper-Evolution stack is now live!**

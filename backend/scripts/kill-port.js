#!/usr/bin/env node

const { execSync } = require('child_process');

const port = process.env.PORT || 3000;

try {
  // Trouver le processus qui utilise le port
  const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
  
  if (pid) {
    console.log(`🛑 Arrêt du processus ${pid} sur le port ${port}...`);
    try {
      execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
      console.log(`✅ Port ${port} libéré avec succès`);
    } catch (error) {
      console.log(`⚠️  Impossible d'arrêter le processus ${pid}`);
    }
  } else {
    console.log(`✅ Le port ${port} est déjà libre`);
  }
} catch (error) {
  // Aucun processus n'utilise le port
  console.log(`✅ Le port ${port} est déjà libre`);
}


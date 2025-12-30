#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

try {
  // Trouver tous les processus qui utilisent le port
  const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
  
  if (pids) {
    const pidArray = pids.split('\n').filter(pid => pid.trim());
    console.log(`🛑 Arrêt de ${pidArray.length} processus sur le port ${port}...`);
    
    pidArray.forEach(pid => {
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`  ✅ Processus ${pid} arrêté`);
      } catch (error) {
        console.log(`  ⚠️  Impossible d'arrêter le processus ${pid}`);
      }
    });
    
    console.log(`✅ Port ${port} libéré avec succès`);
  } else {
    console.log(`✅ Le port ${port} est déjà libre`);
  }
} catch (error) {
  // Aucun processus n'utilise le port
  console.log(`✅ Le port ${port} est déjà libre`);
}

// Nettoyer le dossier dist s'il existe
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  try {
    // Supprimer récursivement le contenu du dossier dist
    execSync(`rm -rf ${distPath}/*`, { stdio: 'ignore' });
    console.log(`✅ Dossier dist nettoyé`);
  } catch (error) {
    console.log(`⚠️  Impossible de nettoyer le dossier dist`);
  }
}


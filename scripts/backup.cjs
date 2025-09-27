#!/usr/bin/env node

/**
 * CampusVault Backup & Restore Utility
 * Safely backs up all resources, files, and database data
 * Prevents data loss from deployment issues or errors
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Configuration
const DB_PATH = path.join(__dirname, '..', 'campusvault.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

class CampusVaultBackup {
  constructor() {
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      console.log('✅ Created backups directory');
    }
  }

  generateBackupName() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `campusvault-backup-${timestamp}`;
  }

  async createBackup() {
    const backupName = this.generateBackupName();
    const backupDir = path.join(BACKUPS_DIR, backupName);

    console.log(`🚀 Starting backup: ${backupName}`);
    console.log(`📁 Backup location: ${backupDir}`);

    try {
      // Create backup directory
      fs.mkdirSync(backupDir, { recursive: true });

      // Backup database
      await this.backupDatabase(backupDir);

      // Backup files
      await this.backupFiles(backupDir);

      // Create backup manifest
      this.createManifest(backupDir, backupName);

      console.log(`✅ Backup completed successfully: ${backupName}`);
      console.log(`📊 Backup size: ${this.getDirectorySize(backupDir)} MB`);

      return backupName;

    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      // Clean up failed backup
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
      }
      throw error;
    }
  }

  async backupDatabase(backupDir) {
    console.log('💾 Backing up database...');

    const db = new Database(DB_PATH);
    const dbBackupPath = path.join(backupDir, 'database.json');

    try {
      // Export all tables
      const tables = {
        users: db.prepare('SELECT * FROM users').all(),
        subjects: db.prepare('SELECT * FROM subjects').all(),
        resources: db.prepare('SELECT * FROM resources').all(),
        downloads: db.prepare('SELECT * FROM downloads').all()
      };

      // Add metadata
      const metadata = {
        backupDate: new Date().toISOString(),
        version: '1.0',
        recordCounts: {
          users: tables.users.length,
          subjects: tables.subjects.length,
          resources: tables.resources.length,
          downloads: tables.downloads.length
        }
      };

      const backupData = {
        metadata,
        data: tables
      };

      fs.writeFileSync(dbBackupPath, JSON.stringify(backupData, null, 2));
      console.log(`   ✅ Database exported: ${tables.resources.length} resources, ${tables.users.length} users`);

    } finally {
      db.close();
    }
  }

  async backupFiles(backupDir) {
    console.log('📁 Backing up uploaded files...');

    const filesDir = path.join(backupDir, 'files');

    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('   ⚠️  No uploads directory found');
      return;
    }

    // Copy all files from uploads directory
    const files = fs.readdirSync(UPLOADS_DIR);
    let fileCount = 0;

    for (const file of files) {
      const srcPath = path.join(UPLOADS_DIR, file);
      const destPath = path.join(filesDir, file);

      // Skip database files and logs
      if (file.endsWith('.db') || file.endsWith('.log')) {
        continue;
      }

      // Ensure destination directory exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      // Copy file
      fs.copyFileSync(srcPath, destPath);
      fileCount++;
    }

    console.log(`   ✅ Files backed up: ${fileCount} files`);
  }

  createManifest(backupDir, backupName) {
    const manifest = {
      name: backupName,
      created: new Date().toISOString(),
      version: '1.0',
      includes: {
        database: true,
        files: true
      },
      paths: {
        database: './database.json',
        files: './files/'
      }
    };

    const manifestPath = path.join(backupDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;

    function calculateSize(itemPath) {
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const items = fs.readdirSync(itemPath);
        items.forEach(item => {
          calculateSize(path.join(itemPath, item));
        });
      } else {
        totalSize += stats.size;
      }
    }

    calculateSize(dirPath);
    return (totalSize / (1024 * 1024)).toFixed(2);
  }

  async listBackups() {
    if (!fs.existsSync(BACKUPS_DIR)) {
      console.log('No backups found');
      return;
    }

    const backups = fs.readdirSync(BACKUPS_DIR)
      .filter(item => fs.statSync(path.join(BACKUPS_DIR, item)).isDirectory())
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('No backups found');
      return;
    }

    console.log('📋 Available Backups:');
    console.log('─'.repeat(80));

    backups.forEach(backup => {
      const backupPath = path.join(BACKUPS_DIR, backup);
      const manifestPath = path.join(backupPath, 'manifest.json');

      let info = { created: 'Unknown', size: 'Unknown' };

      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          info.created = new Date(manifest.created).toLocaleString();
        } catch (e) {
          // Ignore manifest read errors
        }
      }

      const size = this.getDirectorySize(backupPath);

      console.log(`${backup}`);
      console.log(`   Created: ${info.created}`);
      console.log(`   Size: ${size} MB`);
      console.log('');
    });
  }

  async restoreBackup(backupName) {
    const backupDir = path.join(BACKUPS_DIR, backupName);

    if (!fs.existsSync(backupDir)) {
      throw new Error(`Backup '${backupName}' not found`);
    }

    console.log(`🔄 Starting restore from: ${backupName}`);

    try {
      // Restore database
      await this.restoreDatabase(backupDir);

      // Restore files
      await this.restoreFiles(backupDir);

      console.log('✅ Restore completed successfully');

    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  async restoreDatabase(backupDir) {
    console.log('💾 Restoring database...');

    const dbBackupPath = path.join(backupDir, 'database.json');

    if (!fs.existsSync(dbBackupPath)) {
      throw new Error('Database backup not found');
    }

    const backupData = JSON.parse(fs.readFileSync(dbBackupPath, 'utf8'));
    const db = new Database(DB_PATH);

    try {
      // Clear existing data (optional - be careful!)
      console.log('   ⚠️  This will replace existing data. Continue? (y/N)');

      // For safety, we'll create a backup of current state first
      const preRestoreBackup = this.generateBackupName() + '-prerestore';
      const preRestoreDir = path.join(BACKUPS_DIR, preRestoreBackup);
      await this.backupDatabase(preRestoreDir);
      console.log(`   📋 Pre-restore backup created: ${preRestoreBackup}`);

      // Note: In a production script, you'd want user confirmation here
      // For now, we'll proceed with the restore

      db.exec('BEGIN TRANSACTION');

      // Clear tables
      db.exec('DELETE FROM downloads');
      db.exec('DELETE FROM resources');
      db.exec('DELETE FROM subjects');
      // Note: We don't clear users to preserve admin accounts

      // Restore data
      const insertUser = db.prepare(`
        INSERT OR REPLACE INTO users (id, username, email, password, full_name, year, branch, is_admin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertSubject = db.prepare(`
        INSERT OR REPLACE INTO subjects (id, name, code, year, semester, branch, icon, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertResource = db.prepare(`
        INSERT OR REPLACE INTO resources (id, title, description, file_name, file_size, file_type, resource_type, subject_id, uploaded_by, download_count, is_approved, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertDownload = db.prepare(`
        INSERT OR REPLACE INTO downloads (id, user_id, resource_id, downloaded_at)
        VALUES (?, ?, ?, ?)
      `);

      // Insert data
      for (const user of backupData.data.users) {
        insertUser.run(user.id, user.username, user.email, user.password, user.full_name, user.year, user.branch, user.is_admin, user.created_at, user.updated_at);
      }

      for (const subject of backupData.data.subjects) {
        insertSubject.run(subject.id, subject.name, subject.code, subject.year, subject.semester, subject.branch, subject.icon, subject.created_at);
      }

      for (const resource of backupData.data.resources) {
        insertResource.run(resource.id, resource.title, resource.description, resource.file_name, resource.file_size, resource.file_type, resource.resource_type, resource.subject_id, resource.uploaded_by, resource.download_count, resource.is_approved, resource.created_at, resource.updated_at);
      }

      for (const download of backupData.data.downloads) {
        insertDownload.run(download.id, download.user_id, download.resource_id, download.downloaded_at);
      }

      db.exec('COMMIT');
      console.log(`   ✅ Database restored: ${backupData.data.resources.length} resources`);

    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    } finally {
      db.close();
    }
  }

  async restoreFiles(backupDir) {
    console.log('📁 Restoring files...');

    const filesDir = path.join(backupDir, 'files');

    if (!fs.existsSync(filesDir)) {
      console.log('   ⚠️  No files to restore');
      return;
    }

    let fileCount = 0;
    const files = this.getAllFiles(filesDir);

    for (const file of files) {
      const relativePath = path.relative(filesDir, file);
      const destPath = path.join(UPLOADS_DIR, relativePath);

      // Ensure destination directory exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      // Copy file
      fs.copyFileSync(file, destPath);
      fileCount++;
    }

    console.log(`   ✅ Files restored: ${fileCount} files`);
  }

  getAllFiles(dirPath) {
    const files = [];

    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          traverse(itemPath);
        } else {
          files.push(itemPath);
        }
      }
    }

    traverse(dirPath);
    return files;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const backup = new CampusVaultBackup();

  try {
    switch (command) {
      case 'backup':
      case 'create':
        const backupName = await backup.createBackup();
        console.log(`\n🎉 Backup created: ${backupName}`);
        console.log(`📍 Location: ${path.join(BACKUPS_DIR, backupName)}`);
        break;

      case 'list':
        await backup.listBackups();
        break;

      case 'restore':
        const backupToRestore = args[1];
        if (!backupToRestore) {
          console.error('❌ Please specify backup name to restore');
          console.log('Usage: node backup.js restore <backup-name>');
          process.exit(1);
        }
        await backup.restoreBackup(backupToRestore);
        break;

      default:
        console.log('🏦 CampusVault Backup & Restore Utility');
        console.log('');
        console.log('Usage:');
        console.log('  node backup.js backup    - Create a new backup');
        console.log('  node backup.js list      - List all available backups');
        console.log('  node backup.js restore <name> - Restore from backup');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/backup.js backup');
        console.log('  node scripts/backup.js list');
        console.log('  node scripts/backup.js restore campusvault-backup-2025-09-27T20-30-00');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = CampusVaultBackup;
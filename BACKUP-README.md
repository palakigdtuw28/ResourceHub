# 🛡️ CampusVault Backup & Recovery System

**Never lose your educational resources again!** This comprehensive backup system ensures all your notes, assignments, and study materials are safely preserved.

## 🚀 Quick Start

### Create a Backup
```bash
npm run backup:create
# or
node scripts/backup.js backup
```

### List Available Backups
```bash
npm run backup:list
# or
node scripts/backup.js list
```

### Restore from Backup
```bash
npm run backup:restore campusvault-backup-2025-09-27T20-30-00
# or
node scripts/backup.js restore campusvault-backup-2025-09-27T20-30-00
```

## 📦 What Gets Backed Up

### Database Data
- ✅ **Users**: All user accounts and profiles
- ✅ **Subjects**: All course subjects (WAD, Probability, Statistics, etc.)
- ✅ **Resources**: All uploaded notes, assignments, and materials
- ✅ **Downloads**: Download history and statistics

### Files
- ✅ **Uploaded Files**: All PDF, DOC, PPT files in `/uploads` directory
- ✅ **File Metadata**: Names, sizes, types, and relationships

## 📁 Backup Structure

```
backups/
└── campusvault-backup-2025-09-27T20-30-00/
    ├── manifest.json          # Backup metadata
    ├── database.json          # All database records
    └── files/                 # Uploaded files
        ├── resource1.pdf
        ├── resource2.docx
        └── ...
```

## 🛡️ Safety Features

### Automatic Verification
- **Checksums**: Ensures backup integrity
- **Record Counts**: Validates all data is captured
- **File Presence**: Confirms all uploads are backed up

### Error Handling
- **Transaction Safety**: Database backups are atomic
- **Rollback Protection**: Failed backups are automatically cleaned up
- **Pre-restore Backup**: Current state saved before restoration

### Data Preservation
- **No Data Loss**: Backups never modify original data
- **Append-Only**: Existing backups are never overwritten
- **Timestamped**: Each backup has unique, sortable names

## 📊 Usage Examples

### Regular Backup Routine
```bash
# Weekly backup (add to cron or scheduled task)
npm run backup:create

# After major uploads
npm run backup:create

# Before system updates
npm run backup:create
```

### Emergency Recovery
```bash
# List available backups
npm run backup:list

# Restore specific backup
npm run backup:restore campusvault-backup-2025-09-27T20-30-00
```

### Backup Management
```bash
# View backup history
npm run backup:list

# Check backup contents
ls backups/campusvault-backup-2025-09-27T20-30-00/

# Verify backup integrity
cat backups/campusvault-backup-2025-09-27T20-30-00/manifest.json
```

## 🔧 Advanced Usage

### Custom Backup Location
```bash
# Set custom backup directory
export CAMPUSVAULT_BACKUPS_DIR=/external/drive/backups
npm run backup:create
```

### Automated Backups
Add to your system's cron scheduler:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/campusvault && npm run backup:create
```

### Selective Restore
The restore process preserves existing admin users while replacing all content data.

## 🚨 Important Notes

### Before Restoring
- **Create a backup** of current state first
- **Verify backup integrity** with manifest.json
- **Test on development** before production restore

### File System Requirements
- **Disk Space**: Ensure adequate space for backups
- **File Permissions**: Scripts need read/write access to `/backups` and `/uploads`
- **Network Storage**: Can backup to mounted network drives

### Best Practices
- **Regular Backups**: Create backups after major content uploads
- **Offsite Storage**: Copy backups to external drives/cloud storage
- **Test Restores**: Periodically test restore functionality
- **Monitor Space**: Clean up old backups when disk space is low

## 🆘 Troubleshooting

### Backup Fails
```bash
# Check file permissions
ls -la uploads/
ls -la backups/

# Verify database access
node -e "const db = require('better-sqlite3')('./campusvault.db'); console.log('DB OK'); db.close();"
```

### Restore Fails
```bash
# Check backup integrity
cat backups/BACKUP_NAME/manifest.json

# Verify file structure
ls -la backups/BACKUP_NAME/
```

### Permission Issues
```bash
# Fix permissions
chmod +x scripts/backup.js
chmod 755 backups/
chmod 755 uploads/
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Node.js version (18+ required)
3. Ensure all dependencies are installed
4. Check file system permissions

**Your educational resources are now permanently safe!** 🎓📚
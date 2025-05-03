// // utils/backupUtils.js
// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');
// const { promisify } = require('util');
// const execPromise = promisify(exec);
// const { pool } = require('../config/db');

// const BACKUP_DIR = path.join(__dirname, '../backups');
// const MAX_BACKUP_AGE_DAYS = 30;
// const MYSQL_CNF_PATH = path.join(__dirname, '.mysql.cnf');

// // Secure MySQL configuration file creation
// async function createMySQLConfig() {
//   const configContent = `[client]
// host=${process.env.MYSQLHOST}
// user=${process.env.MYSQLUSER}
// password="${process.env.MYSQLPASSWORD}"
// port=${process.env.MYSQLPORT}`;

//   await fs.promises.writeFile(MYSQL_CNF_PATH, configContent, { mode: 0o600 });
// }

// // Database backup function
// async function backupDatabase() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   const backupFile = path.join(BACKUP_DIR, `db_backup_${timestamp}.sql`);

//   try {
//     // Ensure secure directory structure
//     await fs.promises.mkdir(BACKUP_DIR, { recursive: true, mode: 0o700 });
    
//     // Create secure MySQL config
//     await createMySQLConfig();

//     // Execute mysqldump with config file
//     await execPromise(
//       `mysqldump --defaults-extra-file=${MYSQL_CNF_PATH} ` +
//       `--single-transaction --skip-lock-tables ` +
//       `${process.env.MYSQLDATABASE} > ${backupFile}`
//     );

//     // Verify backup integrity
//     const stats = await fs.promises.stat(backupFile);
//     if (stats.size < 1024) { // Simple size check
//       throw new Error('Backup file too small, likely failed');
//     }

//     // Set secure permissions
//     await fs.promises.chmod(backupFile, 0o600);
    
//     console.log(`Secure database backup created: ${backupFile}`);
//     return backupFile;
//   } catch (err) {
//     // Cleanup failed backup
//     if (fs.existsSync(backupFile)) await fs.promises.unlink(backupFile);
//     console.error('Database backup failed:', err.message);
//     throw err;
//   } finally {
//     // Cleanup MySQL config
//     if (fs.existsSync(MYSQL_CNF_PATH)) await fs.promises.unlink(MYSQL_CNF_PATH);
//   }
// }

// // File backup function
// async function backupFiles() {
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   const backupFile = path.join(BACKUP_DIR, `files_backup_${timestamp}.tar.gz`);

//   try {
//     await execPromise(
//       `tar -czvf ${backupFile} --directory=${path.join(__dirname, '..')} uploads public`
//     );

//     // Verify backup integrity
//     await execPromise(`tar -tzf ${backupFile}`);
    
//     // Set secure permissions
//     await fs.promises.chmod(backupFile, 0o600);
    
//     console.log(`Verified files backup created: ${backupFile}`);
//     return backupFile;
//   } catch (err) {
//     if (fs.existsSync(backupFile)) await fs.promises.unlink(backupFile);
//     console.error('File backup failed:', err.message);
//     throw err;
//   }
// }

// // Cleanup old backups
// async function cleanupBackups() {
//   try {
//     if (!fs.existsSync(BACKUP_DIR)) return;

//     const files = await fs.promises.readdir(BACKUP_DIR);
//     const cutoff = Date.now() - (MAX_BACKUP_AGE_DAYS * 86400000);

//     for (const file of files) {
//       const filePath = path.join(BACKUP_DIR, file);
//       try {
//         const stats = await fs.promises.stat(filePath);
//         if (stats.mtimeMs < cutoff) {
//           await fs.promises.unlink(filePath);
//           console.log(`Deleted old backup: ${file}`);
//         }
//       } catch (err) {
//         console.error(`Error cleaning ${file}:`, err.message);
//       }
//     }
//   } catch (err) {
//     console.error('Backup cleanup failed:', err.message);
//   }
// }

// module.exports = {
//   backupDatabase,
//   backupFiles,
//   cleanupBackups
// };
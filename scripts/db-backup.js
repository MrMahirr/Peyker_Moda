const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Peyker Moda - Database Backup Script (Node.js)
// cross-platform robust backup script

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const RETENTION_DAYS = 7;
const ENV_PATH = path.join(process.cwd(), 'apps', 'api', '.env');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Load .env
if (fs.existsSync(ENV_PATH)) {
    const dotenv = require('fs').readFileSync(ENV_PATH, 'utf-8');
    dotenv.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `backup-${timestamp}.sql`;
const backupPath = path.join(BACKUP_DIR, filename);

console.log('Starting database backup...');

try {
    let backupCommand = '';
    
    // Check if pg_dump is available locally
    try {
        execSync('pg_dump --version', { stdio: 'ignore' });
        console.log('Using local pg_dump...');
        backupCommand = `pg_dump "${process.env.DATABASE_URL}" > "${backupPath}"`;
    } catch (e) {
        // Try Docker
        try {
            const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' });
            const dbContainer = containers.split('\n').find(c => c.includes('postgres') || c.includes('db'));
            
            if (dbContainer) {
                console.log(`Using docker exec pg_dump on container: ${dbContainer.trim()}...`);
                // Use environment variables from .env if possible, fallback to common defaults
                const user = process.env.POSTGRES_USER || 'peyker_user';
                const db = process.env.POSTGRES_DB || 'peyker_db';
                backupCommand = `docker exec -t ${dbContainer.trim()} pg_dump -U ${user} ${db} > "${backupPath}"`;
            } else {
                throw new Error('No database container found.');
            }
        } catch (dockerErr) {
            throw new Error('Neither pg_dump nor docker is available, or no container found.');
        }
    }

    console.log(`Executing: ${backupCommand}`);
    execSync(backupCommand, { stdio: 'inherit', shell: true });

    // Verify file size
    const stats = fs.statSync(backupPath);
    console.log(`Backup created: ${filename} (${stats.size} bytes)`);

    if (stats.size < 1000) {
        console.warn('⚠️ Warning: Backup file is suspiciously small. Please check if the database is empty or if there was a hidden error.');
    }

    // Compress (Using native node zlib for cross-platform without external tools)
    const zlib = require('zlib');
    const input = fs.createReadStream(backupPath);
    const output = fs.createWriteStream(`${backupPath}.gz`);
    const gzip = zlib.createGzip();

    input.pipe(gzip).pipe(output).on('finish', () => {
        fs.unlinkSync(backupPath); // Remove original .sql file
        console.log(`Compression finished: ${filename}.gz`);
        
        // Cleanup old backups
        console.log(`Cleaning up backups older than ${RETENTION_DAYS} days...`);
        const files = fs.readdirSync(BACKUP_DIR);
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - RETENTION_DAYS);

        files.forEach(file => {
            if (file.startsWith('backup-') && file.endsWith('.gz')) {
                const filePath = path.join(BACKUP_DIR, file);
                const fileStats = fs.statSync(filePath);
                if (fileStats.mtime < limitDate) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted old backup: ${file}`);
                }
            }
        });
        
        console.log('Done.');
    });

} catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
}

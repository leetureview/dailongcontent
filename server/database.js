import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'marketing.db');

let db = null;

// Initialize database
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('📂 Created new database');
  }

  // Create tables
  db.run(`
    -- Projects (Dự án)
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Staff (Nhân sự - seeders)
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#3B82F6',
      role TEXT DEFAULT 'seeder',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Comments (Nội dung AI tạo)
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      staff_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'Khen ngợi',
      condition TEXT DEFAULT 'Đạt',
      reply_to_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Prompts (Setup Prompt templates)
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name TEXT NOT NULL,
      template TEXT NOT NULL,
      type TEXT DEFAULT 'comment',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed initial data if empty
  seedDatabase();

  // Save to file
  saveDatabase();

  return db;
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Seed initial data
function seedDatabase() {
  const result = db.exec('SELECT COUNT(*) as count FROM projects');
  const count = result[0]?.values[0]?.[0] || 0;

  if (count === 0) {
    console.log('📦 Seeding initial data...');

    // Insert project
    db.run(`INSERT INTO projects (name, description, status) VALUES (?, ?, ?)`,
      ['mắt kính anna', 'Chiến dịch quảng cáo mắt kính Anna cho couple', 'active']);

    // Insert staff
    const staffData = [
      ['Người 1', '#3B82F6', 'seeder'],
      ['Người 2', '#10B981', 'seeder'],
      ['Người 3', '#F59E0B', 'seeder'],
      ['Người 4', '#8B5CF6', 'seeder'],
      ['Người 5', '#EC4899', 'seeder'],
    ];
    staffData.forEach(s => {
      db.run(`INSERT INTO staff (name, avatar_color, role) VALUES (?, ?, ?)`, s);
    });

    // Insert comments
    const commentsData = [
      [1, 1, 'Wow, visual của cặp đôi này đỉnh quá! 😍 Kính Anna làm nổi bật cả outfit luôn ấy. Cả hai trông rất matching và thời trang!', 'Khen ngợi', 'Đạt', null],
      [1, 2, 'Cho mình xin địa chỉ shop với ạ! Mình cũng muốn mua một cặp kính như vậy cho mình và người yêu 🥰', 'Hỏi địa chỉ', 'Đạt', 1],
      [1, 3, 'Hai bạn giống couple trong phim Hàn quá! 💕 Kính Anna có nhiều mẫu không ạ? Mình thấy mẫu này rất hợp với mặt trái xoan.', 'Khen ngợi', 'Đạt', null],
      [1, 4, 'Kính đẹp quá! Chất lượng kính thế nào vậy ạ? Có chống UV không? Mình đang tìm kính vừa thời trang vừa bảo vệ mắt ý.', 'Hỏi thông tin', 'Đạt', null],
      [1, 5, 'Save lại để cuối tuần rủ bạn trai đi mua! 📌 Cặp kính couple này xinh quá, giá cả thế nào ạ shop?', 'Hỏi giá', 'Đạt', 3],
    ];
    commentsData.forEach(c => {
      db.run(`INSERT INTO comments (project_id, staff_id, content, type, condition, reply_to_id) VALUES (?, ?, ?, ?, ?, ?)`, c);
    });

    // Insert default prompt
    db.run(`INSERT INTO prompts (project_id, name, template, type, is_active) VALUES (?, ?, ?, ?, ?)`, [
      1,
      'Comment khen ngợi couple',
      `Hãy viết một comment tiếng Việt tự nhiên cho bài đăng về {{product}}. 
Phong cách: {{style}}
Yêu cầu:
- Sử dụng emoji phù hợp
- Đề cập đến visual/style của couple
- Có thể hỏi thêm thông tin về sản phẩm
- Giọng văn trẻ trung, thân thiện`,
      'comment',
      1
    ]);

    console.log('✅ Database seeded successfully!');
  }
}

// Helper to run queries and return results
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper to run a single query and return one result
function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results[0] || null;
}

// Helper to run insert/update/delete
function run(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return {
      lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0],
      changes: db.getRowsModified()
    };
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
}

// Get database instance
function getDb() {
  return db;
}

export { initDatabase, query, queryOne, run, getDb, saveDatabase };

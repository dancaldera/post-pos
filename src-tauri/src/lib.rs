use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Define database migrations for authentication system
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_users_table",
            sql: "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
                permissions TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "insert_default_users",
            sql: "INSERT OR IGNORE INTO users (id, email, password, name, role, permissions, created_at, last_login) VALUES 
                (1, 'admin@postpos.com', 'admin123', 'Admin User', 'admin', '[\"*\"]', '2024-01-01T00:00:00.000Z', '2025-01-24T10:30:00.000Z'),
                (2, 'manager@postpos.com', 'manager123', 'Store Manager', 'manager', '[\"sales.view\",\"sales.create\",\"sales.edit\",\"products.view\",\"products.create\",\"products.edit\",\"products.delete\",\"inventory.view\",\"inventory.edit\",\"customers.view\",\"customers.create\",\"customers.edit\",\"reports.view\",\"reports.export\",\"users.view\",\"users.create\",\"users.edit\",\"users.delete\"]', '2024-01-15T00:00:00.000Z', '2025-01-23T14:45:00.000Z'),
                (3, 'user@postpos.com', 'user123', 'John Cashier', 'user', '[\"sales.view\",\"sales.create\",\"products.view\",\"customers.view\",\"customers.create\"]', '2024-02-01T00:00:00.000Z', '2025-01-24T09:00:00.000Z');",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:postpos.db", migrations)
                .build()
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

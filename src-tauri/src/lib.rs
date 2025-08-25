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
        },
        Migration {
            version: 3,
            description: "create_customers_table",
            sql: "CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                address TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                loyalty_points INTEGER DEFAULT 0,
                total_spent REAL DEFAULT 0.0,
                last_purchase_date DATETIME,
                is_active BOOLEAN DEFAULT 1,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "insert_default_customers",
            sql: "INSERT OR IGNORE INTO customers (id, first_name, last_name, email, phone, address, city, state, zip_code, loyalty_points, total_spent, last_purchase_date, is_active, notes, created_at, updated_at) VALUES
                (1, 'John', 'Doe', 'john.doe@email.com', '(555) 123-4567', '123 Main St', 'Anytown', 'CA', '12345', 1250, 2450.75, '2024-01-20T14:30:00.000Z', 1, 'Prefers morning shopping, regular coffee buyer', '2023-06-15T10:00:00.000Z', '2024-01-20T14:30:00.000Z'),
                (2, 'Jane', 'Smith', 'jane.smith@email.com', '(555) 987-6543', '456 Oak Ave', 'Somewhere', 'NY', '67890', 3500, 5890.25, '2024-01-22T16:45:00.000Z', 1, 'VIP customer, bulk purchases', '2023-03-10T14:20:00.000Z', '2024-01-22T16:45:00.000Z'),
                (3, 'Bob', 'Johnson', 'bob.johnson@email.com', '(555) 456-7890', '789 Pine St', 'Otherville', 'TX', '34567', 800, 1200.50, '2024-01-18T11:15:00.000Z', 1, 'Prefers self-checkout, quick shopper', '2023-09-05T09:30:00.000Z', '2024-01-18T11:15:00.000Z'),
                (4, 'Alice', 'Williams', 'alice.williams@email.com', '(555) 234-5678', '321 Elm Blvd', 'Newtown', 'FL', '45678', 2100, 3780.90, '2024-01-21T13:20:00.000Z', 1, 'Corporate account, monthly billing', '2023-07-20T16:45:00.000Z', '2024-01-21T13:20:00.000Z'),
                (5, 'Mike', 'Brown', 'mike.brown@email.com', '(555) 876-5432', '654 Cedar Rd', 'Westville', 'WA', '78901', 450, 890.25, '2024-01-19T10:30:00.000Z', 1, 'Student discount, frequent snack purchases', '2023-11-12T12:15:00.000Z', '2024-01-19T10:30:00.000Z'),
                (6, 'Sarah', 'Davis', 'sarah.davis@email.com', '(555) 345-6789', '987 Maple Ln', 'Eastside', 'IL', '23456', 1800, 3120.75, '2024-01-17T15:45:00.000Z', 1, 'Senior citizen, prefers assistance', '2023-05-25T11:20:00.000Z', '2024-01-17T15:45:00.000Z'),
                (7, 'David', 'Wilson', 'david.wilson@email.com', '(555) 765-4321', '159 Birch St', 'Northtown', 'OH', '56789', 950, 1560.40, '2024-01-16T09:15:00.000Z', 1, 'Employee discount, regular shopper', '2023-10-08T13:30:00.000Z', '2024-01-16T09:15:00.000Z'),
                (8, 'Emily', 'Taylor', 'emily.taylor@email.com', '(555) 654-3210', '753 Spruce Ave', 'Southburg', 'GA', '34567', 2800, 4780.60, '2024-01-23T12:30:00.000Z', 1, 'Wholesale buyer, bulk orders', '2023-04-18T15:45:00.000Z', '2024-01-23T12:30:00.000Z'),
                (9, 'Tom', 'Anderson', 'tom.anderson@email.com', '(555) 432-1098', '246 Willow Way', 'Central City', 'CO', '45678', 1200, 2100.80, '2024-01-15T14:20:00.000Z', 0, 'Moved out of state', '2023-08-30T10:15:00.000Z', '2024-01-15T14:20:00.000Z'),
                (10, 'Lisa', 'Martinez', 'lisa.martinez@email.com', '(555) 321-0987', '864 Palm Dr', 'Beachside', 'CA', '98765', 3200, 5420.95, '2024-01-24T17:30:00.000Z', 1, 'Regular weekend shopper, large family', '2023-02-14T09:45:00.000Z', '2024-01-24T17:30:00.000Z');",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_products_table",
            sql: "CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                price REAL NOT NULL,
                cost REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                category TEXT NOT NULL,
                barcode TEXT UNIQUE,
                image TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "insert_default_products",
            sql: "INSERT OR IGNORE INTO products (id, name, description, price, cost, stock, category, barcode, image, is_active, created_at, updated_at) VALUES
                (1, 'Coca Cola 500ml', 'Refreshing soft drink', 2.50, 1.20, 120, 'Beverages', '7501055363063', NULL, 1, '2024-01-01T00:00:00.000Z', '2024-01-15T10:30:00.000Z'),
                (2, 'Bread Loaf', 'Fresh whole wheat bread', 3.99, 1.80, 25, 'Bakery', '1234567890123', NULL, 1, '2024-01-02T00:00:00.000Z', '2024-01-16T14:45:00.000Z'),
                (3, 'Premium Coffee Beans 1kg', 'Arabica coffee beans from Colombia', 24.99, 12.00, 8, 'Coffee & Tea', '9876543210987', NULL, 1, '2024-01-03T00:00:00.000Z', '2024-01-17T09:15:00.000Z'),
                (4, 'Organic Milk 1L', 'Fresh organic whole milk', 4.50, 2.20, 45, 'Dairy', '5555666677778', NULL, 1, '2024-01-04T00:00:00.000Z', '2024-01-18T16:20:00.000Z'),
                (5, 'Chocolate Bar', 'Dark chocolate 70% cocoa', 5.99, 2.80, 0, 'Snacks', '1111222233334', NULL, 0, '2024-01-05T00:00:00.000Z', '2024-01-19T11:10:00.000Z'),
                (6, 'Fresh Salmon Fillet', 'Atlantic salmon, wild-caught', 18.99, 12.50, 12, 'Seafood', '2222333344445', NULL, 1, '2024-01-06T00:00:00.000Z', '2024-01-20T08:30:00.000Z'),
                (7, 'Frozen Pizza Margherita', 'Traditional Italian style pizza', 6.99, 3.50, 35, 'Frozen Foods', '3333444455556', NULL, 1, '2024-01-07T00:00:00.000Z', '2024-01-21T15:45:00.000Z'),
                (8, 'Bananas (per lb)', 'Fresh organic bananas', 1.29, 0.65, 150, 'Fresh Produce', '4444555566667', NULL, 1, '2024-01-08T00:00:00.000Z', '2024-01-22T12:15:00.000Z'),
                (9, 'Paper Towels (6-pack)', 'Ultra-absorbent paper towels', 12.99, 7.20, 28, 'Household Items', '5555666677778', NULL, 1, '2024-01-09T00:00:00.000Z', '2024-01-23T09:30:00.000Z'),
                (10, 'Shampoo & Conditioner Set', 'Moisturizing hair care set', 15.99, 8.90, 22, 'Personal Care', '6666777788889', NULL, 1, '2024-01-10T00:00:00.000Z', '2024-01-24T14:20:00.000Z');",
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

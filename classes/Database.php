<?php
/**
 * Database Connection and Query Handler
 * Handles all database operations for BigG's Laundromat
 */

class Database {
    private static $instance = null;
    private $connection;
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset;

    private function __construct() {
        $this->host = DB_HOST;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
        $this->charset = DB_CHARSET;
        
        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset}"
            ];

            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            logError("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            logError("Query failed: " . $e->getMessage(), ['sql' => $sql, 'params' => $params]);
            throw new Exception("Query execution failed");
        }
    }

    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, $data);
        
        return $this->connection->lastInsertId();
    }

    public function update($table, $data, $where, $whereParams = []) {
        $setParts = [];
        foreach (array_keys($data) as $key) {
            $setParts[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setParts);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        $params = array_merge($data, $whereParams);
        
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    public function commit() {
        return $this->connection->commit();
    }

    public function rollback() {
        return $this->connection->rollback();
    }

    public function getLastInsertId() {
        return $this->connection->lastInsertId();
    }

    public function rowCount($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    // Helper method for pagination
    public function paginate($sql, $params = [], $page = 1, $limit = 20) {
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM ({$sql}) as count_table";
        $total = $this->fetch($countSql, $params)['total'];
        
        // Calculate offset
        $offset = ($page - 1) * $limit;
        
        // Add LIMIT and OFFSET to query
        $paginatedSql = $sql . " LIMIT {$limit} OFFSET {$offset}";
        $data = $this->fetchAll($paginatedSql, $params);
        
        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ]
        ];
    }

    // Helper method for search with LIKE
    public function search($table, $columns, $searchTerm, $where = '', $params = []) {
        $searchConditions = [];
        foreach ($columns as $column) {
            $searchConditions[] = "{$column} LIKE :search";
        }
        $searchClause = implode(' OR ', $searchConditions);
        
        $whereClause = $where ? "WHERE {$where} AND ({$searchClause})" : "WHERE {$searchClause}";
        
        $sql = "SELECT * FROM {$table} {$whereClause}";
        $searchParams = array_merge($params, ['search' => "%{$searchTerm}%"]);
        
        return $this->fetchAll($sql, $searchParams);
    }

    // Helper method to check if record exists
    public function exists($table, $where, $params = []) {
        $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$where}";
        $result = $this->fetch($sql, $params);
        return $result['count'] > 0;
    }

    // Helper method to get single column value
    public function getColumn($sql, $params = [], $column = 0) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchColumn($column);
    }

    // Helper method for bulk insert
    public function bulkInsert($table, $data) {
        if (empty($data)) {
            return 0;
        }

        $columns = implode(', ', array_keys($data[0]));
        $values = [];
        $params = [];
        
        foreach ($data as $index => $row) {
            $placeholders = [];
            foreach ($row as $key => $value) {
                $paramKey = $key . '_' . $index;
                $placeholders[] = ':' . $paramKey;
                $params[$paramKey] = $value;
            }
            $values[] = '(' . implode(', ', $placeholders) . ')';
        }
        
        $valuesClause = implode(', ', $values);
        $sql = "INSERT INTO {$table} ({$columns}) VALUES {$valuesClause}";
        
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    // Helper method for complex joins
    public function join($table1, $table2, $on, $select = '*', $where = '', $params = []) {
        $sql = "SELECT {$select} FROM {$table1} JOIN {$table2} ON {$on}";
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        return $this->fetchAll($sql, $params);
    }

    // Helper method to get table info
    public function getTableInfo($table) {
        $sql = "DESCRIBE {$table}";
        return $this->fetchAll($sql);
    }

    // Helper method to execute raw SQL (use with caution)
    public function execute($sql, $params = []) {
        return $this->query($sql, $params);
    }

    // Close connection
    public function close() {
        $this->connection = null;
    }

    // Prevent cloning
    private function __clone() {}

    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}



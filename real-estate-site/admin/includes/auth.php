<?php
declare(strict_types=1);

session_start();

$configPath = __DIR__ . '/../config.php';
if (!is_readable($configPath)) {
    http_response_code(500);
    echo 'Admin is not configured. Copy admin/config.example.php to admin/config.php and set a password.';
    exit;
}

$config = require $configPath;

function admin_is_logged_in(): bool
{
    return !empty($_SESSION['blog_admin_logged_in']);
}

function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function admin_attempt_login(string $username, string $password, array $config): bool
{
    $expectedUser = (string) ($config['username'] ?? 'admin');
    $hash = (string) ($config['password_hash'] ?? '');

    if ($username !== $expectedUser || $hash === '' || !password_verify($password, $hash)) {
        return false;
    }

    session_regenerate_id(true);
    $_SESSION['blog_admin_logged_in'] = true;
    $_SESSION['blog_admin_user'] = $expectedUser;
    return true;
}

function admin_logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function admin_csrf_token(): string
{
    if (empty($_SESSION['blog_admin_csrf'])) {
        $_SESSION['blog_admin_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['blog_admin_csrf'];
}

function admin_verify_csrf(?string $token): bool
{
    return is_string($token) && hash_equals(admin_csrf_token(), $token);
}

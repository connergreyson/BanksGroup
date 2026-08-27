<?php
declare(strict_types=1);

require __DIR__ . '/includes/auth.php';

if (admin_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (admin_attempt_login($username, $password, $config)) {
        header('Location: index.php');
        exit;
    }

    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Blog Admin Login | The Banks Group</title>
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">
  <main class="admin-card">
    <h1>Blog admin</h1>
    <p class="admin-intro">Sign in to publish and update blog posts on thebanks.group.</p>
    <?php if ($error !== ''): ?>
      <p class="admin-error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
    <?php endif; ?>
    <form method="post" class="admin-form">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" required autocomplete="username">

      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autocomplete="current-password">

      <button type="submit" class="admin-btn">Sign in</button>
    </form>
  </main>
</body>
</html>

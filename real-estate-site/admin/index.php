<?php
declare(strict_types=1);

require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/blog-functions.php';

admin_require_login();

$blogs = load_blogs();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Blog Posts | Admin</title>
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">
  <header class="admin-header">
    <div>
      <h1>Blog posts</h1>
      <p>Manage stories shown under <strong>Blogs</strong> on the website.</p>
    </div>
    <div class="admin-header-actions">
      <a class="admin-btn" href="edit.php">New post</a>
      <a class="admin-link" href="../blog.html" target="_blank" rel="noopener">View blog</a>
      <a class="admin-link" href="logout.php">Sign out</a>
    </div>
  </header>

  <main class="admin-main">
    <?php if ($blogs === []): ?>
      <p class="admin-empty">No posts yet. <a href="edit.php">Create your first post</a>.</p>
    <?php else: ?>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($blogs as $blog): ?>
              <tr>
                <td><?= htmlspecialchars((string) ($blog['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= htmlspecialchars((string) ($blog['category'] ?? ''), ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= htmlspecialchars((string) ($blog['date'] ?? ''), ENT_QUOTES, 'UTF-8') ?></td>
                <td class="admin-table-actions">
                  <a href="edit.php?id=<?= urlencode((string) ($blog['id'] ?? '')) ?>">Edit</a>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </main>
</body>
</html>

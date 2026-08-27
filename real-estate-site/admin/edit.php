<?php
declare(strict_types=1);

require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/blog-functions.php';

admin_require_login();

$id = trim((string) ($_GET['id'] ?? ''));
$blogs = load_blogs();
$existing = null;

if ($id !== '') {
    $index = find_blog_index($blogs, $id);
    if ($index === null) {
        http_response_code(404);
        echo 'Post not found.';
        exit;
    }
    $existing = $blogs[$index];
}

$errors = [];
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_verify_csrf($_POST['csrf'] ?? null)) {
        $errors[] = 'Security check failed. Please try again.';
    } else {
        $action = (string) ($_POST['action'] ?? 'save');
        $blog = sanitize_blog_input($_POST, $existing);
        $errors = validate_blog($blog);

        if ($errors === [] && $action === 'save') {
            $index = find_blog_index($blogs, (string) $blog['id']);
            if ($index === null) {
                $blogs[] = $blog;
            } else {
                $blogs[$index] = $blog;
            }

            if (save_blogs($blogs)) {
                header('Location: index.php');
                exit;
            }
            $errors[] = 'Unable to save post. Check folder permissions for data/ and blogs.json.';
        }

        if ($errors === [] && $action === 'delete' && $existing !== null) {
            $index = find_blog_index($blogs, (string) $existing['id']);
            if ($index !== null) {
                array_splice($blogs, $index, 1);
                if (save_blogs($blogs)) {
                    header('Location: index.php');
                    exit;
                }
                $errors[] = 'Unable to delete post.';
            }
        }

        $existing = $blog;
    }
}

$form = $existing ?? [
    'id' => '',
    'title' => '',
    'excerpt' => '',
    'category' => 'Buyer',
    'date' => date('Y-m-d'),
    'readTime' => 4,
    'image' => '',
    'content' => [],
];

$body = '';
if (!empty($form['content']) && is_array($form['content'])) {
    $body = implode("\n\n", $form['content']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title><?= $existing ? 'Edit post' : 'New post' ?> | Admin</title>
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">
  <header class="admin-header">
    <div>
      <h1><?= $existing ? 'Edit post' : 'New post' ?></h1>
      <p>Published posts appear on the public Blogs page immediately after saving.</p>
    </div>
    <div class="admin-header-actions">
      <a class="admin-link" href="index.php">← All posts</a>
    </div>
  </header>

  <main class="admin-main admin-main--narrow">
    <?php foreach ($errors as $error): ?>
      <p class="admin-error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
    <?php endforeach; ?>

    <form method="post" class="admin-form">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
      <input type="hidden" name="action" value="save">

      <label for="title">Title</label>
      <input type="text" id="title" name="title" required value="<?= htmlspecialchars((string) $form['title'], ENT_QUOTES, 'UTF-8') ?>">

      <label for="id">URL slug</label>
      <input type="text" id="id" name="id" pattern="[a-z0-9-]+" value="<?= htmlspecialchars((string) $form['id'], ENT_QUOTES, 'UTF-8') ?>" placeholder="example-first-time-buyer-guide">

      <label for="date">Publish date</label>
      <input type="date" id="date" name="date" required value="<?= htmlspecialchars((string) $form['date'], ENT_QUOTES, 'UTF-8') ?>">

      <label for="category">Category</label>
      <select id="category" name="category">
        <?php foreach (['Buyer', 'Seller', 'Home Owner', 'Investor', 'Education'] as $category): ?>
          <option value="<?= $category ?>"<?= $form['category'] === $category ? ' selected' : '' ?>><?= $category ?></option>
        <?php endforeach; ?>
      </select>

      <label for="excerpt">Short summary</label>
      <textarea id="excerpt" name="excerpt" rows="3" required><?= htmlspecialchars((string) $form['excerpt'], ENT_QUOTES, 'UTF-8') ?></textarea>

      <label for="readTime">Read time (minutes)</label>
      <input type="number" id="readTime" name="readTime" min="1" max="30" value="<?= (int) $form['readTime'] ?>">

      <label for="image">Cover image URL (optional)</label>
      <input type="url" id="image" name="image" value="<?= htmlspecialchars((string) $form['image'], ENT_QUOTES, 'UTF-8') ?>" placeholder="https://...">

      <label for="body">Article</label>
      <textarea id="body" name="body" rows="14" required placeholder="Write your article here. Press Enter twice between paragraphs."><?= htmlspecialchars($body, ENT_QUOTES, 'UTF-8') ?></textarea>

      <div class="admin-form-actions">
        <button type="submit" class="admin-btn">Publish</button>
        <?php if ($existing !== null): ?>
          <button type="submit" class="admin-btn admin-btn--danger" name="action" value="delete" onclick="return confirm('Delete this post?');">Delete</button>
        <?php endif; ?>
      </div>
    </form>
  </main>
</body>
</html>

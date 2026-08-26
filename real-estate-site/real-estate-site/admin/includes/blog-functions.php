<?php
declare(strict_types=1);

const BLOG_DATA_FILE = __DIR__ . '/../../data/blogs.json';
const BLOG_PUBLIC_FILE = __DIR__ . '/../../blogs.json';

function load_blogs(): array
{
    if (!is_readable(BLOG_DATA_FILE)) {
        return [];
    }

    $raw = file_get_contents(BLOG_DATA_FILE);
    if ($raw === false) {
        return [];
    }

    $blogs = json_decode($raw, true);
    return is_array($blogs) ? $blogs : [];
}

function save_blogs(array $blogs): bool
{
    usort($blogs, static function (array $a, array $b): int {
        return strcmp($b['date'] ?? '', $a['date'] ?? '');
    });

    $json = json_encode($blogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }

    $payload = $json . "\n";

    if (file_put_contents(BLOG_DATA_FILE, $payload, LOCK_EX) === false) {
        return false;
    }

    return file_put_contents(BLOG_PUBLIC_FILE, $payload, LOCK_EX) !== false;
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-') ?: 'post';
}

function body_to_content(string $body): array
{
    $parts = preg_split("/\n\s*\n/", trim($body)) ?: [];
    $content = [];

    foreach ($parts as $part) {
        $part = trim($part);
        if ($part !== '') {
            $content[] = $part;
        }
    }

    return $content;
}

function sanitize_blog_input(array $input, ?array $existing = null): array
{
    $id = trim((string) ($input['id'] ?? ''));
    if ($id === '') {
        $id = slugify((string) ($input['title'] ?? 'post'));
    }
    $id = slugify($id);

    $title = trim((string) ($input['title'] ?? ''));
    $excerpt = trim((string) ($input['excerpt'] ?? ''));
    $category = trim((string) ($input['category'] ?? 'Buyer'));
    $date = substr(trim((string) ($input['date'] ?? date('Y-m-d'))), 0, 10);
    $readTime = max(1, min(30, (int) ($input['readTime'] ?? 4)));
    $image = trim((string) ($input['image'] ?? ''));
    $body = trim((string) ($input['body'] ?? ''));

    $allowedCategories = ['Buyer', 'Seller', 'Home Owner', 'Investor', 'Education'];
    if (!in_array($category, $allowedCategories, true)) {
        $category = 'Buyer';
    }

    $content = body_to_content($body);
    if ($content === [] && is_array($existing['content'] ?? null)) {
        $content = $existing['content'];
    }

    return [
        'id' => $id,
        'title' => $title,
        'excerpt' => $excerpt,
        'category' => $category,
        'date' => $date,
        'readTime' => $readTime,
        'image' => $image,
        'content' => $content,
    ];
}

function find_blog_index(array $blogs, string $id): ?int
{
    foreach ($blogs as $index => $blog) {
        if (($blog['id'] ?? '') === $id) {
            return $index;
        }
    }

    return null;
}

function validate_blog(array $blog): array
{
    $errors = [];

    if (($blog['title'] ?? '') === '') {
        $errors[] = 'Title is required.';
    }
    if (($blog['excerpt'] ?? '') === '') {
        $errors[] = 'Short summary is required.';
    }
    if (($blog['content'] ?? []) === []) {
        $errors[] = 'Article text is required.';
    }

    return $errors;
}

function sync_public_blogs(): void
{
    if (is_readable(BLOG_DATA_FILE)) {
        copy(BLOG_DATA_FILE, BLOG_PUBLIC_FILE);
    }
}

<?php
/**
 * Web{X} — contact-form mail handler.
 *
 * Delivers leads from the contact form to hello@thewebx.in.
 *
 * Setup (one-time):
 *   1. Upload contact.php to a PHP-capable host (cPanel, Hostinger, GoDaddy,
 *      Bluehost, etc.). NOTE: Vercel does NOT execute PHP — it will serve this
 *      file as plain text. Pick any shared host that has PHP enabled.
 *   2. Make sure PHP's mail() function is configured (default on most shared
 *      hosts). If it isn't, the response body will say so and you can swap
 *      mail() out for PHPMailer + SMTP without touching the front-end.
 *   3. Point contact.html's form data-endpoint at the absolute URL of this
 *      file on your PHP host, e.g. https://contact.thewebx.in/contact.php.
 *      (If the whole site moves to PHP hosting, leave it as the relative
 *      "contact.php" and it just works.)
 *
 * The front-end (assets/js/webx.js → initContactForm) already POSTs FormData
 * and reads { ok: true } back, so this handler matches that contract.
 */

// ---- Settings ------------------------------------------------------------
$LEAD_TO       = 'hello@thewebx.in';
$LEAD_FROM     = 'Web{X} Contact <hello@thewebx.in>';   // must usually be on your own domain
$MIN_MESSAGE   = 10;                                    // minimum chars
$ALLOWED_HOSTS = [                                      // CORS — POST origin allowlist
  'https://www.thewebx.in',
  'https://thewebx.in',
  'http://localhost:4321',                              // local preview
];

// ---- CORS ---------------------------------------------------------------
if (!empty($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $ALLOWED_HOSTS, true)) {
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
  header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method']);
  exit;
}

// ---- Read input ---------------------------------------------------------
$name     = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$email    = isset($_POST['email'])   ? trim($_POST['email'])   : '';
$message  = isset($_POST['message']) ? trim($_POST['message']) : '';
$honeypot = isset($_POST['company']) ? trim($_POST['company']) : '';

// Honeypot: real users leave this field blank, bots tend to fill every input.
// Silently return success so the bot thinks it worked.
if ($honeypot !== '') {
  echo json_encode(['ok' => true]);
  exit;
}

// ---- Validate -----------------------------------------------------------
$errors = [];
if ($name === '')                                  $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))    $errors[] = 'email';
if (mb_strlen($message) < $MIN_MESSAGE)            $errors[] = 'message';

if (!empty($errors)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'errors' => $errors]);
  exit;
}

// ---- Sanitize (header-injection prevention) ----------------------------
// Anything that goes into a mail header must not contain CR/LF.
$name  = preg_replace("/[\r\n]+/", ' ', $name);
$email = preg_replace("/[\r\n]+/", '',  $email);

// ---- Build mail ---------------------------------------------------------
$preview = mb_substr($message, 0, 60);
if (mb_strlen($message) > 60) $preview .= '…';
$subject = '=?UTF-8?B?' . base64_encode('New lead — ' . $name . ' — ' . $preview) . '?=';

$ip   = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$page = $_SERVER['HTTP_REFERER']         ?? 'direct';
$ua   = $_SERVER['HTTP_USER_AGENT']      ?? 'unknown';

$body = "New lead from the Web{X} contact form\n"
      . "----------------------------------------\n\n"
      . "Name:    {$name}\n"
      . "Email:   {$email}\n\n"
      . "Message:\n{$message}\n\n"
      . "----------------------------------------\n"
      . "Page:    {$page}\n"
      . "IP:      {$ip}\n"
      . "UA:      {$ua}\n";

$headers   = [];
$headers[] = 'From: ' . $LEAD_FROM;
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// `mail()` returns false if the local MTA isn't configured. Suppress the
// notice — we'll surface the failure in the JSON response instead.
$sent = @mail($LEAD_TO, $subject, $body, implode("\r\n", $headers));

if ($sent) {
  http_response_code(200);
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode([
    'ok'     => false,
    'error'  => 'mail',
    'detail' => 'PHP mail() returned false. Check the host\'s mail configuration or swap to SMTP via PHPMailer.',
  ]);
}

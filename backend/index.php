<?php

declare(strict_types=1);

require __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: ' . (envValue('FRONTEND_ORIGIN', '*')));
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = rtrim($path, '/') ?: '/';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && preg_match('#/payments/midtrans/token$#', $path)) {
    $serverKey = envValue('MIDTRANS_SERVER_KEY');
    if (!$serverKey) {
        jsonResponse(['message' => 'MIDTRANS_SERVER_KEY belum dikonfigurasi di backend.'], 500);
    }

    $input = requestJson();
    $rentalId = $input['rental_id'] ?? null;
    $amount = (int) ($input['amount'] ?? 0);

    if (!$rentalId || $amount < 1) {
        jsonResponse(['message' => 'rental_id dan amount wajib diisi.'], 422);
    }

    // Gunakan rental_code dari database pada aplikasi produksi agar order_id selalu unik.
    $orderId = 'RENTAL-' . preg_replace('/[^A-Za-z0-9_.~-]/', '', (string) $rentalId) . '-' . time();
    $response = midtransRequest($serverKey, [
        'transaction_details' => [
            'order_id' => $orderId,
            'gross_amount' => $amount,
        ],
        'metadata' => [
            'rental_id' => (string) $rentalId,
        ],
    ]);

    jsonResponse([
        'snap_token' => $response['token'],
        'redirect_url' => $response['redirect_url'] ?? null,
        'order_id' => $orderId,
    ], 201);
}

if ($method === 'POST' && preg_match('#/payments/midtrans/notification$#', $path)) {
    $serverKey = envValue('MIDTRANS_SERVER_KEY');
    if (!$serverKey) {
        jsonResponse(['message' => 'MIDTRANS_SERVER_KEY belum dikonfigurasi di backend.'], 500);
    }

    $notification = requestJson();
    $orderId = (string) ($notification['order_id'] ?? '');
    $statusCode = (string) ($notification['status_code'] ?? '');
    $grossAmount = (string) ($notification['gross_amount'] ?? '');
    $signature = (string) ($notification['signature_key'] ?? '');
    $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

    if (!$signature || !hash_equals($expectedSignature, $signature)) {
        jsonResponse(['message' => 'Signature Midtrans tidak valid.'], 401);
    }

    $transactionStatus = (string) ($notification['transaction_status'] ?? '');
    $fraudStatus = (string) ($notification['fraud_status'] ?? '');

    // Hubungkan bagian ini ke tabel rentals/payment project PHP kamu.
    // settlement/capture = paid, pending = pending, expire/cancel/deny = failed.
    $mappedStatus = match (true) {
        in_array($transactionStatus, ['settlement', 'capture'], true) && ($fraudStatus === '' || $fraudStatus === 'accept') => 'paid',
        $transactionStatus === 'pending' => 'pending',
        in_array($transactionStatus, ['expire', 'cancel', 'deny'], true) => 'failed',
        default => 'pending',
    };

    error_log(sprintf('Midtrans order=%s status=%s mapped=%s', $orderId, $transactionStatus, $mappedStatus));
    jsonResponse(['message' => 'Notifikasi diterima.', 'payment_status' => $mappedStatus]);
}

jsonResponse(['message' => 'Route tidak ditemukan.'], 404);

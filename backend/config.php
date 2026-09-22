<?php

declare(strict_types=1);

function envValue(string $name, ?string $default = null): ?string
{
    $value = getenv($name);
    return $value === false || $value === '' ? $default : $value;
}

function jsonResponse(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function requestJson(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);

    if (!is_array($data)) {
        jsonResponse(['message' => 'Request JSON tidak valid.'], 422);
    }

    return $data;
}

function midtransRequest(string $serverKey, array $payload): array
{
    $curl = curl_init('https://app.sandbox.midtrans.com/snap/v1/transactions');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($serverKey . ':'),
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 30,
    ]);

    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($body === false || $error) {
        throw new RuntimeException('Gagal terhubung ke Midtrans: ' . $error);
    }

    $response = json_decode($body, true);
    if (!is_array($response)) {
        throw new RuntimeException('Respons Midtrans tidak valid.');
    }

    if ($status < 200 || $status >= 300) {
        $message = $response['error_messages'][0] ?? 'Midtrans menolak transaksi.';
        throw new RuntimeException($message);
    }

    return $response;
}

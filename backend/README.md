# CampRent Midtrans PHP Backend

Endpoint ini membuat Snap token di server PHP sehingga `MIDTRANS_SERVER_KEY` tidak pernah masuk ke browser.

## Setup Laragon

1. Copy folder `backend` ke project PHP/backend kamu, atau expose folder ini sebagai route `/api`.
2. Set environment variable:

```text
MIDTRANS_SERVER_KEY=Mid-server-...
FRONTEND_ORIGIN=http://localhost:5173
```

3. Pastikan extension PHP `curl` aktif.
4. Set URL notifikasi di Midtrans Sandbox Dashboard ke:

```text
https://domain-kamu/api/payments/midtrans/notification
```

## Endpoint

Frontend memanggil:

```text
POST /api/payments/midtrans/token
Content-Type: application/json

{"rental_id": 123, "amount": 288000}
```

Respons:

```json
{"snap_token":"...","redirect_url":"...","order_id":"..."}
```

Notifikasi Midtrans masuk ke `/api/payments/midtrans/notification`. Handler memvalidasi `signature_key` dan memetakan status menjadi `paid`, `pending`, atau `failed`.

## Catatan integrasi database

Handler notifikasi saat ini menulis status ke `error_log` sebagai adapter aman. Hubungkan `$orderId`, `metadata.rental_id`, dan `$mappedStatus` ke tabel `rentals`/`payments` backend PHP kamu agar status transaksi tersimpan otomatis. Jangan menerima status pembayaran dari frontend sebagai sumber kebenaran.

<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * EMVCo / QRIS payload helpers: validate a merchant's static QRIS string and
 * turn it into a dynamic one carrying a fixed amount (tag 54) with a fresh
 * CRC (tag 63).
 */
class QrisPayload
{
    /**
     * Parse top-level TLV entries as [tag => value], preserving order.
     *
     * @throws InvalidArgumentException when the payload is not well-formed TLV.
     */
    public static function parse(string $payload): array
    {
        $entries = [];
        $offset = 0;
        $length = strlen($payload);

        while ($offset < $length) {
            if ($offset + 4 > $length) {
                throw new InvalidArgumentException('Struktur QRIS tidak valid.');
            }

            $tag = substr($payload, $offset, 2);
            $size = substr($payload, $offset + 2, 2);

            if (! ctype_digit($tag) || ! ctype_digit($size) || $offset + 4 + (int) $size > $length) {
                throw new InvalidArgumentException('Struktur QRIS tidak valid.');
            }

            $entries[$tag] = substr($payload, $offset + 4, (int) $size);
            $offset += 4 + (int) $size;
        }

        return $entries;
    }

    /**
     * Validate a static QRIS payload and return its parsed entries.
     *
     * @throws InvalidArgumentException with a user-facing message.
     */
    public static function validate(string $payload): array
    {
        $payload = trim($payload);
        $entries = self::parse($payload);

        if (($entries['00'] ?? null) !== '01') {
            throw new InvalidArgumentException('Payload bukan format QRIS (EMVCo) yang valid.');
        }

        if (! isset($entries['63']) || ! str_ends_with($payload, '6304'.$entries['63'])) {
            throw new InvalidArgumentException('Payload QRIS tidak memiliki CRC.');
        }

        if (strtoupper($entries['63']) !== self::crc16(substr($payload, 0, -4))) {
            throw new InvalidArgumentException('CRC QRIS tidak cocok. Pastikan QRIS tidak terpotong atau rusak.');
        }

        if (($entries['53'] ?? null) !== '360') {
            throw new InvalidArgumentException('QRIS harus menggunakan mata uang Rupiah (IDR).');
        }

        return $entries;
    }

    /** Build a dynamic QRIS payload for an exact rupiah amount. */
    public static function withAmount(string $staticPayload, int $amount): string
    {
        $entries = self::parse(trim($staticPayload));

        unset($entries['63']);
        $entries['01'] = '12'; // point of initiation: dynamic
        $entries['54'] = (string) $amount;
        ksort($entries, SORT_STRING);

        $body = '';
        foreach ($entries as $tag => $value) {
            $body .= $tag.str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT).$value;
        }
        $body .= '6304';

        return $body.self::crc16($body);
    }

    /** CRC-16/CCITT-FALSE, as required by EMVCo tag 63. */
    public static function crc16(string $data): string
    {
        $crc = 0xFFFF;
        $length = strlen($data);

        for ($i = 0; $i < $length; $i++) {
            $crc ^= ord($data[$i]) << 8;
            for ($bit = 0; $bit < 8; $bit++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}

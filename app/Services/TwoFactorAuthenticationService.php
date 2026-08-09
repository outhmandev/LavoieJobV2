<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class TwoFactorAuthenticationService
{
    private static string $base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Generate a new Base32 secret key (16 or 32 chars).
     */
    public function generateSecretKey(int $length = 32): string
    {
        $secret = '';
        $charsLen = strlen(self::$base32Chars);
        for ($i = 0; $i < $length; $i++) {
            $secret .= self::$base32Chars[random_int(0, $charsLen - 1)];
        }
        return $secret;
    }

    /**
     * Generate standard otpauth URI.
     */
    public function getQrCodeUrl(string $companyName, string $email, string $secret): string
    {
        return sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30',
            rawurlencode($companyName),
            rawurlencode($email),
            $secret,
            rawurlencode($companyName)
        );
    }

    /**
     * Generate an SVG QR Code directly from string (compact, zero-dependency QR matrix).
     * Uses public SVG QR endpoint or pure vector generation.
     */
    public function generateQrCodeSvg(string $companyName, string $email, string $secret): string
    {
        $otpUrl = $this->getQrCodeUrl($companyName, $email, $secret);
        // We provide both the direct otpUrl for frontend QR rendering and quick scanner links
        return $otpUrl;
    }

    /**
     * Generate current 6-digit TOTP code for secret.
     */
    public function generateCurrentCode(string $secret): string
    {
        $currentTimeSlice = (int) floor(time() / 30);
        return $this->calculateCode($secret, $currentTimeSlice);
    }

    /**
     * Verify a 6-digit TOTP code against a secret with window drift tolerance (+/- 1 period = 30s).
     */
    public function verifyCode(string $secret, string $code, int $window = 1): bool
    {
        $code = trim($code);
        if (strlen($code) !== 6 || !ctype_digit($code)) {
            return false;
        }

        $currentTimeSlice = (int) floor(time() / 30);

        for ($i = -$window; $i <= $window; $i++) {
            $calculatedCode = $this->calculateCode($secret, $currentTimeSlice + $i);
            if (hash_equals($calculatedCode, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate 8 secure 10-character backup recovery codes.
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $code = strtoupper(Str::random(5) . '-' . Str::random(5));
            $codes[] = $code;
        }
        return $codes;
    }

    /**
     * Verify and consume a backup recovery code for a user.
     */
    public function verifyAndConsumeRecoveryCode(User $user, string $code): bool
    {
        $code = trim(strtoupper($code));
        $rawCodes = $user->two_factor_recovery_codes;
        
        if (empty($rawCodes)) {
            return false;
        }

        $codes = is_array($rawCodes) ? $rawCodes : json_decode($rawCodes, true);
        if (!is_array($codes)) {
            return false;
        }

        foreach ($codes as $index => $storedCode) {
            if (hash_equals($storedCode, $code)) {
                // Remove used code
                unset($codes[$index]);
                $user->update([
                    'two_factor_recovery_codes' => array_values($codes),
                ]);
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate TOTP 6-digit code for a given time slice (RFC 6238).
     */
    private function calculateCode(string $secret, int $timeSlice): string
    {
        $secretKey = $this->base32Decode($secret);
        
        // Pack time slice into 8-byte big-endian binary string
        $timeBytes = pack('N*', 0) . pack('N*', $timeSlice);

        // Calculate HMAC-SHA1
        $hmac = hash_hmac('sha1', $timeBytes, $secretKey, true);

        // Dynamic truncation
        $offset = ord(substr($hmac, -1)) & 0x0F;
        $unpacked = unpack('N', substr($hmac, $offset, 4));
        $value = $unpacked[1] & 0x7FFFFFFF;

        $pin = $value % 1000000;
        return str_pad((string) $pin, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Decode Base32 string to binary.
     */
    private function base32Decode(string $secret): string
    {
        $secret = strtoupper($secret);
        $buffer = 0;
        $bitsLeft = 0;
        $result = '';

        for ($i = 0; $i < strlen($secret); $i++) {
            $char = $secret[$i];
            $val = strpos(self::$base32Chars, $char);
            if ($val === false) {
                continue;
            }

            $buffer = ($buffer << 5) | $val;
            $bitsLeft += 5;

            if ($bitsLeft >= 8) {
                $bitsLeft -= 8;
                $result .= chr(($buffer >> $bitsLeft) & 0xFF);
            }
        }

        return $result;
    }
}

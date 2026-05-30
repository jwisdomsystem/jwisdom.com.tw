<?php

namespace App\Support;

class Img
{
    /** 上傳圖片預設最長邊（px）；超過會等比例縮小，避免大圖拖慢頁面。 */
    public const MAX_DIMENSION = 1600;

    /**
     * 自動處理影像：(1) 超過最長邊就等比例縮小、(2) 轉成 WebP（縮小體積、改善 LCP）。
     * 失敗則原樣回傳 JPG。
     *
     * @return array{0: string, 1: string}  [binary, ext]
     */
    public static function webp(string $binary, int $quality = 80, int $maxDimension = self::MAX_DIMENSION): array
    {
        if (! function_exists('imagewebp') || $binary === '') {
            return [$binary, 'jpg'];
        }
        try {
            $src = @imagecreatefromstring($binary);
            if ($src === false) {
                return [$binary, 'jpg'];
            }

            $w = imagesx($src);
            $h = imagesy($src);

            // 超過最長邊就等比例縮小
            if ($maxDimension > 0 && ($w > $maxDimension || $h > $maxDimension)) {
                $ratio = $w >= $h ? $maxDimension / $w : $maxDimension / $h;
                $nw = (int) round($w * $ratio);
                $nh = (int) round($h * $ratio);

                $dst = imagecreatetruecolor($nw, $nh);
                // 保留透明度（PNG → WebP）
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                imagefilledrectangle($dst, 0, 0, $nw, $nh, $transparent);

                imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
                imagedestroy($src);
                $src = $dst;
            } else {
                imagepalettetotruecolor($src);
                imagealphablending($src, true);
                imagesavealpha($src, true);
            }

            ob_start();
            $ok = imagewebp($src, null, $quality);
            $webp = (string) ob_get_clean();
            imagedestroy($src);

            if ($ok && $webp !== '') {
                return [$webp, 'webp'];
            }
        } catch (\Throwable $e) {
            // fall through
        }

        return [$binary, 'jpg'];
    }
}

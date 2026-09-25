<?php

namespace App\Services;

use App\Models\Theme;

/**
 * Generates an illustrated SVG cover for every theme and stores it under
 * public/images/theme-covers/{slug}.svg. The illustration is picked from the
 * theme's tags/description (cake, balloons, mosque, flowers, …) and painted in
 * the theme's own color_primary / color_secondary, so each card in the theme
 * picker previews the mood of the invitation it stands for.
 */
class ThemeCoverService
{
    public const PUBLIC_DIR = 'images/theme-covers';

    private const W = 300;

    private const H = 400;

    /**
     * Motif => keywords, in priority order: the first motif with a keyword
     * found in the theme's tags + name + description wins. Specific objects
     * come first, broad style words (hijau, emas, elegan…) last.
     */
    private const MOTIFS = [
        'question'   => ['boy or girl', 'laki-laki atau perempuan', 'reveal'],
        'dino'       => ['dinosaurus', 'dino'],
        'unicorn'    => ['unicorn'],
        'tv'         => ['televisi'],
        'cat'        => ['kucing'],
        'bear'       => ['beruang', 'madu', 'teddy'],
        'robot'      => ['robot'],
        'plane'      => ['pesawat'],
        'rocket'     => ['roket', 'luar angkasa', 'planet'],
        'car'        => ['balapan', 'gokart', 'mobil', 'balap'],
        'hero'      => ['superhero', 'komik', 'pahlawan'],
        'ball'       => ['sepak bola', 'bola'],
        'trophy'     => ['piala', 'juara'],
        'candy'      => ['permen'],
        'paint'      => ['cat', 'kreatif'],
        'paws'       => ['safari', 'jip', 'rimba', 'hewan'],
        'clouds'     => ['bangau', 'awan'],
        'footprints' => ['jejak kaki'],
        'pacifier'   => ['dot bayi', 'bayi', 'mainan bayi'],
        'sheep'      => ['domba', 'kambing'],
        'cake'       => ['kue'],
        'balloons'   => ['balon'],
        'confetti'   => ['konfeti', 'confetti', 'kejutan', 'meriah'],
        'bubbles'    => ['gelembung'],
        'rainbow'    => ['pelangi'],
        'castle'     => ['istana', 'kerajaan', 'putri', 'pangeran'],
        'shield'     => ['ksatria'],
        'crown'      => ['rajawali', 'raja'],
        'anchor'     => ['bahari', 'kapten'],
        'waves'      => ['laut', 'ikan', 'pantai', 'terumbu'],
        'confetti2'  => ['warna-warni'],
        'sakura'     => ['sakura'],
        'flower'     => ['bunga', 'floral', 'mawar', 'rose', 'blush', 'mekar', 'taman', 'romantis', 'senja', 'vintage', 'lavender'],
        'wheat'      => ['panen'],
        'mosque'     => ['kaligrafi', 'islami', 'sarung', 'padang pasir', 'masjid', 'khidmat', 'nur', 'cahaya', 'syahdu', 'syukur'],
        'moon'       => ['bulan', 'malam', 'galaksi', 'bintang', 'lentera'],
        'sun'        => ['matahari', 'mentari'],
        'house'      => ['rumah'],
        'wreath'     => ['hutan', 'daun', 'alam', 'tropis', 'botani', 'kebun', 'natural', 'sage', 'boho', 'rustic', 'terakota', 'terracotta', 'hijau'],
        'hearts'     => ['manis', 'cinta', 'pink'],
        'medallion'  => ['emas', 'mewah', 'champagne', 'renda', 'ivory', 'klasik', 'elegan', 'maroon', 'gold', 'anggun', 'berkelas', 'kilau', 'istimewa', 'minimalis', 'navy', 'silver'],
    ];

    /** Fallback motif per invitation type when no keyword matches. */
    private const EVENT_DEFAULT_MOTIF = [
        'wedding'       => 'rings',
        'birthday'      => 'cake',
        'khitanan'      => 'mosque',
        'aqiqah'        => 'sheep',
        'gender_reveal' => 'question',
        'syukuran'      => 'tumpeng',
    ];

    /** Background sprinkle style per motif; anything unlisted gets dots. */
    private const SPRINKLES = [
        'petals'   => ['flower', 'sakura', 'hearts', 'rings'],
        'stars'    => ['moon', 'rocket', 'unicorn', 'rainbow', 'castle', 'crown', 'medallion', 'hero', 'shield', 'plane'],
        'confetti' => ['cake', 'balloons', 'confetti', 'candy', 'paint', 'tv', 'car', 'bubbles', 'question', 'trophy', 'ball', 'robot'],
        'leaves'   => ['wreath', 'paws', 'dino', 'bear', 'wheat', 'house', 'tumpeng', 'sheep', 'cat'],
        'islamic'  => ['mosque'],
    ];

    private const NIGHT_KEYWORDS = ['malam', 'galaksi', 'luar angkasa', 'angkasa'];

    private const EVENT_COPY = [
        'wedding'       => ['label' => 'THE WEDDING OF', 'titles' => ['Rania & Dimas', 'Salsa & Fikri', 'Nadia & Arga', 'Laras & Bima', 'Aulia & Reza']],
        'birthday'      => ['label' => 'HAPPY BIRTHDAY', 'titles' => ['Alya', 'Kenzo', 'Naura', 'Arka', 'Kirana']],
        'khitanan'      => ['label' => 'WALIMATUL KHITAN', 'titles' => ['M. Rafa', 'Arkan', 'Fathan', 'Zidan', 'Alfarizi']],
        'aqiqah'        => ['label' => 'TASYAKURAN AQIQAH', 'titles' => ['Aisyah', 'Hafiz', 'Khanza', 'Yusuf', 'Humaira']],
        'gender_reveal' => ['label' => 'GENDER REVEAL', 'titles' => ['Boy or Girl?', 'He or She?']],
        'syukuran'      => ['label' => 'TASYAKURAN', 'titles' => ['Kel. Hadi', 'Kel. Wijaya', 'Kel. Santoso', 'Kel. Pratama']],
    ];

    private const DATES = ['12 . 12 . 2026', '20 . 06 . 2026', '08 . 08 . 2026', '17 . 10 . 2026', '05 . 04 . 2026'];

    private int $seed = 1;

    /** @var array<string, string> */
    private array $c = [];

    public static function urlFor(string $slug): string
    {
        return '/' . self::PUBLIC_DIR . '/' . $slug . '.svg';
    }

    /**
     * Writes every theme's cover and points thumbnail_url at it. Themes that
     * already have a working custom thumbnail keep it unless $force is set.
     *
     * @return array{written: int, linked: int}
     */
    public function syncAll(bool $force = false): array
    {
        $dir = public_path(self::PUBLIC_DIR);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $written = 0;
        $linked = 0;

        foreach (Theme::query()->orderBy('id')->get() as $theme) {
            file_put_contents($dir . DIRECTORY_SEPARATOR . $theme->slug . '.svg', $this->generate($theme));
            $written++;

            if ($force || $this->shouldReplaceThumbnail($theme->thumbnail_url)) {
                $url = self::urlFor($theme->slug);
                if ($theme->thumbnail_url !== $url) {
                    // Query update: skips the sort_order model hooks.
                    Theme::whereKey($theme->id)->update(['thumbnail_url' => $url]);
                    $linked++;
                }
            }
        }

        return ['written' => $written, 'linked' => $linked];
    }

    /**
     * Empty, previously generated, or a local path that doesn't exist under
     * public/ (a broken seed value) → safe to replace with the generated cover.
     */
    private function shouldReplaceThumbnail(?string $url): bool
    {
        if ($url === null || trim($url) === '' || str_starts_with($url, '/' . self::PUBLIC_DIR . '/')) {
            return true;
        }

        if (preg_match('#^(https?:)?//#i', $url) || str_starts_with($url, '/storage/')) {
            return false;
        }

        return ! is_file(public_path(ltrim(parse_url($url, PHP_URL_PATH) ?? '', '/')));
    }

    public function generate(Theme $theme): string
    {
        $this->seed = crc32($theme->slug) ?: 1;

        $haystack = mb_strtolower(implode(' ', [
            // Not the name: "Gender Reveal Theme 13" would always hit 'reveal'.
            implode(' ', (array) ($theme->tags ?? [])),
            $theme->description ?? '',
        ]));

        $motif = $this->pickMotif($haystack, $theme->event_type);
        $this->c = $this->palette(
            $this->hex($theme->color_primary, '#b76e79'),
            $this->hex($theme->color_secondary, '#fdf2f2'),
            $this->containsAny($haystack, self::NIGHT_KEYWORDS),
        );

        $copy = self::EVENT_COPY[$theme->event_type] ?? ['label' => 'UNDANGAN', 'titles' => ['Save the Date']];
        $title = $copy['titles'][$this->seed % count($copy['titles'])];
        $date = self::DATES[intdiv($this->seed, 7) % count(self::DATES)];

        $c = $this->c;
        $titleSize = mb_strlen($title) > 13 ? 23 : 28;
        $body = $this->{'motif' . ucfirst($motif)}();

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="600" height="800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{$c['bg1']}"/>
      <stop offset="1" stop-color="{$c['bg2']}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.44" r="0.5">
      <stop offset="0" stop-color="{$c['glow']}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="{$c['glow']}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)"/>
  <circle cx="150" cy="178" r="150" fill="url(#glow)"/>
  {$this->sprinkles($motif)}
  <rect x="14" y="14" width="272" height="372" rx="16" fill="none" stroke="{$c['a']}" stroke-opacity="0.55" stroke-width="1.4"/>
  <rect x="21" y="21" width="258" height="358" rx="12" fill="none" stroke="{$c['a']}" stroke-opacity="0.3" stroke-width="0.7"/>
  {$this->corners()}
  <text x="150" y="58" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10.5" font-weight="600" letter-spacing="3.2" fill="{$c['ink']}" fill-opacity="0.85">{$this->e($copy['label'])}</text>
  <g transform="translate(150 180)">{$body}</g>
  <text x="150" y="304" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="{$titleSize}" fill="{$c['ink']}">{$this->e($title)}</text>
  <g fill="{$c['a']}" stroke="{$c['a']}">
    <line x1="104" y1="322" x2="140" y2="322" stroke-width="0.8" stroke-opacity="0.6"/>
    <line x1="160" y1="322" x2="196" y2="322" stroke-width="0.8" stroke-opacity="0.6"/>
    <path d="M150 317 L154 322 L150 327 L146 322 Z" stroke="none"/>
  </g>
  <text x="150" y="346" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" letter-spacing="2.4" fill="{$c['ink']}" fill-opacity="0.7">{$date}</text>
</svg>
SVG;
    }

    // ─── Selection & palette ─────────────────────────────────────────────────

    private function pickMotif(string $haystack, ?string $eventType): string
    {
        foreach (self::MOTIFS as $motif => $keywords) {
            if ($this->containsAny($haystack, $keywords)) {
                return match (true) {
                    $motif === 'confetti2'                              => 'confetti',
                    $motif === 'medallion' && $eventType === 'syukuran' => 'tumpeng',
                    default                                             => $motif,
                };
            }
        }

        return self::EVENT_DEFAULT_MOTIF[$eventType] ?? 'medallion';
    }

    /** @param  string[]  $keywords */
    private function containsAny(string $haystack, array $keywords): bool
    {
        foreach ($keywords as $kw) {
            if (preg_match('/(?<![\p{L}])' . preg_quote($kw, '/') . '(?![\p{L}])/u', $haystack)) {
                return true;
            }
        }

        return false;
    }

    /** @return array<string, string> */
    private function palette(string $p, string $s, bool $night): array
    {
        $lp = $this->lum($p);
        $ls = $this->lum($s);
        $dark = ($night && $lp < 0.2) || $lp < 0.025;

        if ($dark) {
            $a = $ls > 0.15 ? $s : '#f3d27a';

            return [
                'bg1'  => $this->mix($p, '#ffffff', 0.1),
                'bg2'  => $this->mix($p, '#000000', 0.35),
                'glow' => $this->mix($p, '#ffffff', 0.25),
                'a'    => $a,
                'b'    => $this->mix($p, '#ffffff', 0.5),
                'soft' => $this->mix($p, '#ffffff', 0.18),
                'ink'  => $this->mix($a, '#ffffff', 0.35),
                'leaf' => $this->mix('#6b9a5b', $a, 0.25),
                'dark' => $this->mix($p, '#000000', 0.5),
            ];
        }

        $bg = $ls > 0.55 ? $this->mix($s, '#ffffff', 0.35) : $this->mix($p, '#ffffff', 0.88);
        $a = $lp > 0.45 ? $this->mix($p, '#000000', 0.35) : $p;
        $b = ($ls < 0.75 && abs($ls - $this->lum($bg)) > 0.15) ? $s : $this->mix($p, '#ffffff', 0.45);

        return [
            'bg1'  => $bg,
            'bg2'  => $this->mix($p, $bg, 0.78),
            'glow' => '#ffffff',
            'a'    => $a,
            'b'    => $b,
            'soft' => $this->mix($p, '#ffffff', 0.7),
            'ink'  => $this->mix($a, '#000000', 0.3),
            'leaf' => $this->mix('#5b8a4a', $a, 0.25),
            'dark' => $this->mix($a, '#000000', 0.55),
        ];
    }

    private function hex(?string $value, string $fallback): string
    {
        $h = ltrim(trim((string) $value), '#');
        if (! preg_match('/^[0-9a-f]{1,6}$/i', $h)) {
            return $fallback;
        }
        if (strlen($h) === 3) {
            $h = $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
        }

        return '#' . strtolower(str_pad($h, 6, '0', STR_PAD_LEFT));
    }

    /** @return array{int, int, int} */
    private function rgb(string $hex): array
    {
        return [hexdec(substr($hex, 1, 2)), hexdec(substr($hex, 3, 2)), hexdec(substr($hex, 5, 2))];
    }

    private function lum(string $hex): float
    {
        [$r, $g, $b] = array_map(function (int $v) {
            $v /= 255;

            return $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4;
        }, $this->rgb($hex));

        return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
    }

    /** Blend $a toward $b by $t (0 = $a, 1 = $b). */
    private function mix(string $a, string $b, float $t): string
    {
        $x = $this->rgb($a);
        $y = $this->rgb($b);

        return sprintf('#%02x%02x%02x', ...array_map(fn ($i) => (int) round($x[$i] + ($y[$i] - $x[$i]) * $t), [0, 1, 2]));
    }

    // ─── Shared drawing helpers ──────────────────────────────────────────────

    private function rand(): float
    {
        $this->seed = ($this->seed * 1103515245 + 12345) & 0x7fffffff;

        return $this->seed / 0x7fffffff;
    }

    private function e(string $s): string
    {
        return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private function starPath(float $cx, float $cy, float $ro, float $ri, int $n = 5, float $rot = -90): string
    {
        $pts = [];
        for ($i = 0; $i < $n * 2; $i++) {
            $r = $i % 2 === 0 ? $ro : $ri;
            $ang = deg2rad($rot + $i * 180 / $n);
            $pts[] = round($cx + $r * cos($ang), 2) . ' ' . round($cy + $r * sin($ang), 2);
        }

        return 'M' . implode(' L', $pts) . ' Z';
    }

    private function flower(float $x, float $y, float $size, string $petal, string $center, int $n = 6, float $opacity = 0.92): string
    {
        $out = "<g transform=\"translate($x $y)\">";
        for ($i = 0; $i < $n; $i++) {
            $deg = $i * 360 / $n;
            $out .= sprintf('<ellipse cx="0" cy="%s" rx="%s" ry="%s" fill="%s" fill-opacity="%s" transform="rotate(%s)"/>',
                -$size * 0.5, $size * 0.3, $size * 0.5, $petal, $opacity, $deg);
        }

        return $out . sprintf('<circle r="%s" fill="%s"/></g>', $size * 0.22, $center);
    }

    private function leaf(float $x, float $y, float $len, float $deg, string $fill, float $opacity = 0.9): string
    {
        $w = $len * 0.38;

        return sprintf('<path d="M0 0 Q%s %s 0 %s Q%s %s 0 0 Z" fill="%s" fill-opacity="%s" transform="translate(%s %s) rotate(%s)"/>',
            $w, -$len / 2, -$len, -$w, -$len / 2, $fill, $opacity, $x, $y, $deg);
    }

    private function crescent(float $x, float $y, float $r, string $fill): string
    {
        // Inner arc needs a radius > $r, otherwise SVG scales it back onto the outer arc.
        $ir = $r * 1.2;

        return sprintf('<path d="M%1$s %2$s A%3$s %3$s 0 1 0 %1$s %4$s A%5$s %5$s 0 0 1 %1$s %2$s Z" fill="%6$s"/>',
            $x, $y - $r, $r, $y + $r, $ir, $fill);
    }

    private function cloud(float $x, float $y, float $s, string $fill, string $stroke): string
    {
        return sprintf('<path d="M-30 10 A14 14 0 0 1 -22 -12 A18 18 0 0 1 10 -18 A15 15 0 0 1 30 -4 A12 12 0 0 1 30 10 Z" fill="%s" stroke="%s" stroke-width="1.5" stroke-opacity="0.5" transform="translate(%s %s) scale(%s)"/>',
            $fill, $stroke, $x, $y, $s);
    }

    private function heart(float $x, float $y, float $s, string $fill, float $opacity = 1): string
    {
        return sprintf('<path d="M0 8 C-14 -2 -12 -14 -5 -14 C-2 -14 0 -12 0 -9 C0 -12 2 -14 5 -14 C12 -14 14 -2 0 8 Z" fill="%s" fill-opacity="%s" transform="translate(%s %s) scale(%s)"/>',
            $fill, $opacity, $x, $y, $s);
    }

    private function sprinkles(string $motif): string
    {
        $style = 'dots';
        foreach (self::SPRINKLES as $name => $motifs) {
            if (in_array($motif, $motifs, true)) {
                $style = $name;
                break;
            }
        }

        $c = $this->c;
        $colors = [$c['a'], $c['b'], $c['soft']];
        $out = '<g>';
        $placed = 0;

        for ($try = 0; $try < 80 && $placed < 22; $try++) {
            $x = 30 + $this->rand() * 240;
            $y = 30 + $this->rand() * 340;
            // Keep the centre clear for the illustration and the text block.
            if ($x > 62 && $x < 238 && $y > 70 && $y < 360) {
                continue;
            }
            $col = $colors[$placed % 3];
            $s = 0.6 + $this->rand() * 0.8;
            $rot = round($this->rand() * 360);
            $out .= match ($style) {
                'petals'   => sprintf('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s" fill-opacity="0.55" transform="rotate(%s %.1f %.1f)"/>', $x, $y, 3 * $s, 6 * $s, $col, $rot, $x, $y),
                'stars'    => sprintf('<path d="%s" fill="%s" fill-opacity="0.8"/>', $this->starPath($x, $y, 4.5 * $s, 1.8 * $s, 4, $rot), $col),
                'confetti' => $placed % 2
                    ? sprintf('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1" fill="%s" fill-opacity="0.75" transform="rotate(%s %.1f %.1f)"/>', $x, $y, 3 * $s, 8 * $s, $col, $rot, $x, $y)
                    : sprintf('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" fill-opacity="0.7"/>', $x, $y, 2.6 * $s, $col),
                'leaves'   => $this->leaf(round($x, 1), round($y, 1), 11 * $s, $rot, $placed % 2 ? $c['leaf'] : $c['a'], 0.5),
                'islamic'  => sprintf('<path d="%s" fill="%s" fill-opacity="0.45"/>', $this->starPath($x, $y, 5 * $s, 3.2 * $s, 8, 0), $col),
                default    => sprintf('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" fill-opacity="0.5"/>', $x, $y, 2.2 * $s, $col),
            };
            $placed++;
        }

        return $out . '</g>';
    }

    private function corners(): string
    {
        $a = $this->c['a'];
        $out = '';
        foreach ([[30, 30, 0], [270, 30, 90], [270, 370, 180], [30, 370, 270]] as [$x, $y, $rot]) {
            $out .= sprintf('<g transform="translate(%s %s) rotate(%s)" fill="none" stroke="%s" stroke-width="1" stroke-opacity="0.7"><path d="M0 22 Q0 0 22 0"/><path d="M6 22 Q6 6 22 6" stroke-opacity="0.4"/><circle cx="0" cy="0" r="2" fill="%s" stroke="none"/></g>',
                $x, $y, $rot, $a, $a);
        }

        return $out;
    }

    // ─── Motifs (drawn around 0,0 — roughly ±75px wide, ±70px tall) ─────────

    private function motifRings(): string
    {
        $c = $this->c;

        return $this->leaf(-70, 40, 30, -60, $c['leaf'], 0.7) . $this->leaf(-58, 55, 26, -30, $c['leaf'], 0.6)
            . $this->leaf(70, 40, 30, 60, $c['leaf'], 0.7) . $this->leaf(58, 55, 26, 30, $c['leaf'], 0.6)
            . "<circle cx=\"-20\" cy=\"8\" r=\"36\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"6\"/>"
            . "<circle cx=\"20\" cy=\"8\" r=\"36\" fill=\"none\" stroke=\"{$c['b']}\" stroke-width=\"6\"/>"
            . "<path d=\"M-20 -40 L-10 -30 L-20 -20 L-30 -30 Z\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . $this->heart(0, -52, 0.9, $c['a'], 0.8);
    }

    private function motifFlower(): string
    {
        $c = $this->c;

        return $this->leaf(-20, 40, 46, -40, $c['leaf']) . $this->leaf(22, 40, 46, 42, $c['leaf'])
            . $this->leaf(-58, 34, 30, -80, $c['leaf'], 0.8) . $this->leaf(58, 30, 30, 80, $c['leaf'], 0.8)
            . $this->flower(0, -8, 60, $c['a'], $c['b'], 6)
            . $this->flower(0, -8, 32, $c['soft'], $c['a'], 6)
            . $this->flower(-54, 22, 30, $c['b'], $c['a'], 5)
            . $this->flower(54, 18, 34, $c['b'], $c['a'], 5);
    }

    private function motifSakura(): string
    {
        $c = $this->c;
        $out = "<path d=\"M-80 40 Q-30 20 0 -10 Q30 -40 75 -50\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"4\" stroke-linecap=\"round\"/>"
            . "<path d=\"M-20 10 Q-30 -20 -50 -35\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>";
        foreach ([[-50, -35, 34], [0, -12, 42], [45, -42, 30], [-40, 28, 28], [30, 20, 24]] as [$x, $y, $s]) {
            $out .= $this->flower($x, $y, $s, $c['a'], $c['soft'], 5);
        }

        return $out;
    }

    private function motifWreath(): string
    {
        $c = $this->c;
        $out = '';
        for ($i = 0; $i < 22; $i++) {
            $deg = -90 + $i * 360 / 22;
            if ($deg > 70 && $deg < 110) {
                continue;
            }
            $rad = deg2rad($deg);
            $out .= $this->leaf(round(58 * cos($rad), 1), round(58 * sin($rad), 1), 22, $deg + 180 + ($i % 2 ? 25 : -25), $i % 3 ? $c['leaf'] : $c['a'], 0.85);
        }

        return $out . "<circle r=\"36\" fill=\"{$c['soft']}\" fill-opacity=\"0.5\" stroke=\"{$c['a']}\" stroke-width=\"1.2\"/>"
            . $this->leaf(0, 14, 34, 0, $c['a']) . $this->leaf(0, 14, 26, -40, $c['leaf']) . $this->leaf(0, 14, 26, 40, $c['leaf'])
            . "<path d=\"M-8 62 Q0 54 8 62\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>";
    }

    private function motifMoon(): string
    {
        $c = $this->c;

        return "<circle r=\"62\" fill=\"{$c['a']}\" fill-opacity=\"0.08\"/>"
            . $this->crescent(-8, 0, 50, $c['a'])
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(40, -30, 14, 6), $c['a'])
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(52, 22, 9, 4), $c['b'])
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(-58, -46, 7, 3), $c['b'])
            . "<line x1=\"40\" y1=\"-72\" x2=\"40\" y2=\"-44\" stroke=\"{$c['a']}\" stroke-width=\"1\" stroke-opacity=\"0.6\"/>";
    }

    private function motifMosque(): string
    {
        $c = $this->c;

        return "<rect x=\"-52\" y=\"8\" width=\"104\" height=\"52\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-38 10 C-38 -30 38 -30 38 10 Z\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-30 10 C-30 -22 30 -22 30 10 Z\" fill=\"{$c['b']}\" fill-opacity=\"0.35\"/>"
            . "<line x1=\"0\" y1=\"-26\" x2=\"0\" y2=\"-40\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . $this->crescent(0, -48, 7, $c['a'])
            . "<rect x=\"-72\" y=\"-34\" width=\"12\" height=\"94\" fill=\"{$c['a']}\"/><path d=\"M-72 -34 L-66 -50 L-60 -34 Z\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"60\" y=\"-34\" width=\"12\" height=\"94\" fill=\"{$c['a']}\"/><path d=\"M60 -34 L66 -50 L72 -34 Z\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-12 60 L-12 40 A12 12 0 0 1 12 40 L12 60 Z\" fill=\"{$c['soft']}\"/>"
            . "<path d=\"M-38 36 L-38 26 A6 6 0 0 1 -26 26 L-26 36 Z M26 36 L26 26 A6 6 0 0 1 38 26 L38 36 Z\" fill=\"{$c['soft']}\"/>"
            . "<rect x=\"-80\" y=\"60\" width=\"160\" height=\"4\" rx=\"2\" fill=\"{$c['b']}\"/>";
    }

    private function motifCake(): string
    {
        $c = $this->c;
        $out = "<ellipse cx=\"0\" cy=\"58\" rx=\"70\" ry=\"8\" fill=\"{$c['b']}\" fill-opacity=\"0.6\"/>"
            . "<rect x=\"-55\" y=\"14\" width=\"110\" height=\"44\" rx=\"6\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-55 20 Q-46 30 -37 20 Q-28 30 -18 20 Q-9 30 0 20 Q9 30 18 20 Q28 30 37 20 Q46 30 55 20 L55 16 L-55 16 Z\" fill=\"{$c['soft']}\"/>"
            . "<rect x=\"-38\" y=\"-22\" width=\"76\" height=\"38\" rx=\"6\" fill=\"{$c['b']}\"/>"
            . "<path d=\"M-38 -16 Q-30 -6 -22 -16 Q-14 -6 -6 -16 Q2 -6 10 -16 Q18 -6 26 -16 Q32 -8 38 -16 L38 -20 L-38 -20 Z\" fill=\"{$c['soft']}\"/>";
        foreach ([-20, 0, 20] as $x) {
            $out .= "<rect x=\"" . ($x - 3) . "\" y=\"-46\" width=\"6\" height=\"24\" rx=\"2\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"1\"/>"
                . "<path d=\"M$x -60 Q" . ($x + 6) . " -52 $x -48 Q" . ($x - 6) . " -52 $x -60 Z\" fill=\"#f5a623\"/>";
        }

        return $out;
    }

    private function motifBalloons(): string
    {
        $c = $this->c;
        $out = '';
        foreach ([[-38, -18, $c['a'], -8], [0, -38, $c['b'], 0], [38, -14, $c['soft'], 8]] as [$x, $y, $fill, $tilt]) {
            $out .= "<path d=\"M$x " . ($y + 32) . " Q" . ($x + 10) . " " . ($y + 55) . " 0 72\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"1\" stroke-opacity=\"0.6\"/>"
                . "<g transform=\"rotate($tilt $x $y)\"><ellipse cx=\"$x\" cy=\"$y\" rx=\"24\" ry=\"30\" fill=\"$fill\" stroke=\"{$c['a']}\" stroke-width=\"1\" stroke-opacity=\"0.4\"/>"
                . "<ellipse cx=\"" . ($x - 8) . "\" cy=\"" . ($y - 10) . "\" rx=\"5\" ry=\"9\" fill=\"#ffffff\" fill-opacity=\"0.45\"/>"
                . "<path d=\"M" . ($x - 4) . " " . ($y + 34) . " L" . ($x + 4) . " " . ($y + 34) . " L$x " . ($y + 29) . " Z\" fill=\"$fill\"/></g>";
        }

        return $out;
    }

    private function motifConfetti(): string
    {
        $c = $this->c;
        $out = "<path d=\"M-40 60 L-10 -10 L20 20 Z\" fill=\"{$c['a']}\"/><path d=\"M-30 37 L-3 5 M-20 50 L7 12\" stroke=\"{$c['soft']}\" stroke-width=\"4\"/>";
        $cols = [$c['a'], $c['b'], $c['soft']];
        for ($i = 0; $i < 16; $i++) {
            $ang = deg2rad(-100 + $i * 9);
            $r = 30 + ($i % 4) * 14;
            $x = round(5 + $r * cos($ang), 1);
            $y = round(5 + $r * sin($ang), 1);
            $out .= $i % 2
                ? "<rect x=\"$x\" y=\"$y\" width=\"4\" height=\"10\" rx=\"1\" fill=\"{$cols[$i % 3]}\" transform=\"rotate(" . ($i * 37) . " $x $y)\"/>"
                : "<circle cx=\"$x\" cy=\"$y\" r=\"4\" fill=\"{$cols[$i % 3]}\"/>";
        }

        return $out . sprintf('<path d="%s" fill="%s"/>', $this->starPath(50, -40, 10, 4), $c['a']);
    }

    private function motifBubbles(): string
    {
        $c = $this->c;
        $out = '';
        foreach ([[0, -6, 40, $c['a']], [-50, -36, 20, $c['b']], [50, -30, 26, $c['soft']], [-42, 40, 16, $c['soft']], [46, 42, 18, $c['b']], [-8, 56, 9, $c['a']]] as [$x, $y, $r, $fill]) {
            $out .= "<circle cx=\"$x\" cy=\"$y\" r=\"$r\" fill=\"$fill\" fill-opacity=\"0.55\" stroke=\"$fill\" stroke-width=\"1.5\"/>"
                . "<path d=\"M" . ($x - $r * 0.6) . " " . ($y - $r * 0.1) . " A" . ($r * 0.6) . " " . ($r * 0.6) . " 0 0 1 " . ($x - $r * 0.1) . " " . ($y - $r * 0.6) . "\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-opacity=\"0.8\"/>";
        }

        return $out;
    }

    private function motifRainbow(): string
    {
        $c = $this->c;
        $out = '';
        foreach ([[62, $c['a']], [50, $c['b']], [38, $c['soft']], [26, $c['a']]] as $i => [$r, $col]) {
            $out .= "<path d=\"M-$r 30 A$r $r 0 0 1 $r 30\" fill=\"none\" stroke=\"$col\" stroke-width=\"11\" stroke-opacity=\"" . (1 - $i * 0.15) . "\"/>";
        }

        return $out . $this->cloud(-62, 32, 0.9, '#ffffff', $c['a']) . $this->cloud(62, 32, 0.9, '#ffffff', $c['a']);
    }

    private function motifUnicorn(): string
    {
        $c = $this->c;

        return $this->motifRainbow()
            . "<path d=\"M-10 20 L0 -62 L10 20 Z\" fill=\"#f7d774\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/>"
            . "<path d=\"M-8 4 L8 -4 M-6 -14 L6 -22 M-4 -32 L4 -38\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/>"
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(-40, -45, 9, 4), $c['a'])
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(42, -52, 7, 3), $c['b']);
    }

    private function motifCastle(): string
    {
        $c = $this->c;
        $out = "<rect x=\"-50\" y=\"0\" width=\"100\" height=\"62\" fill=\"{$c['a']}\"/>";
        foreach ([[-62, 22, -8], [40, 22, -8], [-14, 28, -38]] as [$x, $w, $top]) {
            $out .= "<rect x=\"$x\" y=\"$top\" width=\"$w\" height=\"" . (62 - $top) . "\" fill=\"{$c['a']}\"/>"
                . "<path d=\"M" . ($x - 4) . " $top L" . ($x + $w / 2) . " " . ($top - 28) . " L" . ($x + $w + 4) . " $top Z\" fill=\"{$c['b']}\"/>";
        }

        return $out . "<line x1=\"0\" y1=\"-66\" x2=\"0\" y2=\"-82\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/><path d=\"M0 -82 L14 -77 L0 -72 Z\" fill=\"{$c['b']}\"/>"
            . "<path d=\"M-12 62 L-12 40 A12 12 0 0 1 12 40 L12 62 Z\" fill=\"{$c['soft']}\"/>"
            . "<rect x=\"-55\" y=\"12\" width=\"8\" height=\"12\" rx=\"4\" fill=\"{$c['soft']}\"/><rect x=\"47\" y=\"12\" width=\"8\" height=\"12\" rx=\"4\" fill=\"{$c['soft']}\"/>"
            . "<rect x=\"-4\" y=\"-18\" width=\"8\" height=\"12\" rx=\"4\" fill=\"{$c['soft']}\"/>";
    }

    private function motifCrown(): string
    {
        $c = $this->c;

        return "<path d=\"M-58 34 L-64 -30 L-30 4 L0 -44 L30 4 L64 -30 L58 34 Z\" fill=\"{$c['a']}\" stroke=\"{$c['b']}\" stroke-width=\"2\"/>"
            . "<rect x=\"-60\" y=\"34\" width=\"120\" height=\"16\" rx=\"3\" fill=\"{$c['b']}\"/>"
            . "<circle cx=\"-64\" cy=\"-34\" r=\"6\" fill=\"{$c['b']}\"/><circle cx=\"0\" cy=\"-50\" r=\"7\" fill=\"{$c['b']}\"/><circle cx=\"64\" cy=\"-34\" r=\"6\" fill=\"{$c['b']}\"/>"
            . "<circle cx=\"0\" cy=\"14\" r=\"8\" fill=\"{$c['soft']}\"/><circle cx=\"-32\" cy=\"20\" r=\"5\" fill=\"{$c['soft']}\"/><circle cx=\"32\" cy=\"20\" r=\"5\" fill=\"{$c['soft']}\"/>";
    }

    private function motifShield(): string
    {
        $c = $this->c;

        return "<path d=\"M-70 -50 L60 60 M70 -50 L-60 60\" stroke=\"{$c['b']}\" stroke-width=\"5\" stroke-linecap=\"round\"/>"
            . "<path d=\"M0 -60 L48 -44 L44 14 Q36 48 0 64 Q-36 48 -44 14 L-48 -44 Z\" fill=\"{$c['a']}\" stroke=\"{$c['b']}\" stroke-width=\"3\"/>"
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(0, 0, 24, 10), $c['soft']);
    }

    private function motifMedallion(): string
    {
        $c = $this->c;

        return "<circle r=\"66\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"1\" stroke-dasharray=\"2 4\"/>"
            . sprintf('<path d="%s" fill="%s" fill-opacity="0.18" stroke="%s" stroke-width="1.5"/>', $this->starPath(0, 0, 60, 46, 8, 0), $c['a'], $c['a'])
            . "<circle r=\"40\" fill=\"{$c['soft']}\" fill-opacity=\"0.6\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . "<circle r=\"33\" fill=\"none\" stroke=\"{$c['b']}\" stroke-width=\"1\"/>"
            . $this->leaf(-6, 18, 30, -25, $c['a']) . $this->leaf(6, 18, 30, 25, $c['b']) . $this->leaf(0, 18, 20, 0, $c['a'], 0.7);
    }

    private function motifAnchor(): string
    {
        $c = $this->c;

        return $this->motifWavesOnly(52)
            . "<g fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"8\" stroke-linecap=\"round\">"
            . "<circle cx=\"0\" cy=\"-52\" r=\"11\"/><line x1=\"0\" y1=\"-40\" x2=\"0\" y2=\"40\"/><line x1=\"-24\" y1=\"-24\" x2=\"24\" y2=\"-24\"/>"
            . "<path d=\"M-44 10 Q-40 44 0 44 Q40 44 44 10\"/></g>"
            . "<path d=\"M-52 18 L-44 4 L-36 18 Z M36 18 L44 4 L52 18 Z\" fill=\"{$c['a']}\"/>";
    }

    private function motifWavesOnly(float $y): string
    {
        $c = $this->c;
        $out = '';
        foreach ([[0, $c['a'], 0.8], [10, $c['b'], 0.7]] as [$dy, $col, $op]) {
            $yy = $y + $dy;
            $out .= "<path d=\"M-80 $yy Q-60 " . ($yy - 10) . " -40 $yy T0 $yy T40 $yy T80 $yy\" fill=\"none\" stroke=\"$col\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-opacity=\"$op\"/>";
        }

        return $out;
    }

    private function motifWaves(): string
    {
        $c = $this->c;
        $fish = fn ($x, $y, $s, $fill, $flip) => "<g transform=\"translate($x $y) scale(" . ($flip ? -$s : $s) . " $s)\"><ellipse rx=\"22\" ry=\"13\" fill=\"$fill\"/><path d=\"M18 0 L36 -12 L36 12 Z\" fill=\"$fill\"/><circle cx=\"-11\" cy=\"-3\" r=\"3\" fill=\"#ffffff\"/><circle cx=\"-11\" cy=\"-3\" r=\"1.4\" fill=\"{$c['dark']}\"/></g>";

        return $fish(-10, -30, 1.3, $c['a'], false) . $fish(40, 6, 0.9, $c['b'], true) . $fish(-45, 12, 0.7, $c['soft'], true)
            . "<circle cx=\"-40\" cy=\"-55\" r=\"4\" fill=\"none\" stroke=\"{$c['a']}\"/><circle cx=\"-34\" cy=\"-66\" r=\"3\" fill=\"none\" stroke=\"{$c['a']}\"/>"
            . $this->motifWavesOnly(40);
    }

    private function motifBear(): string
    {
        $c = $this->c;

        return "<circle cx=\"-36\" cy=\"-36\" r=\"16\" fill=\"{$c['a']}\"/><circle cx=\"36\" cy=\"-36\" r=\"16\" fill=\"{$c['a']}\"/>"
            . "<circle cx=\"-36\" cy=\"-36\" r=\"8\" fill=\"{$c['b']}\"/><circle cx=\"36\" cy=\"-36\" r=\"8\" fill=\"{$c['b']}\"/>"
            . "<circle r=\"48\" fill=\"{$c['a']}\"/>"
            . "<ellipse cx=\"0\" cy=\"16\" rx=\"22\" ry=\"17\" fill=\"{$c['soft']}\"/>"
            . "<ellipse cx=\"0\" cy=\"7\" rx=\"7\" ry=\"5\" fill=\"{$c['dark']}\"/>"
            . "<path d=\"M-8 20 Q0 27 8 20\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"2\" stroke-linecap=\"round\"/>"
            . "<circle cx=\"-17\" cy=\"-10\" r=\"5\" fill=\"{$c['dark']}\"/><circle cx=\"17\" cy=\"-10\" r=\"5\" fill=\"{$c['dark']}\"/>"
            . "<circle cx=\"-30\" cy=\"10\" r=\"6\" fill=\"{$c['b']}\" fill-opacity=\"0.5\"/><circle cx=\"30\" cy=\"10\" r=\"6\" fill=\"{$c['b']}\" fill-opacity=\"0.5\"/>";
    }

    private function motifCat(): string
    {
        $c = $this->c;

        return "<path d=\"M-46 -10 L-40 -62 L-12 -38 Q0 -42 12 -38 L40 -62 L46 -10 Q50 44 0 46 Q-50 44 -46 -10 Z\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-38 -22 L-36 -50 L-20 -38 Z M38 -22 L36 -50 L20 -38 Z\" fill=\"{$c['b']}\"/>"
            . "<ellipse cx=\"-17\" cy=\"-6\" rx=\"6\" ry=\"8\" fill=\"{$c['dark']}\"/><ellipse cx=\"17\" cy=\"-6\" rx=\"6\" ry=\"8\" fill=\"{$c['dark']}\"/>"
            . "<circle cx=\"-15\" cy=\"-9\" r=\"2\" fill=\"#ffffff\"/><circle cx=\"19\" cy=\"-9\" r=\"2\" fill=\"#ffffff\"/>"
            . "<path d=\"M-5 10 L5 10 L0 16 Z\" fill=\"{$c['b']}\"/><path d=\"M0 16 Q-6 24 -12 20 M0 16 Q6 24 12 20\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"1.5\"/>"
            . "<path d=\"M-22 14 L-58 8 M-22 20 L-58 24 M22 14 L58 8 M22 20 L58 24\" stroke=\"{$c['dark']}\" stroke-width=\"1.2\" stroke-opacity=\"0.6\"/>"
            . $this->heart(40, 40, 1, $c['b']);
    }

    private function motifDino(): string
    {
        $c = $this->c;
        $out = '';
        foreach ([[-40, 2], [-24, -6], [-8, -8], [8, -18]] as [$x, $y]) {
            $out .= "<path d=\"M" . ($x - 7) . " " . ($y + 4) . " L$x " . ($y - 12) . " L" . ($x + 7) . " " . ($y + 2) . " Z\" fill=\"{$c['b']}\"/>";
        }

        return $out . "<path d=\"M-78 44 Q-50 20 -30 8 Q-8 -6 14 -8 Q22 -40 42 -46 Q66 -50 68 -34 Q70 -22 54 -20 Q44 -18 42 -6 Q46 14 38 30 L38 52 L24 52 L24 38 L-6 38 L-6 52 L-20 52 L-20 36 Q-44 44 -78 44 Z\" fill=\"{$c['a']}\"/>"
            . "<circle cx=\"52\" cy=\"-36\" r=\"3.5\" fill=\"{$c['dark']}\"/>"
            . "<path d=\"M58 -26 Q62 -24 66 -27\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"1.5\"/>"
            . "<ellipse cx=\"0\" cy=\"20\" rx=\"16\" ry=\"9\" fill=\"{$c['soft']}\" fill-opacity=\"0.6\"/>"
            . $this->leaf(-60, 62, 30, -30, $c['leaf']) . $this->leaf(64, 62, 30, 30, $c['leaf']);
    }

    private function motifRobot(): string
    {
        $c = $this->c;

        return "<line x1=\"0\" y1=\"-44\" x2=\"0\" y2=\"-62\" stroke=\"{$c['a']}\" stroke-width=\"3\"/><circle cx=\"0\" cy=\"-66\" r=\"6\" fill=\"{$c['b']}\"/>"
            . "<rect x=\"-44\" y=\"-44\" width=\"88\" height=\"70\" rx=\"14\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-54\" y=\"-20\" width=\"10\" height=\"22\" rx=\"3\" fill=\"{$c['b']}\"/><rect x=\"44\" y=\"-20\" width=\"10\" height=\"22\" rx=\"3\" fill=\"{$c['b']}\"/>"
            . "<circle cx=\"-18\" cy=\"-16\" r=\"11\" fill=\"{$c['soft']}\"/><circle cx=\"18\" cy=\"-16\" r=\"11\" fill=\"{$c['soft']}\"/>"
            . "<circle cx=\"-18\" cy=\"-16\" r=\"5\" fill=\"{$c['dark']}\"/><circle cx=\"18\" cy=\"-16\" r=\"5\" fill=\"{$c['dark']}\"/>"
            . "<rect x=\"-22\" y=\"4\" width=\"44\" height=\"10\" rx=\"3\" fill=\"{$c['soft']}\"/>"
            . "<path d=\"M-11 4 V14 M0 4 V14 M11 4 V14\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/>"
            . "<rect x=\"-30\" y=\"32\" width=\"60\" height=\"30\" rx=\"8\" fill=\"{$c['a']}\"/><circle cx=\"0\" cy=\"47\" r=\"7\" fill=\"{$c['b']}\"/>";
    }

    private function motifPlane(): string
    {
        $c = $this->c;

        return $this->cloud(-50, 42, 1.1, '#ffffff', $c['a']) . $this->cloud(56, -46, 0.8, '#ffffff', $c['a'])
            . "<g transform=\"rotate(-18)\">"
            . "<path d=\"M-66 0 Q-66 -10 -50 -10 L50 -10 Q72 -10 76 0 Q72 10 50 10 L-50 10 Q-66 10 -66 0 Z\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-8 -8 L-30 -52 L-14 -52 L22 -8 Z M-8 8 L-30 52 L-14 52 L22 8 Z\" fill=\"{$c['b']}\"/>"
            . "<path d=\"M-56 -8 L-68 -30 L-58 -30 L-44 -8 Z\" fill=\"{$c['b']}\"/>"
            . "<circle cx=\"30\" cy=\"-2\" r=\"3\" fill=\"{$c['soft']}\"/><circle cx=\"18\" cy=\"-2\" r=\"3\" fill=\"{$c['soft']}\"/><circle cx=\"6\" cy=\"-2\" r=\"3\" fill=\"{$c['soft']}\"/><circle cx=\"-6\" cy=\"-2\" r=\"3\" fill=\"{$c['soft']}\"/></g>"
            . "<path d=\"M-80 36 Q-74 30 -68 36\" fill=\"none\" stroke=\"{$c['a']}\" stroke-dasharray=\"3 4\"/>";
    }

    private function motifRocket(): string
    {
        $c = $this->c;

        return "<circle cx=\"38\" cy=\"26\" r=\"28\" fill=\"{$c['b']}\"/>"
            . "<ellipse cx=\"38\" cy=\"26\" rx=\"46\" ry=\"10\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"3\" transform=\"rotate(-18 38 26)\"/>"
            . "<g transform=\"translate(-26 -6) rotate(35)\">"
            . "<path d=\"M0 -52 C20 -30 20 14 13 32 L-13 32 C-20 14 -20 -30 0 -52 Z\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . "<circle cx=\"0\" cy=\"-14\" r=\"8\" fill=\"{$c['b']}\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . "<path d=\"M-13 14 L-26 36 L-12 32 Z M13 14 L26 36 L12 32 Z\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-8 34 Q0 60 8 34 Z\" fill=\"#f5a623\"/></g>";
    }

    private function motifCar(): string
    {
        $c = $this->c;
        $flag = "<line x1=\"30\" y1=\"-70\" x2=\"30\" y2=\"-10\" stroke=\"{$c['dark']}\" stroke-width=\"2.5\"/>";
        for ($r = 0; $r < 3; $r++) {
            for ($col = 0; $col < 4; $col++) {
                $fill = ($r + $col) % 2 ? '#ffffff' : $c['dark'];
                $flag .= '<rect x="' . (32 + $col * 9) . '" y="' . (-70 + $r * 9) . "\" width=\"9\" height=\"9\" fill=\"$fill\"/>";
            }
        }

        return $flag
            . "<path d=\"M-66 34 L-60 14 L-30 8 L-14 -12 L26 -12 L42 8 L64 14 L68 34 Z\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-10 -6 L-20 8 L8 8 L8 -6 Z M14 -6 L14 8 L36 8 L24 -6 Z\" fill=\"{$c['soft']}\"/>"
            . "<text x=\"-40\" y=\"30\" font-family=\"Arial, sans-serif\" font-weight=\"700\" font-size=\"14\" fill=\"{$c['soft']}\">7</text>"
            . "<circle cx=\"-38\" cy=\"36\" r=\"14\" fill=\"{$c['dark']}\"/><circle cx=\"40\" cy=\"36\" r=\"14\" fill=\"{$c['dark']}\"/>"
            . "<circle cx=\"-38\" cy=\"36\" r=\"5\" fill=\"{$c['b']}\"/><circle cx=\"40\" cy=\"36\" r=\"5\" fill=\"{$c['b']}\"/>"
            . "<path d=\"M-86 20 H-72 M-90 28 H-74\" stroke=\"{$c['a']}\" stroke-width=\"2\" stroke-linecap=\"round\"/>";
    }

    private function motifTv(): string
    {
        $c = $this->c;

        return "<path d=\"M-20 -60 L0 -40 L20 -62\" fill=\"none\" stroke=\"{$c['dark']}\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>"
            . "<rect x=\"-64\" y=\"-40\" width=\"128\" height=\"94\" rx=\"16\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-54\" y=\"-30\" width=\"84\" height=\"74\" rx=\"12\" fill=\"{$c['soft']}\"/>"
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(-12, 7, 22, 9), $c['b'])
            . "<circle cx=\"46\" cy=\"-14\" r=\"6\" fill=\"{$c['b']}\"/><circle cx=\"46\" cy=\"6\" r=\"6\" fill=\"{$c['b']}\"/>"
            . "<rect x=\"-44\" y=\"54\" width=\"10\" height=\"10\" fill=\"{$c['dark']}\"/><rect x=\"34\" y=\"54\" width=\"10\" height=\"10\" fill=\"{$c['dark']}\"/>";
    }

    private function motifHero(): string
    {
        $c = $this->c;

        return sprintf('<path d="%s" fill="%s"/>', $this->starPath(0, 0, 70, 46, 12, -90), $c['b'])
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(0, 0, 52, 36, 12, -75), $c['soft'])
            . "<path d=\"M10 -46 L-22 6 L-2 6 L-12 46 L24 -8 L4 -8 Z\" fill=\"{$c['a']}\" stroke=\"{$c['dark']}\" stroke-width=\"2\" stroke-linejoin=\"round\"/>";
    }

    private function motifBall(): string
    {
        $c = $this->c;
        $out = "<ellipse cx=\"0\" cy=\"58\" rx=\"44\" ry=\"6\" fill=\"{$c['leaf']}\" fill-opacity=\"0.5\"/>"
            . "<circle r=\"48\" fill=\"#ffffff\" stroke=\"{$c['dark']}\" stroke-width=\"3\"/>"
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(0, 0, 16, 16, 5), $c['dark']);
        for ($i = 0; $i < 5; $i++) {
            $ang = deg2rad(-90 + $i * 72);
            $x1 = round(16 * cos($ang), 1);
            $y1 = round(16 * sin($ang), 1);
            $x2 = round(40 * cos($ang), 1);
            $y2 = round(40 * sin($ang), 1);
            $out .= "<line x1=\"$x1\" y1=\"$y1\" x2=\"$x2\" y2=\"$y2\" stroke=\"{$c['dark']}\" stroke-width=\"2\"/>"
                . sprintf('<path d="%s" fill="%s"/>', $this->starPath($x2 * 1.08, $y2 * 1.08, 10, 10, 5, -90 + $i * 72 + 36), $c['a']);
        }

        return $out;
    }

    private function motifTrophy(): string
    {
        $c = $this->c;

        return "<path d=\"M-36 -40 Q-66 -40 -58 -12 Q-52 6 -26 8 M36 -40 Q66 -40 58 -12 Q52 6 26 8\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"6\"/>"
            . "<path d=\"M-40 -52 L40 -52 L36 -10 Q30 20 0 24 Q-30 20 -36 -10 Z\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-7\" y=\"22\" width=\"14\" height=\"18\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-30\" y=\"40\" width=\"60\" height=\"10\" rx=\"2\" fill=\"{$c['b']}\"/><rect x=\"-38\" y=\"50\" width=\"76\" height=\"12\" rx=\"2\" fill=\"{$c['dark']}\"/>"
            . sprintf('<path d="%s" fill="%s"/>', $this->starPath(0, -20, 16, 7), $c['soft']);
    }

    private function motifCandy(): string
    {
        $c = $this->c;

        return "<rect x=\"-4\" y=\"0\" width=\"8\" height=\"70\" rx=\"4\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"1\"/>"
            . "<circle cx=\"0\" cy=\"-20\" r=\"44\" fill=\"{$c['soft']}\"/>"
            . "<path d=\"M0 -20 m-4 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0 a20 20 0 1 1 40 0 a24 24 0 1 1 -48 0 a28 28 0 1 1 56 0 a32 32 0 1 1 -64 0 a36 36 0 1 1 72 0\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"5\" stroke-linecap=\"round\"/>"
            . "<path d=\"M-8 26 Q0 36 8 26 L4 20 L-4 20 Z\" fill=\"{$c['b']}\"/>"
            . "<g transform=\"translate(58 40) rotate(-30)\"><ellipse rx=\"14\" ry=\"10\" fill=\"{$c['b']}\"/><path d=\"M-14 0 L-26 -9 L-26 9 Z M14 0 L26 -9 L26 9 Z\" fill=\"{$c['b']}\"/></g>";
    }

    private function motifPaint(): string
    {
        $c = $this->c;

        return "<path d=\"M-4 -60 C50 -64 78 -24 66 12 C58 36 30 30 22 44 C14 60 -10 64 -34 54 C-72 38 -76 -20 -52 -44 C-40 -56 -22 -60 -4 -60 Z\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . "<circle cx=\"4\" cy=\"34\" r=\"10\" fill=\"{$c['bg1']}\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/>"
            . "<circle cx=\"-38\" cy=\"-18\" r=\"11\" fill=\"{$c['a']}\"/><circle cx=\"-12\" cy=\"-40\" r=\"11\" fill=\"{$c['b']}\"/>"
            . "<circle cx=\"22\" cy=\"-40\" r=\"11\" fill=\"#facc15\"/><circle cx=\"46\" cy=\"-14\" r=\"11\" fill=\"#22c55e\"/><circle cx=\"-36\" cy=\"20\" r=\"11\" fill=\"#3b82f6\"/>"
            . "<g transform=\"rotate(40 60 40)\"><rect x=\"56\" y=\"4\" width=\"8\" height=\"60\" rx=\"3\" fill=\"{$c['dark']}\"/><path d=\"M56 4 L60 -12 L64 4 Z\" fill=\"{$c['a']}\"/></g>";
    }

    private function motifPaws(): string
    {
        $c = $this->c;
        $paw = fn ($x, $y, $s, $rot, $fill) => "<g transform=\"translate($x $y) rotate($rot) scale($s)\" fill=\"$fill\"><ellipse cx=\"0\" cy=\"6\" rx=\"12\" ry=\"10\"/><ellipse cx=\"-13\" cy=\"-8\" rx=\"5\" ry=\"6.5\"/><ellipse cx=\"-4.5\" cy=\"-15\" rx=\"5\" ry=\"6.5\"/><ellipse cx=\"4.5\" cy=\"-15\" rx=\"5\" ry=\"6.5\"/><ellipse cx=\"13\" cy=\"-8\" rx=\"5\" ry=\"6.5\"/></g>";

        return $this->leaf(-60, 60, 50, -20, $c['leaf']) . $this->leaf(-40, 64, 44, 10, $c['leaf'], 0.8)
            . $this->leaf(62, 60, 50, 20, $c['leaf']) . $this->leaf(42, 64, 40, -10, $c['leaf'], 0.8)
            . $paw(-30, 30, 1.2, -20, $c['a']) . $paw(10, -4, 1.4, 10, $c['a']) . $paw(-8, -52, 1.0, -10, $c['b']) . $paw(46, -40, 0.9, 25, $c['b']);
    }

    private function motifClouds(): string
    {
        $c = $this->c;

        return "<circle cx=\"30\" cy=\"-30\" r=\"26\" fill=\"{$c['b']}\" fill-opacity=\"0.7\"/>"
            . $this->cloud(-20, -10, 1.8, '#ffffff', $c['a']) . $this->cloud(40, 30, 1.3, '#ffffff', $c['a']) . $this->cloud(-50, 44, 0.9, '#ffffff', $c['a'])
            . $this->heart(-10, 50, 1.1, $c['a'], 0.8);
    }

    private function motifFootprints(): string
    {
        $c = $this->c;
        $foot = fn ($x, $y, $rot, $fill, $mirror) => "<g transform=\"translate($x $y) rotate($rot) scale(" . ($mirror ? -1 : 1) . " 1)\" fill=\"$fill\"><path d=\"M-12 0 C-16 -26 12 -34 14 -8 C16 10 10 30 -2 30 C-12 30 -10 14 -12 0 Z\"/><circle cx=\"-10\" cy=\"-34\" r=\"5\"/><circle cx=\"0\" cy=\"-38\" r=\"4\"/><circle cx=\"8\" cy=\"-36\" r=\"3.5\"/><circle cx=\"14\" cy=\"-31\" r=\"3\"/><circle cx=\"18\" cy=\"-25\" r=\"2.5\"/></g>";

        return $foot(-22, 10, -12, $c['a'], false) . $foot(24, -10, 12, $c['b'], true) . $this->heart(0, 56, 1.1, $c['a'], 0.7);
    }

    private function motifPacifier(): string
    {
        $c = $this->c;

        return "<circle cx=\"0\" cy=\"34\" r=\"20\" fill=\"none\" stroke=\"{$c['b']}\" stroke-width=\"7\"/>"
            . "<path d=\"M-54 0 Q-54 -30 0 -22 Q54 -30 54 0 Q54 20 0 18 Q-54 20 -54 0 Z\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-14\" y=\"-6\" width=\"28\" height=\"22\" rx=\"6\" fill=\"{$c['b']}\"/>"
            . "<ellipse cx=\"0\" cy=\"-38\" rx=\"14\" ry=\"20\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/>"
            . $this->crescent(-50, -46, 12, $c['a']) . sprintf('<path d="%s" fill="%s"/>', $this->starPath(52, -48, 8, 3.5), $c['a']);
    }

    private function motifSheep(): string
    {
        $c = $this->c;
        $wool = '';
        foreach ([[-34, 0], [-20, -16], [0, -20], [20, -16], [34, 0], [22, 16], [0, 20], [-22, 16], [0, 0]] as [$x, $y]) {
            $wool .= "<circle cx=\"$x\" cy=\"$y\" r=\"20\"/>";
        }

        return "<rect x=\"-28\" y=\"20\" width=\"8\" height=\"30\" rx=\"3\" fill=\"{$c['dark']}\"/><rect x=\"20\" y=\"20\" width=\"8\" height=\"30\" rx=\"3\" fill=\"{$c['dark']}\"/>"
            . "<g fill=\"#ffffff\" stroke=\"{$c['a']}\" stroke-width=\"1.5\">$wool</g>"
            . "<circle r=\"26\" fill=\"#ffffff\"/>"
            . "<ellipse cx=\"-46\" cy=\"-8\" rx=\"16\" ry=\"20\" fill=\"{$c['a']}\"/>"
            . "<ellipse cx=\"-58\" cy=\"-18\" rx=\"9\" ry=\"5\" fill=\"{$c['a']}\" transform=\"rotate(-30 -58 -18)\"/>"
            . "<circle cx=\"-50\" cy=\"-12\" r=\"2.5\" fill=\"#ffffff\"/>"
            . $this->crescent(50, -50, 12, $c['b']) . sprintf('<path d="%s" fill="%s"/>', $this->starPath(66, -58, 6, 2.5), $c['b']);
    }

    private function motifQuestion(): string
    {
        $c = $this->c;

        return "<path d=\"M0 -60 A60 60 0 0 0 0 60 Z\" fill=\"{$c['a']}\"/><path d=\"M0 -60 A60 60 0 0 1 0 60 Z\" fill=\"{$c['b']}\"/>"
            . "<circle r=\"60\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"3\" stroke-opacity=\"0.7\"/>"
            . "<text x=\"0\" y=\"28\" text-anchor=\"middle\" font-family=\"Georgia, serif\" font-weight=\"700\" font-size=\"84\" fill=\"#ffffff\">?</text>"
            . $this->heart(-66, -48, 1, $c['a']) . $this->heart(66, -48, 1, $c['b']);
    }

    private function motifSun(): string
    {
        $c = $this->c;
        $rays = '';
        for ($i = 0; $i < 12; $i++) {
            $ang = deg2rad($i * 30);
            $rays .= sprintf('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>', 44 * cos($ang), -10 + 44 * sin($ang), 62 * cos($ang), -10 + 62 * sin($ang));
        }

        return "<g stroke=\"{$c['a']}\" stroke-width=\"5\" stroke-linecap=\"round\">$rays</g>"
            . "<circle cy=\"-10\" r=\"34\" fill=\"{$c['a']}\"/><circle cy=\"-10\" r=\"24\" fill=\"{$c['b']}\" fill-opacity=\"0.5\"/>"
            . $this->cloud(-44, 46, 1.2, '#ffffff', $c['a']) . $this->cloud(40, 50, 1, '#ffffff', $c['a']);
    }

    private function motifWheat(): string
    {
        $c = $this->c;
        $out = '';
        foreach ([[-30, -14], [0, 0], [30, 14]] as [$x, $tilt]) {
            $out .= "<g transform=\"rotate($tilt 0 60) translate($x 0)\"><line x1=\"0\" y1=\"60\" x2=\"0\" y2=\"-50\" stroke=\"{$c['dark']}\" stroke-width=\"2\"/>";
            for ($k = 0; $k < 6; $k++) {
                $y = -50 + $k * 12;
                $out .= "<ellipse cx=\"-6\" cy=\"$y\" rx=\"4\" ry=\"8\" fill=\"{$c['a']}\" transform=\"rotate(-30 -6 $y)\"/><ellipse cx=\"6\" cy=\"$y\" rx=\"4\" ry=\"8\" fill=\"{$c['a']}\" transform=\"rotate(30 6 $y)\"/>";
            }
            $out .= "<ellipse cx=\"0\" cy=\"-58\" rx=\"4\" ry=\"8\" fill=\"{$c['a']}\"/></g>";
        }

        return $out . "<path d=\"M-30 50 Q0 62 30 50\" fill=\"none\" stroke=\"{$c['b']}\" stroke-width=\"6\" stroke-linecap=\"round\"/>";
    }

    private function motifHouse(): string
    {
        $c = $this->c;

        return "<path d=\"M-62 0 L0 -54 L62 0 Z\" fill=\"{$c['a']}\"/><rect x=\"30\" y=\"-50\" width=\"12\" height=\"26\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-50\" y=\"-4\" width=\"100\" height=\"64\" fill=\"{$c['soft']}\" stroke=\"{$c['a']}\" stroke-width=\"2\"/>"
            . "<path d=\"M-12 60 L-12 26 A12 12 0 0 1 12 26 L12 60 Z\" fill=\"{$c['a']}\"/>"
            . "<rect x=\"-40\" y=\"10\" width=\"18\" height=\"18\" fill=\"{$c['b']}\"/><rect x=\"22\" y=\"10\" width=\"18\" height=\"18\" fill=\"{$c['b']}\"/>"
            . $this->heart(0, -18, 1, $c['b']) . $this->leaf(-68, 60, 30, -20, $c['leaf']) . $this->leaf(68, 60, 30, 20, $c['leaf']);
    }

    private function motifHearts(): string
    {
        $c = $this->c;

        return $this->heart(-6, 6, 5, $c['a']) . $this->heart(40, -28, 2.4, $c['b']) . $this->heart(-48, -34, 1.8, $c['soft'])
            . $this->heart(52, 40, 1.5, $c['a'], 0.6) . $this->heart(-6, 6, 2.6, $c['soft'], 0.35);
    }

    private function motifTumpeng(): string
    {
        $c = $this->c;

        return "<ellipse cx=\"0\" cy=\"52\" rx=\"76\" ry=\"14\" fill=\"{$c['a']}\"/>"
            . "<path d=\"M-72 48 Q-40 30 -20 46 M72 48 Q40 30 20 46\" fill=\"{$c['leaf']}\" stroke=\"{$c['leaf']}\" stroke-width=\"6\"/>"
            . "<path d=\"M0 -64 L46 44 L-46 44 Z\" fill=\"#f2c14e\" stroke=\"{$c['a']}\" stroke-width=\"1.5\"/>"
            . "<path d=\"M-6 -64 L6 -64 L4 -50 L-4 -50 Z\" fill=\"{$c['b']}\"/>"
            . "<circle cx=\"-54\" cy=\"36\" r=\"8\" fill=\"#ffffff\" stroke=\"{$c['a']}\"/><circle cx=\"-54\" cy=\"36\" r=\"3.5\" fill=\"#f5a623\"/>"
            . "<circle cx=\"56\" cy=\"36\" r=\"8\" fill=\"#ffffff\" stroke=\"{$c['a']}\"/><circle cx=\"56\" cy=\"36\" r=\"3.5\" fill=\"#f5a623\"/>"
            . "<path d=\"M-30 14 Q0 22 30 14\" fill=\"none\" stroke=\"{$c['a']}\" stroke-width=\"1.5\" stroke-dasharray=\"3 3\"/>";
    }
}

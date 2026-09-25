<?php

namespace Database\Seeders\Data;

use Illuminate\Support\Carbon;

/**
 * Realistic Indonesian demo content for SampleInvitationSeeder.
 *
 * build($type, $variant) returns one sample's content; $variant is the
 * theme's position within its invitation type, so every theme of a type gets
 * a different family, city, date and story. Lists wrap around when a type has
 * more themes than entries (names then still differ through the city/date).
 */
class SampleInvitationData
{
    /**
     * Real venues per city. Akad/pengajian at the mosque, receptions at the
     * hall, family events at the home address. Coordinates feed the maps embed.
     */
    private const CITIES = [
        'Jakarta' => [
            'mosque' => ['Masjid Istiqlal', 'Jl. Taman Wijaya Kusuma, Ps. Baru, Sawah Besar, Jakarta Pusat', '-6.170166', '106.831375'],
            'hall'   => ['Balai Kartini', 'Jl. Gatot Subroto Kav. 37, Kuningan, Jakarta Selatan', '-6.235897', '106.831306'],
            'home'   => ['Jl. Kemang Timur Raya No. 18, Mampang Prapatan, Jakarta Selatan', '-6.261500', '106.816300'],
        ],
        'Bandung' => [
            'mosque' => ['Masjid Pusdai Jawa Barat', 'Jl. Diponegoro No. 63, Cihaur Geulis, Bandung', '-6.900300', '107.623200'],
            'hall'   => ['The Trans Luxury Hotel - Grand Ballroom', 'Jl. Gatot Subroto No. 289, Cibangkong, Bandung', '-6.926100', '107.635800'],
            'home'   => ['Jl. Dago Asri II No. 7, Coblong, Bandung', '-6.875600', '107.618900'],
        ],
        'Yogyakarta' => [
            'mosque' => ['Masjid Gedhe Kauman', 'Jl. Kauman, Ngupasan, Gondomanan, Yogyakarta', '-7.803800', '110.362400'],
            'hall'   => ['Royal Ambarrukmo Yogyakarta', 'Jl. Laksda Adisucipto No. 81, Depok, Sleman', '-7.782900', '110.401600'],
            'home'   => ['Jl. Kaliurang Km 7 No. 12, Ngaglik, Sleman', '-7.745600', '110.394700'],
        ],
        'Semarang' => [
            'mosque' => ['Masjid Agung Jawa Tengah', 'Jl. Gajah Raya, Sambirejo, Gayamsari, Semarang', '-6.983800', '110.445300'],
            'hall'   => ['Hotel Tentrem Semarang', 'Jl. Gajahmada No. 123, Kembangsari, Semarang', '-6.986400', '110.420300'],
            'home'   => ['Jl. Pleburan Raya No. 21, Semarang Selatan', '-6.996900', '110.421300'],
        ],
        'Surabaya' => [
            'mosque' => ['Masjid Nasional Al-Akbar', 'Jl. Masjid Al-Akbar Timur No. 1, Gayungan, Surabaya', '-7.336600', '112.715200'],
            'hall'   => ['JW Marriott Hotel Surabaya', 'Jl. Embong Malang No. 85-89, Kedungdoro, Surabaya', '-7.261700', '112.738500'],
            'home'   => ['Jl. Manyar Kertoarjo V No. 30, Mulyorejo, Surabaya', '-7.280300', '112.764100'],
        ],
        'Malang' => [
            'mosque' => ["Masjid Agung Jami' Kota Malang", 'Jl. Merdeka Barat No. 3, Kiduldalem, Malang', '-7.983100', '112.630700'],
            'hall'   => ['Hotel Tugu Malang', 'Jl. Tugu No. 3, Kiduldalem, Malang', '-7.977100', '112.634600'],
            'home'   => ['Jl. Ijen Nirwana Raya No. 9, Klojen, Malang', '-7.972500', '112.618900'],
        ],
        'Medan' => [
            'mosque' => ['Masjid Raya Al-Mashun', 'Jl. Sisingamangaraja No. 61, Medan Kota', '3.575200', '98.687400'],
            'hall'   => ['JW Marriott Hotel Medan', 'Jl. Putri Hijau No. 10, Medan Barat', '3.594300', '98.674900'],
            'home'   => ['Jl. Dr. Mansyur No. 45, Medan Baru', '3.568900', '98.651200'],
        ],
        'Denpasar' => [
            'mosque' => ['Masjid Agung Sudirman', 'Jl. Jenderal Sudirman, Dauh Puri Klod, Denpasar', '-8.671900', '115.222700'],
            'hall'   => ['The Westin Resort Nusa Dua', 'Kawasan Pariwisata Nusa Dua Lot N-3, Badung, Bali', '-8.796700', '115.231000'],
            'home'   => ['Jl. Tukad Badung No. 88, Renon, Denpasar', '-8.682600', '115.236000'],
        ],
        'Banda Aceh' => [
            'mosque' => ['Masjid Raya Baiturrahman', 'Jl. Moh. Jam No. 1, Kp. Baru, Baiturrahman, Banda Aceh', '5.553600', '95.317500'],
            'hall'   => ['Hermes Palace Hotel', 'Jl. T. Panglima Nyak Makam, Lamgugob, Banda Aceh', '5.564600', '95.339900'],
            'home'   => ['Jl. T. Nyak Arief No. 17, Syiah Kuala, Banda Aceh', '5.570000', '95.350000'],
        ],
        'Padang' => [
            'mosque' => ['Masjid Raya Sumatera Barat', 'Jl. Khatib Sulaiman, Padang Utara, Padang', '-0.924900', '100.362600'],
            'hall'   => ['Truntum Padang', 'Jl. Gereja No. 34, Belakang Tangsi, Padang', '-0.951700', '100.360100'],
            'home'   => ['Jl. Veteran No. 55, Padang Barat, Padang', '-0.934000', '100.353000'],
        ],
        'Makassar' => [
            'mosque' => ['Masjid Raya Makassar', 'Jl. Masjid Raya, Bontoala, Makassar', '-5.133600', '119.418000'],
            'hall'   => ['Claro Hotel Makassar', 'Jl. A.P. Pettarani No. 3, Rappocini, Makassar', '-5.155300', '119.437100'],
            'home'   => ['Jl. Boulevard Panakkukang No. 12, Panakkukang, Makassar', '-5.154000', '119.447000'],
        ],
    ];

    private const BANKS = ['BCA', 'Bank Mandiri', 'BSI', 'BRI', 'BNI', 'CIMB Niaga'];

    private const WALLETS = [
        ['dana', 'DANA'],
        ['gopay', 'GoPay'],
        ['ovo', 'OVO'],
        ['shopeepay', 'ShopeePay'],
    ];

    /**
     * @return array{
     *     city: string,
     *     fields: array<string, string>,
     *     photos: array<string, string>,
     *     events: array<int, array<string, mixed>>,
     *     stories: array<int, array{title: string, period: string, content: string}>,
     *     wishes: array<int, array{name: string, message: string}>,
     *     wishlist: array<int, array{name: string, description: string, price: int, category: string}>,
     *     greeting: string,
     *     countdown_label: string,
     *     account_name: string,
     *     child_order: array{groom: ?int, bride: ?int},
     * }
     */
    public static function build(string $type, int $variant, Carbon $today): array
    {
        $data = match ($type) {
            'wedding'       => self::wedding($variant, $today),
            'birthday'      => self::birthday($variant, $today),
            'khitanan'      => self::khitanan($variant, $today),
            'aqiqah'        => self::aqiqah($variant, $today),
            'gender_reveal' => self::genderReveal($variant, $today),
            'syukuran'      => self::syukuran($variant, $today),
            default         => throw new \InvalidArgumentException("Tipe undangan '{$type}' tidak dikenal."),
        };

        $data['bank_accounts'] = self::bankAccounts($variant, $data['account_name'], $data['bank_second_name'] ?? null);
        $data['wallet'] = self::wallet($variant, $data['account_name']);
        $data['child_order'] ??= ['groom' => null, 'bride' => null];
        unset($data['bank_second_name']);

        return $data;
    }

    /** Venue record for the maps/location fields of an event. */
    public static function venue(string $city, string $kind, string $homeLabel = 'Kediaman Keluarga'): array
    {
        $c = self::CITIES[$city];

        [$name, $address, $lat, $lng] = $kind === 'home'
            ? [$homeLabel, $c['home'][0], $c['home'][1], $c['home'][2]]
            : $c[$kind];

        return [
            'location_name' => $name,
            'location'      => $address,
            'maps_lat'      => $lat,
            'maps_lng'      => $lng,
            // Same URL shapes the editor's map picker stores.
            'location_url'  => "https://www.google.com/maps?q={$lat},{$lng}",
            'maps_embed'    => "https://maps.google.com/maps?q={$lat},{$lng}&output=embed",
        ];
    }

    // ─── Wedding ─────────────────────────────────────────────────────────────

    private static function wedding(int $v, Carbon $today): array
    {
        // [groom full, nick, father, mother, order] + [bride ...] + city
        $couples = [
            [['Raka Aditya Pratama', 'Raka', 'H. Suryo Pratama', 'Hj. Ratna Dewi', 1], ['Alya Putri Maharani', 'Alya', 'Ir. Hendra Wijaya', 'Lestari Anggraini', 2], 'Jakarta'],
            [['Dimas Arya Nugroho', 'Dimas', 'Bambang Nugroho', 'Sri Wahyuni', 2], ['Nadia Salsabila', 'Nadia', 'H. Asep Saepudin', 'Hj. Euis Kurniasih', 1], 'Bandung'],
            [['Fajar Ramadhan', 'Fajar', 'Drs. Sutrisno', 'Endang Purwati', 3], ['Salsa Azzahra', 'Salsa', 'Agus Setiawan', 'Rini Handayani', 1], 'Yogyakarta'],
            [['Bagas Satria Wibowo', 'Bagas', 'Heru Wibowo', 'Tri Astuti', 1], ['Kirana Ayu Lestari', 'Kirana', 'Joko Susilo', 'Wulan Sari', 2], 'Semarang'],
            [['Rizal Maulana Hakim', 'Rizal', 'H. Abdul Hakim', 'Hj. Siti Aminah', 2], ['Annisa Rahmawati', 'Annisa', 'Moch. Rahmat', 'Nur Hayati', 3], 'Surabaya'],
            [['Arief Budiman Santoso', 'Arief', 'Budi Santoso', 'Yuliana', 1], ['Dinda Permata Sari', 'Dinda', 'Eko Prasetyo', 'Dewi Kartika', 1], 'Malang'],
            [['Hafiz Al-Farizi', 'Hafiz', 'H. Zulkifli Nasution', 'Hj. Rosmawati Lubis', 2], ['Zahra Khairunnisa', 'Zahra', 'Ahmad Syahrial', 'Nurhalimah Siregar', 1], 'Medan'],
            [['Kevin Aditama', 'Kevin', 'I Made Aditama', 'Ni Luh Sari', 1], ['Putri Ayuningtyas', 'Putri', 'Wayan Suardika', 'Kadek Ayu', 2], 'Denpasar'],
            [['Ilham Syahputra', 'Ilham', 'T. Syahrul', 'Cut Nurlaila', 3], ['Rahma Aulia', 'Rahma', 'Teuku Iskandar', 'Cut Mariana', 2], 'Banda Aceh'],
            [['Andika Firmansyah', 'Andika', 'Firman Syah Putra', 'Yusnimar', 1], ['Maya Sekar Arum', 'Maya', 'H. Darmawan', 'Hj. Yulinar', 1], 'Padang'],
            [['Gilang Ramadhan Putra', 'Gilang', 'H. Andi Rahman', 'Hj. Andi Nurhayati', 2], ['Citra Ananda', 'Citra', 'Muh. Yusuf', 'Hasnah Daeng Ngai', 3], 'Makassar'],
            [['Naufal Rizky Pradana', 'Naufal', 'Rudi Pradana', 'Dian Novitasari', 1], ['Aisyah Humaira', 'Aisyah', 'H. Faisal Anwar', 'Hj. Mariam', 2], 'Jakarta'],
            [['Reza Mahendra', 'Reza', 'Ir. Mahendra Putra', 'Susanti', 2], ['Tiara Anindita', 'Tiara', 'Dr. Aditya Kusuma', 'Anindya Paramitha', 1], 'Surabaya'],
            [['Farhan Hidayat', 'Farhan', 'Dedi Hidayat', 'Neneng Sumarni', 1], ['Laras Wulandari', 'Laras', 'Wahyu Hidayanto', 'Setyaningsih', 2], 'Bandung'],
            [['Adrian Kusuma Wijaya', 'Adrian', 'Hartono Wijaya', 'Lina Marlina', 3], ['Nabila Syifa', 'Nabila', 'H. Ridwan Kamil', 'Hj. Nurul Aini', 1], 'Yogyakarta'],
            [['Yoga Pradipta', 'Yoga', 'Slamet Riyadi', 'Sulastri', 2], ['Intan Cahyaningrum', 'Intan', 'Sugeng Raharjo', 'Endah Lestari', 1], 'Semarang'],
        ];
        $quotes = [
            'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. (QS. Ar-Rum: 21)',
            'Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat kebesaran Allah. (QS. Adz-Dzariyat: 49)',
            'Cinta bukan tentang menemukan seseorang yang sempurna, tetapi tentang belajar melihat seseorang yang tidak sempurna dengan cara yang sempurna.',
            'Maka nikmat Tuhanmu yang manakah yang kamu dustakan? (QS. Ar-Rahman: 13)',
        ];
        $palettes = [
            [['Sage Green', '#9CAF88'], ['Dusty Rose', '#D8A7A7'], ['Ivory', '#FFFFF0']],
            [['Navy', '#1F3A5F'], ['Champagne', '#F7E7CE'], ['Gold', '#C9A84C']],
            [['Terracotta', '#C8674A'], ['Cream', '#F3E9DC'], ['Olive', '#708238']],
            [['Maroon', '#7A0C2E'], ['Blush', '#F4C2C2'], ['Gold', '#C9A84C']],
            [['Lilac', '#C8A2C8'], ['Silver', '#C0C0C0'], ['White', '#FFFFFF']],
        ];

        [$g, $b, $city] = $couples[$v % count($couples)];
        $date = self::eventDate($today, $v, Carbon::SATURDAY);
        $year = (int) $date->year;

        return [
            'city'   => $city,
            'fields' => [
                'groom_name'        => $g[0],
                'groom_nickname'    => $g[1],
                'groom_child_order' => (string) $g[4],
                'groom_father'      => 'Bapak '.$g[2],
                'groom_mother'      => 'Ibu '.$g[3],
                'groom_instagram'   => strtolower(str_replace(' ', '.', $g[1])).'.'.strtolower(explode(' ', $g[0])[1] ?? 'id'),
                'groom_bio'         => "Putra ke-{$g[4]} dari Bapak {$g[2]} & Ibu {$g[3]}. Bekerja sebagai ".self::pick(['software engineer', 'arsitek', 'dokter gigi', 'konsultan keuangan', 'pengusaha kuliner', 'dosen'], $v).' di '.$city.'.',
                'bride_name'        => $b[0],
                'bride_nickname'    => $b[1],
                'bride_child_order' => (string) $b[4],
                'bride_father'      => 'Bapak '.$b[2],
                'bride_mother'      => 'Ibu '.$b[3],
                'bride_instagram'   => strtolower($b[1]).'.'.strtolower(explode(' ', $b[0])[1] ?? 'id'),
                'bride_bio'         => "Putri ke-{$b[4]} dari Bapak {$b[2]} & Ibu {$b[3]}. Seorang ".self::pick(['desainer grafis', 'guru SD', 'apoteker', 'content creator', 'notaris', 'perawat'], $v + 2).' yang gemar membaca dan memasak.',
                'opening_quote'     => self::pick($quotes, $v),
                'rsvp_deadline'     => $date->copy()->subDays(14)->toDateString(),
            ],
            'photos' => ['groom_photo' => 'groom', 'bride_photo' => 'bride', 'couple_photo' => 'couple'],
            'json'   => [
                'dress_code_colors' => array_map(fn ($c) => ['name' => $c[0], 'hex' => $c[1]], self::pick($palettes, $v)),
            ],
            'events' => [
                ['name' => 'Akad Nikah', 'date' => $date, 'time' => '08:00:00', 'time_end' => '10:00:00', 'venue' => self::venue($city, 'mosque'), 'countdown' => true],
                ['name' => 'Resepsi', 'date' => $date, 'time' => '11:00:00', 'time_end' => '14:00:00', 'venue' => self::venue($city, 'hall')],
            ],
            'stories' => [
                ['title' => 'Pertama Bertemu', 'period' => (string) ($year - 5), 'content' => "{$g[1]} dan {$b[1]} pertama kali bertemu di acara kampus di {$city}. Obrolan singkat tentang buku favorit ternyata menjadi awal dari cerita panjang kami."],
                ['title' => 'Mulai Dekat', 'period' => (string) ($year - 4), 'content' => 'Dari teman diskusi, kami menjadi sahabat yang saling menguatkan: melewati skripsi, wisuda, hingga langkah pertama di dunia kerja.'],
                ['title' => 'Lamaran', 'period' => (string) ($year - 1), 'content' => "Dengan restu kedua keluarga, {$g[1]} datang bersama keluarga untuk melamar {$b[1]} dalam suasana hangat dan penuh haru."],
                ['title' => 'Menuju Halal', 'period' => (string) $year, 'content' => 'Kini kami memantapkan hati untuk melangkah bersama dalam ikatan pernikahan. Mohon doa restu agar menjadi keluarga sakinah, mawaddah, warahmah.'],
            ],
            'wishes' => self::wishes('wedding', $v, "{$g[1]} & {$b[1]}"),
            'wishlist' => [
                ['name' => 'Set Peralatan Masak', 'description' => 'Panci & wajan anti lengket 5 pcs', 'price' => 1250000, 'category' => 'dapur'],
                ['name' => 'Sprei & Bed Cover King', 'description' => 'Katun jepang, warna netral', 'price' => 850000, 'category' => 'kamar'],
                ['name' => 'Air Fryer', 'description' => 'Kapasitas 4 liter', 'price' => 1100000, 'category' => 'elektronik'],
                ['name' => 'Dinner Set 24 pcs', 'description' => 'Piring & mangkuk keramik', 'price' => 650000, 'category' => 'dapur'],
            ],
            'greeting'        => "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia {$g[1]} & {$b[1]}.",
            'countdown_label' => 'Menuju Hari Bahagia',
            'account_name'    => $g[0],
            'bank_second_name'=> $b[0],
            'child_order'     => ['groom' => $g[4], 'bride' => $b[4]],
        ];
    }

    // ─── Birthday ────────────────────────────────────────────────────────────

    private static function birthday(int $v, Carbon $today): array
    {
        // [name, nickname, age, father, mother, party theme, city]
        $kids = [
            ['Arka Pratama', 'Arka', 5, 'Dimas Pratama', 'Rina Oktaviani', 'Space Explorer', 'Jakarta'],
            ['Kayla Azzahra Putri', 'Kayla', 7, 'Hendra Saputra', 'Melati Anggraini', 'Princess Garden', 'Bandung'],
            ['Rafka Alfarizi', 'Rafka', 3, 'Yusuf Alfarizi', 'Nurul Fitriani', 'Dino Adventure', 'Surabaya'],
            ['Aluna Maheswari', 'Aluna', 6, 'Aditya Wirawan', 'Sekar Kinasih', 'Unicorn Rainbow', 'Yogyakarta'],
            ['Kenzo Mahardika', 'Kenzo', 4, 'Rizky Mahardika', 'Anisa Putri', 'Construction Crew', 'Semarang'],
            ['Shakila Humaira', 'Shakila', 8, 'Fikri Ramadhan', 'Dewi Safitri', 'Under The Sea', 'Malang'],
            ['Byan Alvaro', 'Byan', 1, 'Galih Prakoso', 'Vania Larasati', 'Little Bear', 'Jakarta'],
            ['Queenza Adelia', 'Queen', 2, 'Andre Kurniawan', 'Sinta Maharani', 'Pink Balloon Party', 'Medan'],
            ['Athar Rasyid', 'Athar', 10, 'Irfan Rasyid', 'Laila Hasanah', 'Football Champion', 'Makassar'],
            ['Nayyara Khanza', 'Nayya', 9, 'Bayu Nugraha', 'Putri Ramadhani', 'Magical Garden', 'Denpasar'],
            ['Elvano Satria', 'Vano', 5, 'Satria Wijaya', 'Maudy Anindita', 'Superhero Squad', 'Padang'],
            ['Zivana Aurelia', 'Ziva', 4, 'Rendy Saputra', 'Oktavia Rahma', 'Candy Land', 'Bandung'],
        ];

        [$name, $nick, $age, $father, $mother, $partyTheme, $city] = $kids[$v % count($kids)];
        $date = self::eventDate($today, $v, Carbon::SUNDAY);
        $birthYear = $date->year - $age;

        $journey = [
            ['title' => 'Hari Pertama di Dunia', 'period' => (string) $birthYear, 'content' => "{$nick} lahir dan membawa kebahagiaan yang luar biasa untuk Ayah {$father} dan Bunda {$mother}."],
            ['title' => 'Langkah Pertama', 'period' => (string) ($birthYear + 1), 'content' => "Di usia satu tahun, {$nick} mulai berjalan sendiri. Semua orang di rumah ikut bersorak!"],
        ];
        if ($age >= 3) {
            $journey[] = ['title' => 'Hari Pertama Sekolah', 'period' => (string) ($birthYear + min($age, 4)), 'content' => "{$nick} berangkat ke sekolah dengan tas barunya, berani dan penuh semangat."];
        }
        $journey[] = ['title' => "Ulang Tahun ke-{$age}", 'period' => (string) $date->year, 'content' => "Tahun ini {$nick} merayakan ulang tahun ke-{$age} dengan tema {$partyTheme}. Yuk, rayakan bersama!"];

        return [
            'city'   => $city,
            'fields' => [
                'child_name'      => $name,
                'child_nickname'  => $nick,
                'child_age'       => (string) $age,
                'birthday_date'   => $date->toDateString(),
                'party_theme'     => $partyTheme,
                'father_name'     => $father,
                'mother_name'     => $mother,
                'opening_message' => "Hore! {$nick} berulang tahun yang ke-{$age}. Datang dan bergembira bersama di pesta bertema {$partyTheme}, ya!",
            ],
            'photos' => ['child_photo' => 'child'],
            'json'   => [],
            'events' => [
                ['name' => "Pesta Ulang Tahun {$nick}", 'date' => $date, 'time' => '15:30:00', 'time_end' => '18:00:00', 'venue' => self::venue($city, $v % 2 ? 'hall' : 'home', "Kediaman Keluarga {$father}"), 'countdown' => true],
            ],
            'stories'  => $journey,
            'wishes'   => self::wishes('birthday', $v, $nick),
            'wishlist' => [
                ['name' => 'Buku Cerita Bergambar', 'description' => 'Seri dongeng nusantara', 'price' => 150000, 'category' => 'buku'],
                ['name' => 'Set Lego Classic', 'description' => 'Untuk usia '.max(3, $age).'+', 'price' => 450000, 'category' => 'mainan'],
                ['name' => 'Sepeda Anak', 'description' => 'Roda 16 inci', 'price' => 900000, 'category' => 'olahraga'],
            ],
            'greeting'        => "Dengan penuh sukacita, kami mengundang kamu untuk merayakan ulang tahun {$nick} yang ke-{$age}.",
            'countdown_label' => 'Menuju Pesta',
            'account_name'    => $father,
        ];
    }

    // ─── Khitanan ────────────────────────────────────────────────────────────

    private static function khitanan(int $v, Carbon $today): array
    {
        $kids = [
            ['Rizky Maulana', 7, 'H. Ahmad Maulana', 'Hj. Siti Rahmah', 'Jakarta'],
            ['Muhammad Fathan Al-Ghifari', 8, 'Ghifari Rahman', 'Nur Aisyah', 'Bandung'],
            ['Daffa Arrasyid', 6, 'Arif Rasyid', 'Lutfiah Hanum', 'Surabaya'],
            ['Ahmad Zidan Firdaus', 9, 'H. Firdaus Hamid', 'Hj. Maryam', 'Medan'],
            ['Alif Nur Hidayat', 7, 'Nur Hidayat', 'Sri Mulyani', 'Yogyakarta'],
            ['Umar Faruq Hakim', 10, 'Lukman Hakim', 'Fatimah Azzahra', 'Makassar'],
            ['Faiz Ramadhan', 6, 'Budi Ramadhan', 'Yanti Susanti', 'Semarang'],
            ['Hanif Abdurrahman', 8, 'Abdurrahman Saleh', 'Khadijah', 'Banda Aceh'],
        ];

        [$name, $age, $father, $mother, $city] = $kids[$v % count($kids)];
        $date = self::eventDate($today, $v, Carbon::SUNDAY);
        $nick = explode(' ', $name)[0] === 'Muhammad' || explode(' ', $name)[0] === 'Ahmad' ? explode(' ', $name)[1] : explode(' ', $name)[0];
        $home = "Kediaman Keluarga Bapak {$father}";

        return [
            'city'   => $city,
            'fields' => [
                'child_name'      => $name,
                'child_age'       => "{$age} Tahun",
                'father_name'     => $father,
                'mother_name'     => $mother,
                'opening_message' => "Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan tasyakuran khitanan putra kami, {$name}. Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
            ],
            'photos' => ['child_photo' => 'child'],
            'json'   => [],
            'events' => [
                ['name' => 'Prosesi Khitan', 'date' => $date, 'time' => '07:30:00', 'time_end' => '09:00:00', 'venue' => self::venue($city, 'home', $home)],
                ['name' => 'Tasyakuran & Walimatul Khitan', 'date' => $date, 'time' => '10:00:00', 'time_end' => '14:00:00', 'venue' => self::venue($city, 'home', $home), 'countdown' => true],
            ],
            'stories'  => [],
            'wishes'   => self::wishes('khitanan', $v, $nick),
            'wishlist' => [],
            'greeting'        => "Mohon doa restu untuk khitanan ananda {$nick}.",
            'countdown_label' => 'Menuju Hari Khitan',
            'account_name'    => $father,
        ];
    }

    // ─── Aqiqah ──────────────────────────────────────────────────────────────

    private static function aqiqah(int $v, Carbon $today): array
    {
        // [baby name, gender, father, mother, city]
        $babies = [
            ['Alya Zahra', 'Perempuan', 'Budi Santoso', 'Sinta Maharani', 'Jakarta'],
            ['Muhammad Arsyad Al-Fatih', 'Laki-laki', 'Arif Hidayatullah', 'Nisa Rahmawati', 'Bandung'],
            ['Aisyah Nur Hafizah', 'Perempuan', 'Rahmat Hidayat', 'Fitri Handayani', 'Surabaya'],
            ['Abdullah Rayyan', 'Laki-laki', 'Hasan Basri', 'Zulaikha', 'Medan'],
            ['Khadijah Humaira', 'Perempuan', 'Ilyas Maulana', 'Rahmi Yuliani', 'Padang'],
            ['Ahmad Zayyan Rafisqy', 'Laki-laki', 'Fauzan Azhari', 'Mutia Sari', 'Yogyakarta'],
            ['Hafsah Kamila', 'Perempuan', 'Zainal Arifin', 'Maulida Rahma', 'Semarang'],
            ['Umar Al-Ghazali', 'Laki-laki', 'Ghazali Ramli', 'Nuraini', 'Banda Aceh'],
            ['Fatimah Az-Zahra', 'Perempuan', 'Hamzah Fadillah', 'Yasmin Aulia', 'Makassar'],
            ['Yusuf Rasyad Hakim', 'Laki-laki', 'Lukmanul Hakim', 'Anisa Fitri', 'Malang'],
            ['Maryam Syakira', 'Perempuan', 'Salman Alfarisi', 'Dewi Kurnia', 'Jakarta'],
            ['Bilal Arrazi', 'Laki-laki', 'Razi Pratama', 'Hana Safira', 'Denpasar'],
            ['Zainab Azkadina', 'Perempuan', 'Fikri Haikal', 'Lulu Maknun', 'Bandung'],
            ['Ibrahim Akhtar Rafif', 'Laki-laki', 'Akhmad Rafif', 'Salma Nabila', 'Surabaya'],
            ['Hana Almahyra', 'Perempuan', 'Rizki Firmansyah', 'Nadia Utami', 'Yogyakarta'],
            ['Ali Zafran Mubarak', 'Laki-laki', 'Mubarak Syah', 'Rahayu Ningsih', 'Medan'],
        ];

        [$name, $gender, $father, $mother, $city] = $babies[$v % count($babies)];
        $date = self::eventDate($today, $v, Carbon::SATURDAY);
        $birth = $date->copy()->subDays(21 + ($v % 3) * 7); // aqiqah on day 21/28/35
        $child = $gender === 'Laki-laki' ? 'putra' : 'putri';
        $home = "Kediaman Bapak {$father}";

        return [
            'city'   => $city,
            'fields' => [
                'baby_name'       => $name,
                'baby_gender'     => $gender,
                'birth_date'      => $birth->toDateString(),
                'father_name'     => $father,
                'mother_name'     => $mother,
                'opening_message' => "Alhamdulillah, dengan penuh rasa syukur atas kelahiran {$child} kami, {$name}, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara aqiqah dan tasyakuran sebagai wujud syukur kepada Allah SWT.",
            ],
            'photos' => ['baby_photo' => 'baby'],
            'json'   => [],
            'events' => [
                ['name' => 'Aqiqah & Cukur Rambut', 'date' => $date, 'time' => '08:00:00', 'time_end' => '10:00:00', 'venue' => self::venue($city, 'home', $home)],
                ['name' => 'Tasyakuran & Doa Bersama', 'date' => $date, 'time' => '10:30:00', 'time_end' => '13:00:00', 'venue' => self::venue($city, 'home', $home), 'countdown' => true],
            ],
            'stories'  => [],
            'wishes'   => self::wishes('aqiqah', $v, explode(' ', $name)[0] === 'Muhammad' ? explode(' ', $name)[1] : explode(' ', $name)[0]),
            'wishlist' => [
                ['name' => 'Stroller Bayi', 'description' => 'Ringan & mudah dilipat', 'price' => 1500000, 'category' => 'bayi'],
                ['name' => 'Paket Popok & Tisu Basah', 'description' => 'Ukuran S/M', 'price' => 350000, 'category' => 'bayi'],
                ['name' => 'Baby Carrier', 'description' => 'Ergonomis 0-24 bulan', 'price' => 600000, 'category' => 'bayi'],
            ],
            'greeting'        => "Dengan rasa syukur, kami mengundang Anda di acara aqiqah {$child} kami.",
            'countdown_label' => 'Menuju Hari Aqiqah',
            'account_name'    => $father,
            'bank_second_name'=> $mother,
        ];
    }

    // ─── Gender reveal ───────────────────────────────────────────────────────

    private static function genderReveal(int $v, Carbon $today): array
    {
        // [father, mother, team A, team B, city]
        $parents = [
            ['Aditya Nugraha', 'Naya Anggraini', 'Team Jagoan', 'Team Putri', 'Jakarta'],
            ['Rendra Wicaksono', 'Mira Andriani', 'Team Boy', 'Team Girl', 'Bandung'],
            ['Fadli Ramadhan', 'Sarah Amalia', 'Tim Biru', 'Tim Pink', 'Surabaya'],
            ['Kurnia Saputra', 'Livia Maharani', 'Team Blue', 'Team Pink', 'Yogyakarta'],
            ['Hanif Pratama', 'Diandra Putri', 'Tim Pangeran', 'Tim Princess', 'Malang'],
            ['Gerry Firmansyah', 'Tasya Kamila', 'Team Mustache', 'Team Lashes', 'Denpasar'],
            ['Iqbal Maulana', 'Rania Salsabila', 'Tim Robot', 'Tim Boneka', 'Semarang'],
            ['Satrio Wibisono', 'Ayu Pramesti', 'Team Superhero', 'Team Fairy', 'Medan'],
        ];

        [$father, $mother, $teamA, $teamB, $city] = $parents[$v % count($parents)];
        $date = self::eventDate($today, $v, Carbon::SATURDAY);
        $due = $date->copy()->addMonths(4)->addDays(9);
        $fatherNick = explode(' ', $father)[0];
        $motherNick = explode(' ', $mother)[0];

        return [
            'city'   => $city,
            'fields' => [
                'mother_name'         => $mother,
                'father_name'         => $father,
                'due_date'            => $due->toDateString(),
                'team_a_name'         => $teamA,
                'team_b_name'         => $teamB,
                'reveal_scheduled_at' => $date->toDateString(),
                'opening_message'     => "Boy or girl? Baby {$fatherNick} & {$motherNick} sebentar lagi hadir! Ikut tebak dan saksikan momen reveal bersama keluarga dan sahabat.",
            ],
            'photos' => ['parents_photo' => 'parents'],
            'json'   => [],
            'events' => [
                ['name' => 'Gender Reveal Party', 'date' => $date, 'time' => '16:00:00', 'time_end' => '19:00:00', 'venue' => self::venue($city, 'home', "Taman Kediaman {$fatherNick} & {$motherNick}"), 'countdown' => true],
            ],
            'stories'  => [],
            'wishes'   => self::wishes('gender_reveal', $v, "{$fatherNick} & {$motherNick}"),
            'wishlist' => [
                ['name' => 'Baby Crib', 'description' => 'Box bayi kayu dengan kelambu', 'price' => 2200000, 'category' => 'bayi'],
                ['name' => 'Baju Bayi Newborn', 'description' => 'Warna netral, 0-3 bulan', 'price' => 300000, 'category' => 'bayi'],
                ['name' => 'Baby Monitor', 'description' => 'Dengan kamera & aplikasi', 'price' => 950000, 'category' => 'elektronik'],
            ],
            'greeting'        => "Boy or girl? Temani kami mengungkap jawabannya!",
            'countdown_label' => 'Menuju Momen Reveal',
            'account_name'    => $father,
            'bank_second_name'=> $mother,
        ];
    }

    // ─── Syukuran / selametan ───────────────────────────────────────────────

    private static function syukuran(int $v, Carbon $today): array
    {
        // [host, occasion, message detail, city]
        $hosts = [
            ['Keluarga Bapak H. Sudarmono', 'Syukuran Rumah Baru', 'menempati rumah baru kami', 'Yogyakarta'],
            ['Keluarga Bapak Agus Salim', 'Walimatus Safar Haji', 'keberangkatan kami menunaikan ibadah haji', 'Jakarta'],
            ['Keluarga Ibu Hj. Nurhasanah', 'Syukuran Khataman Al-Qur\'an', 'khataman Al-Qur\'an putra-putri kami', 'Bandung'],
            ['Keluarga Bapak Wahyu Santoso', 'Selametan Tujuh Bulanan (Mitoni)', 'usia tujuh bulan kehamilan putri kami', 'Semarang'],
            ['Keluarga Bapak Ir. Harjono', 'Syukuran Purna Tugas', 'purna tugas Bapak Harjono setelah 32 tahun mengabdi', 'Surabaya'],
            ['Keluarga Bapak Dedi Kurniawan', 'Syukuran Pembukaan Usaha', 'dibukanya usaha kuliner keluarga kami', 'Malang'],
            ['Keluarga Bapak Syamsul Bahri', 'Syukuran Kelulusan', 'kelulusan putri kami sebagai sarjana kedokteran', 'Padang'],
            ['Keluarga Ibu Ratna Sari', 'Selametan Rumah Baru', 'selesainya pembangunan rumah kami', 'Makassar'],
        ];

        [$host, $occasion, $reason, $city] = $hosts[$v % count($hosts)];
        $date = self::eventDate($today, $v, Carbon::SUNDAY);
        $home = 'Kediaman '.str_replace('Keluarga ', '', $host);

        return [
            'city'   => $city,
            'fields' => [
                'host_name'       => $host,
                'occasion'        => $occasion,
                'opening_message' => "Assalamu'alaikum Warahmatullahi Wabarakatuh. Sebagai ungkapan rasa syukur atas {$reason}, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara {$occasion}, doa bersama, dan ramah tamah.",
            ],
            'photos' => ['host_photo' => 'host'],
            'json'   => [],
            'events' => [
                ['name' => 'Pengajian & Doa Bersama', 'date' => $date, 'time' => '09:00:00', 'time_end' => '11:00:00', 'venue' => self::venue($city, 'home', $home), 'countdown' => true],
                ['name' => 'Ramah Tamah & Makan Bersama', 'date' => $date, 'time' => '11:00:00', 'time_end' => '13:30:00', 'venue' => self::venue($city, 'home', $home)],
            ],
            'stories'  => [],
            'wishes'   => self::wishes('syukuran', $v, $host),
            'wishlist' => [],
            'greeting'        => "Kami mengundang Anda di acara {$occasion} kami.",
            'countdown_label' => 'Menuju Hari Acara',
            'account_name'    => str_replace(['Keluarga Bapak ', 'Keluarga Ibu '], '', $host),
        ];
    }

    // ─── Shared helpers ──────────────────────────────────────────────────────

    /**
     * Future date (so countdowns run), spread per variant: 5–12 weeks ahead,
     * snapped to the given weekday.
     */
    private static function eventDate(Carbon $today, int $v, int $weekday): Carbon
    {
        return $today->copy()->addWeeks(5 + ($v % 8))->next($weekday)->startOfDay();
    }

    /** @return array<int, array{name: string, message: string}> */
    private static function wishes(string $type, int $v, string $who): array
    {
        $pool = match ($type) {
            'wedding' => [
                ['Rina & Keluarga', "Selamat menempuh hidup baru, {$who}! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah."],
                ['Fadil Akbar', 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fii khair. Bahagia selalu!'],
                ['Tim Kantor Divisi Marketing', 'Congrats! Semoga langgeng sampai kakek nenek. Ditunggu undangan syukuran berikutnya 😄'],
                ['Sari Wulandari', 'Ikut bahagia banget! Semoga dilancarkan sampai hari H dan seterusnya.'],
                ['Keluarga Besar Pak RT', 'Selamat ya, semoga pernikahannya penuh berkah dan cepat diberi momongan.'],
                ['Bagus Hermawan', 'Akhirnya! Selamat bro, jaga baik-baik ya. Semoga bahagia dunia akhirat.'],
                ['Anggi & Rizal', 'Selamat berbahagia! Semoga cinta kalian terus tumbuh setiap harinya.'],
            ],
            'birthday' => [
                ['Tante Mira', "Selamat ulang tahun {$who}! Semoga sehat, pintar, dan jadi anak yang sholeh/sholehah."],
                ['Keluarga Om Yudi', "Happy birthday {$who}! Makin ceria dan disayang semua orang ya."],
                ['Bu Guru Ratna', "Selamat ulang tahun, {$who}. Terus semangat belajar dan bermain bersama teman-teman!"],
                ['Kakek & Nenek', 'Doa terbaik untuk cucu tersayang. Panjang umur dan sehat selalu.'],
                ['Keysha & Mama', 'Yeay! Nggak sabar datang ke pestanya. Happy birthday!'],
                ['Om Bima', "Wish you all the best, {$who}! Tumbuh jadi anak hebat ya."],
            ],
            'khitanan' => [
                ['Keluarga Pak Haji Somad', "Selamat untuk {$who}, semoga menjadi anak yang sholeh dan berbakti kepada orang tua."],
                ['Ustadz Hamid', 'Barakallah, semoga lekas pulih dan semakin rajin beribadah.'],
                ['Tante Yuni', "Selamat ya {$who}, jagoan hebat! Cepat sembuh dan bisa main lagi."],
                ['Teman-teman TPA Al-Ikhlas', "Semangat {$who}! Kami tunggu di TPA lagi ya."],
                ['Keluarga Bu Ani', 'Semoga acaranya lancar dan penuh berkah.'],
                ['Om Rudi & Keluarga', 'Selamat, semoga tumbuh menjadi laki-laki yang bertanggung jawab.'],
            ],
            'aqiqah' => [
                ['Keluarga Besar Bani Hasyim', "Selamat atas kelahiran {$who}. Semoga menjadi anak yang sholeh/sholehah dan penyejuk hati orang tua."],
                ['Ustadzah Laila', 'Barakallahu lakum fil mauhubi lakum. Semoga tumbuh dalam lindungan Allah SWT.'],
                ['Dina & Fahmi', 'MasyaAllah, selamat ya! Semoga sehat selalu ibu dan dedek bayinya.'],
                ['Tante Ira', "Welcome to the world, {$who}! Nggak sabar mau gendong."],
                ['Rekan Kerja Ayah', 'Selamat menjadi orang tua, semoga amanah dan penuh berkah.'],
                ['Keluarga Pak Ridwan', 'Semoga acara aqiqahnya lancar dan membawa keberkahan.'],
            ],
            'gender_reveal' => [
                ['Tante Lala', 'Aku tebak cewek! Semoga sehat selalu mama & dedek bayi 💗'],
                ['Om Dodi', 'Pasti cowok nih, calon jagoan! Semoga lancar sampai lahiran.'],
                ['Bestie SMA', "Gak sabar liat reveal-nya! Selamat {$who} 🎉"],
                ['Keluarga Bu Wati', 'Apapun jenis kelaminnya, semoga jadi anak yang sholeh/sholehah.'],
                ['Rekan Kantor', 'Congrats calon ayah & bunda! Semoga persalinannya lancar.'],
                ['Nenek Sumi', 'Doa nenek selalu menyertai, sehat-sehat cucu nenek.'],
            ],
            default => [
                ['Keluarga Pak Lurah', 'Selamat, semoga acaranya lancar dan membawa berkah untuk seluruh keluarga.'],
                ['Ibu-ibu Majelis Taklim', 'Alhamdulillah, turut berbahagia. Semoga Allah melimpahkan rezeki dan keberkahan.'],
                ['Tetangga RT 05', 'Insya Allah kami hadir. Semoga selalu diberi kesehatan.'],
                ['Pak Haji Karim', 'Barakallah, semoga menjadi amal jariyah dan rahmat bagi keluarga.'],
                ['Keluarga Besar di Kampung', 'Ikut senang mendengarnya, semoga semuanya lancar.'],
                ['Rekan Kerja', 'Selamat! Semoga ke depannya semakin sukses dan berkah.'],
            ],
        };

        // Rotate so neighbouring samples don't show the same first wishes.
        $offset = $v % count($pool);

        return array_map(
            fn ($w) => ['name' => $w[0], 'message' => $w[1]],
            array_slice(array_merge(array_slice($pool, $offset), array_slice($pool, 0, $offset)), 0, 5),
        );
    }

    /**
     * Digital envelope bank accounts. Numbers start with 000 so they can't
     * be mistaken for (or collide with) a real account.
     *
     * @return array<int, array{bankName: string, accountNumber: string, accountName: string}>
     */
    private static function bankAccounts(int $v, string $name, ?string $secondName): array
    {
        $accounts = [[
            'bankName'      => self::pick(self::BANKS, $v),
            'accountNumber' => sprintf('000%07d', 1200000 + $v * 137),
            'accountName'   => $name,
        ]];

        if ($secondName) {
            $accounts[] = [
                'bankName'      => self::pick(self::BANKS, $v + 3),
                'accountNumber' => sprintf('000%07d', 3400000 + $v * 211),
                'accountName'   => $secondName,
            ];
        }

        return $accounts;
    }

    /**
     * E-wallet shown in the digital envelope. 0800 is a toll-free prefix, not
     * a mobile number, so it cannot receive real transfers.
     *
     * @return array{provider: string, label: string, number: string, name: string}
     */
    private static function wallet(int $v, string $name): array
    {
        [$provider, $label] = self::pick(self::WALLETS, $v);

        return [
            'provider' => $provider,
            'label'    => $label,
            'number'   => sprintf('0800%07d', 5500000 + $v),
            'name'     => $name,
        ];
    }

    private static function pick(array $list, int $v): mixed
    {
        return $list[$v % count($list)];
    }
}

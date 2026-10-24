<?php

namespace Database\Seeders\Data;

use Illuminate\Support\Carbon;

/**
 * Curated demo content for birthday_theme_01 … birthday_theme_20: one child per
 * theme whose age, party theme, story and gift list fit the theme's design
 * (03 is a bear & honey first birthday, 06 a go-kart race, 20 a rose gold
 * sweet sixteen…), instead of the shared rotation, which pairs designs with
 * unrelated party themes.
 *
 * build() returns the same shape as SampleInvitationData's birthday() and is
 * used by both SampleInvitationSeeder (full run) and ResetBirthdaySampleSeeder
 * (only these themes). Themes 11–20 have no design yet, so their entries
 * follow the theme's description in ThemeSeeder.
 */
class BirthdayThemeSampleData
{
    /**
     * child:   [full name, nickname, age, gender L|P, father, mother]
     * party:   party theme (the party_theme field)
     * events:  [name (null = "Pesta Ulang Tahun {nickname}"), venue kind (home|hall), start, end]
     *          + optional 'countdown' (default: the only event)
     * photo:   profile photo from assets/sample-invitations/birthday/
     * moments: moment-NN photos in the order the gallery and stories use them
     * stories: [title, years after birth, content]; the last one is this year's birthday
     *
     * Optional: 'greeting', 'countdown_label', 'home' (venue name of 'home'
     * events), 'weekday' (default Sunday), 'wishes' ([name, message]) and
     * 'banks' (bank name of the digital-envelope account).
     */
    private const THEMES = [
        'birthday_theme_01' => [
            'city'     => 'Jakarta',
            'child'    => ['Arkan Bima Pradipta', 'Arkan', 2, 'L', 'Dimas Pradipta', 'Rina Oktaviani'],
            'party'    => 'Pesta Balon Warna-warni',
            'opening'  => 'Hore, Arkan genap 2 tahun! Ada balon warna-warni, hujan confetti, dan kue cokelat kesukaan Arkan. Datang dan rayakan bersama kami, ya!',
            'events'   => [[null, 'home', '15:30', '18:00']],
            'photo'    => 'child-01.jpg',
            'moments'  => [5, 2, 4, 1, 3, 15, 7, 13, 11],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Arkan lahir di sebuah pagi yang cerah dan langsung menjadi pusat perhatian seisi rumah.'],
                ['Kata Pertama', 1, '"Bola!" adalah kata pertama Arkan. Sejak itu, balon dan bola selalu berhasil membuatnya tertawa.'],
                ['Ulang Tahun ke-2', 2, 'Tahun ini Arkan merayakan ulang tahunnya dengan balon warna-warni dan hujan confetti. Yuk, ikut meramaikan!'],
            ],
            'wishlist' => [
                ['Balok Susun Kayu', 'Isi 50 balok warna-warni', 250000, 'mainan'],
                ['Buku Kain Bergambar', 'Aman dan lembut untuk balita', 120000, 'buku'],
                ['Sepeda Roda Tiga', 'Dengan gagang dorong untuk orang tua', 650000, 'olahraga'],
            ],
        ],
        'birthday_theme_02' => [
            'city'     => 'Bandung',
            'child'    => ['Alesha Putri Maharani', 'Alesha', 3, 'P', 'Rizky Ramadhan', 'Nadia Kusumawati'],
            'party'    => 'Istana Pelangi & Unicorn',
            'opening'  => 'Di balik pelangi ada istana yang menunggu tamu istimewa! Alesha genap 3 tahun dan ingin merayakannya bersamamu di Istana Pelangi.',
            'events'   => [[null, 'hall', '10:00', '12:30']],
            'photo'    => 'child-02.jpg',
            'moments'  => [4, 7, 8, 3, 13, 2, 10, 11, 1],
            'stories'  => [
                ['Putri Kecil Lahir', 0, 'Alesha lahir tepat saat hujan reda dan pelangi muncul di langit Bandung. Sejak itu, pelangi menjadi warna favoritnya.'],
                ['Langkah Pertama', 1, 'Langkah pertama Alesha menuju boneka unicorn pemberian Nenek. Boneka itu masih menemaninya tidur sampai sekarang.'],
                ['Ulang Tahun ke-3', 3, 'Kini Alesha berulang tahun yang ke-3 di Istana Pelangi. Siapkan mahkota terbaikmu!'],
            ],
            'wishlist' => [
                ['Kostum Putri & Mahkota', 'Ukuran 3–4 tahun', 280000, 'pakaian'],
                ['Boneka Unicorn Besar', 'Bulu lembut, tinggi 60 cm', 320000, 'mainan'],
                ['Buku Dongeng Putri Nusantara', 'Kumpulan 12 cerita bergambar', 150000, 'buku'],
            ],
        ],
        'birthday_theme_03' => [
            'city'     => 'Yogyakarta',
            'child'    => ['Bimo Satria Nugraha', 'Bimo', 1, 'L', 'Yoga Nugraha', 'Laras Setyaningsih'],
            'party'    => 'Beruang Kecil & Lebah Madu',
            'opening'  => 'Bzzz… ada kabar manis dari hutan! Beruang kecil kami, Bimo, genap 1 tahun. Mampirlah ke pesta madu kami dan ikut menyaksikan tiup lilin pertamanya.',
            'events'   => [[null, 'home', '15:30', '17:30']],
            'photo'    => 'child-03.jpg',
            'moments'  => [1, 3, 13, 4, 11, 5, 7, 2, 6],
            'stories'  => [
                ['Selamat Datang, Bimo', 0, 'Bimo lahir dengan tangis yang kencang dan pipi bulat seperti beruang kecil. Panggilan sayang itu melekat sampai sekarang.'],
                ['Merangkak & Berceloteh', 0, 'Di usia delapan bulan, Bimo sudah merangkak ke mana-mana sambil berceloteh "ba-ba-ba". Rumah tak pernah sepi lagi.'],
                ['Ulang Tahun Pertama', 1, 'Lilin pertama untuk Bimo! Kami merayakannya dengan pesta hutan kecil bertema beruang dan lebah madu.'],
            ],
            'wishlist' => [
                ['Dorongan Belajar Jalan', 'Kayu, lengkap dengan balok susun', 350000, 'bayi'],
                ['Boneka Beruang Lembut', 'Aman untuk bayi, 40 cm', 180000, 'mainan'],
                ['Set Alat Makan Bayi', 'Piring silikon dan sendok', 160000, 'bayi'],
            ],
        ],
        'birthday_theme_04' => [
            'city'     => 'Semarang',
            'child'    => ['Naura Kinanti Prameswari', 'Naura', 2, 'P', 'Bayu Prameswara', 'Dian Puspitasari'],
            'party'    => 'Pesta Kucing Pastel',
            'opening'  => 'Meong! Naura genap 2 tahun dan mengundang teman-teman ke pesta kucing bernuansa pastel yang manis. Jangan lupa bawa senyum paling lucumu, ya!',
            'events'   => [[null, 'home', '15:00', '17:30']],
            'photo'    => 'child-05.jpg',
            'moments'  => [3, 13, 4, 7, 8, 11, 2, 10, 1],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Naura lahir mungil dan tenang. Mochi, kucing oranye keluarga, setia berjaga di samping boks bayinya.'],
                ['Sahabat Berbulu', 1, 'Kata pertama Naura bukan "mama", melainkan "pus"! Ke mana pun Mochi pergi, Naura merangkak mengikutinya.'],
                ['Ulang Tahun ke-2', 2, 'Tahun ini Naura merayakan ulang tahun ke-2 dengan pesta kucing bernuansa pink, ungu, dan mint. Ayo datang!'],
            ],
            'wishlist' => [
                ['Boneka Kucing Interaktif', 'Bisa mengeong dan bergerak', 220000, 'mainan'],
                ['Set Piyama Pastel', 'Katun lembut, ukuran 2 tahun', 150000, 'pakaian'],
                ['Buku Cerita Si Mochi', 'Buku papan bergambar', 95000, 'buku'],
            ],
        ],
        'birthday_theme_05' => [
            'city'            => 'Surabaya',
            'child'           => ['Keisha Amara Wijaya', 'Keisha', 13, 'P', 'Reza Wijaya', 'Anindita Kusuma'],
            'party'           => 'Malam Ungu Bertabur Bintang',
            'opening'         => 'Satu malam, kue tiga tingkat, dan tiga belas lilin yang siap ditiup. Keisha mengundangmu ke pesta malam bernuansa ungu untuk merayakan usianya yang ke-13.',
            'greeting'        => 'Dengan penuh sukacita, kami mengundang kamu ke malam istimewa ulang tahun Keisha yang ke-13.',
            'events'          => [[null, 'hall', '18:30', '21:00']],
            'weekday'         => Carbon::SATURDAY,
            // No teen portrait in the pool: a girl blowing out her candles at night fits this design.
            'photo'           => 'moment-09.jpg',
            'moments'         => [6, 10, 12, 1, 11, 13, 2, 15, 7],
            'stories'         => [
                ['Hari Pertama di Dunia', 0, 'Keisha lahir di sebuah malam yang tenang di Surabaya. Kata Bunda, bintang malam itu bersinar lebih terang dari biasanya.'],
                ['Panggung Pertama', 6, 'Di usia enam tahun, Keisha menari di pentas sekolah dengan gaun ungu — warna yang sampai sekarang menjadi favoritnya.'],
                ['Juara Baca Puisi', 11, 'Keisha meraih juara pertama lomba baca puisi tingkat kota. Malam itu kami merayakannya dengan kue kecil dan satu lilin.'],
                ['Ulang Tahun ke-13', 13, 'Kini Keisha resmi menjadi remaja! Mari rayakan malam spesial ini bersama keluarga dan sahabat.'],
            ],
            'wishes'          => [
                ['Sahabat Kelas 7B', 'Happy 13th birthday, Keisha! Makin keren, makin pintar, dan tetap jadi sahabat terbaik kami 💜'],
                ['Tante Wulan', 'Selamat ulang tahun, sayang. Semoga tumbuh menjadi remaja yang baik hati, sehat, dan selalu bahagia.'],
                ['Bu Guru Ratna', 'Selamat ulang tahun, Keisha. Terus kembangkan bakat puisimu, ya. Ibu bangga!'],
                ['Kakek & Nenek', 'Doa terbaik untuk cucu kesayangan. Panjang umur, sehat, dan selalu dalam lindungan Allah.'],
                ['Om Bima & Keluarga', 'Selamat datang di usia remaja, Keisha! Semoga semua impianmu tercapai 🎉'],
            ],
            'wishlist'        => [
                ['Novel Fantasi Seri Lengkap', 'Box set lima buku', 450000, 'buku'],
                ['Lampu Proyektor Bintang', 'Nuansa ungu untuk kamar', 230000, 'kamar'],
                ['Jurnal & Set Pena Kaligrafi', 'Untuk menulis puisi', 180000, 'alat tulis'],
            ],
        ],
        'birthday_theme_06' => [
            'city'     => 'Malang',
            'child'    => ['Rasya Danendra Putra', 'Rasya', 4, 'L', 'Ardi Setiawan', 'Mega Lestari'],
            'party'    => 'Grand Prix Gokart Cilik',
            'opening'  => 'Lampu start menyala… siap, siaga, ngeeeng! Rasya genap 4 tahun dan menantangmu balapan di Grand Prix Gokart Cilik. Sampai jumpa di garis start!',
            'events'   => [[null, 'home', '15:30', '18:00']],
            'home'     => 'Halaman Kediaman Keluarga Ardi Setiawan',
            'photo'    => 'child-06.jpg',
            'moments'  => [14, 5, 2, 7, 15, 3, 11, 1, 8],
            'stories'  => [
                ['Pembalap Cilik Lahir', 0, 'Rasya lahir di Malang dan langsung melaju ke hati seluruh keluarga.'],
                ['Mobil-mobilan Pertama', 1, 'Hadiah ulang tahun pertama Rasya adalah mobil-mobilan merah. Sejak itu, semua benda beroda menjadi mainan favoritnya.'],
                ['Gokart Pertama', 3, 'Di usia tiga tahun, Rasya pertama kali duduk di gokart mini bersama Ayah. Senyumnya lebar sekali saat melewati garis finis!'],
                ['Ulang Tahun ke-4', 4, 'Tahun ini Rasya merayakan ulang tahunnya dengan tema balapan gokart. Siapkan helm dan semangat balapmu!'],
            ],
            'wishlist' => [
                ['Gokart Pedal Anak', 'Untuk usia 3–6 tahun', 1200000, 'olahraga'],
                ['Set Mobil Balap & Lintasan', 'Lintasan sepanjang 3 meter', 380000, 'mainan'],
                ['Helm Sepeda Anak', 'Motif bendera finis', 210000, 'olahraga'],
            ],
        ],
        'birthday_theme_07' => [
            'city'     => 'Medan',
            'child'    => ['Muhammad Rafif Nasution', 'Rafif', 6, 'L', 'Fadli Nasution', 'Rahmi Siregar'],
            'party'    => 'Pesta Pahlawan Super',
            'opening'  => 'BOOM! Pahlawan super kita, Rafif, genap 6 tahun! Kenakan jubah terbaikmu dan bergabunglah dalam misi pesta paling seru tahun ini.',
            'events'   => [[null, 'hall', '15:00', '17:30']],
            'photo'    => 'child-07.jpg',
            'moments'  => [5, 2, 6, 15, 11, 3, 7, 14, 1],
            'stories'  => [
                ['Lahirnya Sang Pahlawan', 0, 'Rafif lahir di Medan dengan tangis yang lantang. Kata Ayah, itu suara pahlawan masa depan.'],
                ['Jubah Pertama', 3, 'Di usia tiga tahun, Rafif menolak melepas jubah merah buatan Bunda, bahkan saat tidur siang.'],
                ['Pahlawan di Sekolah', 5, 'Di TK, Rafif dikenal suka menolong teman yang jatuh dan berbagi bekal. Pahlawan sejati tidak selalu memakai topeng!'],
                ['Ulang Tahun ke-6', 6, 'Kini Rafif berulang tahun yang ke-6 dengan tema pahlawan super. Misi kita hari itu: tertawa dan bersenang-senang!'],
            ],
            'wishlist' => [
                ['Kostum Pahlawan Super', 'Lengkap dengan topeng dan jubah', 250000, 'pakaian'],
                ['Komik Pahlawan Nusantara', 'Seri Gatotkaca untuk anak', 120000, 'buku'],
                ['Set Figur Aksi', 'Isi enam karakter', 300000, 'mainan'],
            ],
        ],
        'birthday_theme_08' => [
            'city'     => 'Denpasar',
            'child'    => ['Ni Putu Aira Pramesti', 'Aira', 1, 'P', 'I Made Wiradana', 'Ni Kadek Sri Lestari'],
            'party'    => 'Petualangan Safari',
            'opening'  => 'Jip safari sudah siap berangkat! Si kecil Aira genap 1 tahun dan ingin merayakannya bersama jerapah, zebra, singa, gajah, monyet — dan tentu saja kamu.',
            'events'   => [[null, 'home', '16:00', '18:00']],
            'photo'    => 'child-04.jpg',
            'moments'  => [1, 15, 5, 3, 11, 14, 7, 2, 4],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Aira lahir di Denpasar dan disambut hangat oleh keluarga besar. Matanya yang bulat langsung mencuri perhatian semua orang.'],
                ['Bertemu Gajah', 0, 'Di usia sepuluh bulan, Aira pertama kali melihat gajah di kebun binatang. Ia tertawa keras sambil menunjuk belalainya!'],
                ['Ulang Tahun Pertama', 1, 'Untuk ulang tahun pertamanya, Aira mengajak teman-teman bertualang di pesta safari. Siapkan topi penjelajahmu!'],
            ],
            'wishes'   => [
                ['Keluarga Besar di Tabanan', 'Rahajeng wanti warsa, Aira! Semoga selalu sehat, ceria, dan tumbuh menjadi anak yang baik.'],
                ['Tante Komang', 'Selamat ulang tahun pertama, sayang! Tante nggak sabar ikut bertualang di pesta safarimu.'],
                ['Kakek & Nenek', 'Doa terbaik untuk cucu tersayang. Panjang umur dan bahagia selalu.'],
                ['Ayu & Mama', 'Happy 1st birthday, Aira! Semoga makin lucu dan sehat selalu.'],
                ['Om Wayan', 'Selamat ulang tahun, Aira! Tumbuhlah menjadi anak yang pemberani seperti singa kecil.'],
            ],
            'banks'    => ['Bank BPD Bali'],
            'wishlist' => [
                ['Set Figur Hewan Safari', 'Bahan karet, aman untuk bayi', 160000, 'mainan'],
                ['Topi Penjelajah & Ransel Mini', 'Motif jerapah', 140000, 'pakaian'],
                ['Buku Sentuh Hewan', 'Buku bertekstur untuk bayi', 110000, 'buku'],
            ],
        ],
        'birthday_theme_09' => [
            'city'     => 'Padang',
            'child'    => ['Zahira Putri Andalas', 'Zahira', 2, 'P', 'Ilham Saputra', 'Desi Ratnasari'],
            'party'    => 'Kanal Kartun Ceria',
            'opening'  => 'Klik! Saluran TV berganti: kucing pahlawan, robot, alien… dan bintang hari ini, Zahira! Ayo nonton bareng keseruan ulang tahunnya yang ke-2.',
            'events'   => [[null, 'home', '16:00', '18:00']],
            'photo'    => 'child-09.jpg',
            'moments'  => [7, 8, 3, 5, 2, 13, 14, 4, 15],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Zahira lahir di Padang dan langsung menjadi bintang utama di rumah. Semua mata tertuju padanya!'],
                ['Penonton Setia', 1, 'Zahira selalu bergoyang setiap kali lagu pembuka kartun kesukaannya diputar. Remote TV pun sering ia kuasai.'],
                ['Ulang Tahun ke-2', 2, 'Tahun ini Zahira merayakan ulang tahun ke-2 dengan tema TV kartun jadul. Siapkan camilan, pertunjukan segera dimulai!'],
            ],
            'banks'    => ['Bank Nagari'],
            'wishlist' => [
                ['Robot Penari', 'Bisa menyala dan bernyanyi', 210000, 'mainan'],
                ['Buku Cerita Kucing Pahlawan', 'Buku papan tebal bergambar', 95000, 'buku'],
                ['Senter Proyektor Dongeng', 'Untuk cerita sebelum tidur', 175000, 'mainan'],
            ],
        ],
        'birthday_theme_10' => [
            'city'     => 'Jakarta',
            'child'    => ['Kirana Ayu Pratama', 'Kirana', 6, 'P', 'Arif Pratama', 'Dewi Lestari'],
            'party'    => 'Petualangan di Dunia Mainan',
            'opening'  => 'Hore! Kirana genap 6 tahun. Ayo ikut berpetualang di Dunia Mainan: bermain di panggung balok, meniup lilin di taman pesta, dan membuka kado ajaib bersama.',
            'events'   => [[null, 'hall', '15:00', '18:00']],
            'photo'    => 'child-08.jpg',
            'moments'  => [14, 5, 7, 2, 11, 3, 15, 1, 13],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Kirana lahir di Jakarta, disambut Ayah, Bunda, dan sekeranjang mainan dari para tante.'],
                ['Menara Balok Pertama', 2, 'Kirana menyusun menara balok pertamanya setinggi lututnya sendiri, lalu tertawa paling keras saat menara itu runtuh.'],
                ['Hari Pertama Sekolah', 4, 'Kirana berangkat ke TK membawa boneka beruang kesayangannya, berani dan penuh semangat.'],
                ['Ulang Tahun ke-6', 6, 'Tahun ini Kirana mengundang teman-teman menjelajahi Dunia Mainan untuk merayakan ulang tahunnya yang ke-6.'],
            ],
            'wishlist' => [
                ['Set Balok Konstruksi', 'Isi 300 keping', 450000, 'mainan'],
                ['Rumah Boneka Kayu', 'Lengkap dengan perabot mini', 750000, 'mainan'],
                ['Buku Aktivitas & Stiker', 'Untuk usia 5–7 tahun', 85000, 'buku'],
            ],
        ],
        'birthday_theme_11' => [
            'city'     => 'Bandung',
            'child'    => ['Bintang Arkana Putra', 'Bintang', 5, 'L', 'Teguh Prasetyo', 'Lestari Wulandari'],
            'party'    => 'Misi Luar Angkasa',
            'opening'  => '3… 2… 1… meluncur! Astronaut cilik kita, Bintang, genap 5 tahun. Bergabunglah dalam misi menjelajah planet dan bintang di pesta ulang tahunnya.',
            'events'   => [[null, 'home', '15:30', '18:00']],
            'photo'    => 'child-01.jpg',
            'moments'  => [2, 10, 6, 5, 12, 15, 1, 11, 3],
            'stories'  => [
                ['Bintang Kecil Lahir', 0, 'Ayah dan Bunda memberinya nama Bintang, berharap ia selalu bersinar ke mana pun melangkah.'],
                ['Roket Kardus', 3, 'Bintang dan Ayah membuat roket dari kardus bekas. Seharian penuh ia "terbang" keliling ruang tamu.'],
                ['Mengintip Langit', 4, 'Kunjungan ke Observatorium Bosscha di Lembang membuat Bintang jatuh cinta pada planet dan rasi bintang.'],
                ['Ulang Tahun ke-5', 5, 'Tahun ini Bintang merayakan ulang tahun ke-5 dengan misi luar angkasa. Kenakan helm astronautmu!'],
            ],
            'wishlist' => [
                ['Teleskop Anak', 'Pembesaran 60x, ringan dibawa', 650000, 'edukasi'],
                ['Proyektor Planetarium Mini', 'Menampilkan rasi bintang di langit-langit kamar', 280000, 'kamar'],
                ['Ensiklopedia Tata Surya', 'Untuk usia 5–8 tahun', 175000, 'buku'],
            ],
        ],
        'birthday_theme_12' => [
            'city'     => 'Makassar',
            'child'    => ['Nayla Samudra Putri', 'Nayla', 4, 'P', 'Yudha Pratama', 'Sekar Arum'],
            'party'    => 'Petualangan Bawah Laut',
            'opening'  => 'Blub, blub! Ikan-ikan dan terumbu karang warna-warni ikut merayakan ulang tahun Nayla yang ke-4. Yuk, menyelam bersama di pesta bawah laut!',
            'events'   => [[null, 'hall', '10:00', '12:30']],
            'photo'    => 'child-05.jpg',
            'moments'  => [3, 4, 2, 15, 13, 7, 11, 5, 1],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Nayla lahir di kota pesisir Makassar. Ayah memberinya nama tengah Samudra karena cintanya pada laut.'],
                ['Main Ombak Pertama', 2, 'Di Pantai Losari, Nayla pertama kali merasakan ombak menyentuh kakinya. Ia tertawa dan tak mau pulang.'],
                ['Belajar Berenang', 3, 'Dengan pelampung bergambar ikan badut, Nayla mulai belajar berenang dan kini berani menyelam sebentar.'],
                ['Ulang Tahun ke-4', 4, 'Tahun ini Nayla mengajak teman-teman berpetualang ke dunia bawah laut untuk merayakan ulang tahunnya yang ke-4.'],
            ],
            'wishlist' => [
                ['Set Mainan Mandi Hewan Laut', 'Isi 12 hewan, mengapung di air', 140000, 'mainan'],
                ['Pelampung Lengan Anak', 'Motif ikan badut', 120000, 'olahraga'],
                ['Ensiklopedia Laut Indonesia', 'Mengenal hewan laut Nusantara', 165000, 'buku'],
            ],
        ],
        'birthday_theme_13' => [
            'city'     => 'Yogyakarta',
            'child'    => ['Elvina Azzahra Putri', 'Elvina', 3, 'P', 'Doni Kurniawan', 'Mutiara Sari'],
            'party'    => 'Negeri Unicorn Ajaib',
            'opening'  => 'Kilau pelangi dan debu ajaib sudah ditaburkan! Elvina genap 3 tahun dan mengundangmu ke Negeri Unicorn yang penuh warna pastel.',
            'events'   => [[null, 'home', '15:30', '17:30']],
            'photo'    => 'child-09.jpg',
            'moments'  => [4, 13, 3, 8, 7, 10, 11, 2, 1],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Elvina lahir di Yogyakarta pada pagi berkabut yang lembut, membawa keajaiban kecil bagi keluarga kami.'],
                ['Unicorn Pertama', 2, 'Boneka unicorn berwarna lilac menjadi sahabat Elvina. Ia menamainya Pelangi dan selalu mengajaknya bercerita.'],
                ['Ulang Tahun ke-3', 3, 'Tahun ini Elvina merayakan ulang tahun ke-3 di Negeri Unicorn. Jangan lupa membawa kilau terbaikmu!'],
            ],
            'wishlist' => [
                ['Bando Tanduk Unicorn', 'Dengan pita pastel berkilau', 75000, 'aksesori'],
                ['Kuda Goyang Unicorn', 'Boneka lembut untuk usia 1–4 tahun', 480000, 'mainan'],
                ['Buku Mewarnai Unicorn', 'Lengkap dengan krayon', 65000, 'buku'],
            ],
        ],
        'birthday_theme_14' => [
            'city'     => 'Surabaya',
            'child'    => ['Gibran Raffasya Ramadhan', 'Gibran', 4, 'L', 'Hafidz Ramadhan', 'Salsabila Amanda'],
            'party'    => 'Ekspedisi Dinosaurus',
            'opening'  => 'RAWRR! Gibran genap 4 tahun dan mengajak para penjelajah cilik berekspedisi ke hutan purba. Hati-hati, ada dinosaurus di balik pepohonan!',
            'events'   => [[null, 'home', '15:30', '18:00']],
            'photo'    => 'child-06.jpg',
            'moments'  => [14, 5, 1, 15, 6, 11, 2, 3, 7],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Gibran lahir di Surabaya dengan tangis yang lantang, seperti raungan T-Rex kecil.'],
                ['Raungan Pertama', 2, 'Boneka T-Rex hijau menjadi teman main Gibran. Setiap pagi ia membangunkan Ayah dengan raungan khasnya.'],
                ['Bertemu Fosil Sungguhan', 3, 'Di Museum Geologi Bandung, Gibran terpana melihat fosil gajah purba yang jauh lebih besar dari mobil Ayah.'],
                ['Ulang Tahun ke-4', 4, 'Kini Gibran merayakan ulang tahun ke-4 dengan ekspedisi dinosaurus. Siapkan topi penjelajah dan kaca pembesarmu!'],
            ],
            'wishlist' => [
                ['Set Figur Dinosaurus', 'Isi 12 jenis dinosaurus', 220000, 'mainan'],
                ['Kit Penggalian Fosil', 'Gali dan temukan kerangka dinosaurus', 180000, 'edukasi'],
                ['Ensiklopedia Dinosaurus Anak', 'Penuh gambar dan fakta seru', 150000, 'buku'],
            ],
        ],
        'birthday_theme_15' => [
            'city'     => 'Semarang',
            'child'    => ['Adinda Ratu Kirana', 'Adinda', 5, 'P', 'Bagus Santoso', 'Ratna Wijayanti'],
            'party'    => 'Pesta Istana Kerajaan',
            'opening'  => 'Dengan hormat, Tuan Putri Adinda mengundang para tamu kerajaan ke pesta ulang tahunnya yang ke-5. Gerbang istana akan dibuka untukmu!',
            'events'   => [[null, 'hall', '15:00', '17:30']],
            'photo'    => 'child-02.jpg',
            'moments'  => [8, 7, 4, 11, 3, 13, 10, 1, 12],
            'stories'  => [
                ['Putri Kecil Lahir', 0, 'Adinda lahir di Semarang dan langsung menjadi putri kecil kesayangan seluruh keluarga.'],
                ['Mahkota Pertama', 3, 'Nenek memberi Adinda mahkota mainan berkilau. Sejak itu, setiap sore adalah jamuan teh kerajaan bersama boneka-bonekanya.'],
                ['Pentas Tari Pertama', 4, 'Adinda menari di pentas TK dengan gaun merah muda dan senyum percaya diri layaknya seorang putri.'],
                ['Ulang Tahun ke-5', 5, 'Tahun ini Adinda merayakan ulang tahun ke-5 dengan pesta istana kerajaan. Kenakan pakaian terbaikmu, ya!'],
            ],
            'wishlist' => [
                ['Gaun Putri & Mahkota', 'Ukuran 5–6 tahun', 300000, 'pakaian'],
                ['Set Minum Teh Mainan', 'Keramik mini isi 12', 190000, 'mainan'],
                ['Buku Dongeng Klasik', 'Edisi bergambar', 160000, 'buku'],
            ],
        ],
        'birthday_theme_16' => [
            'city'     => 'Malang',
            'child'    => ['Kiara Azalea Putri', 'Kiara', 2, 'P', 'Galang Mahendra', 'Putri Anggraini'],
            'party'    => 'Negeri Permen Manis',
            'opening'  => 'Ada lolipop, permen kapas, dan cupcake merah muda! Kiara genap 2 tahun dan mengundangmu berkunjung ke Negeri Permen yang serba manis.',
            'events'   => [[null, 'home', '15:30', '17:30']],
            'photo'    => 'child-04.jpg',
            'moments'  => [13, 3, 4, 7, 8, 15, 2, 11, 5],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Kiara lahir di Malang, semanis permen kapas yang dijual di sekitar Alun-Alun Tugu.'],
                ['Gigi Pertama', 1, 'Gigi susu pertama Kiara tumbuh tepat di hari ulang tahun Bunda. Senyumnya jadi makin manis!'],
                ['Ulang Tahun ke-2', 2, 'Tahun ini Kiara merayakan ulang tahun ke-2 di Negeri Permen Manis. Siap-siap untuk banyak kejutan manis!'],
            ],
            'wishlist' => [
                ['Set Masak-masakan Kue', 'Mainan dapur mini', 210000, 'mainan'],
                ['Tas Ransel Mini Lolipop', 'Motif permen warna-warni', 130000, 'aksesori'],
                ['Buku Lagu Bergambar', 'Dengan tombol suara', 140000, 'buku'],
            ],
        ],
        'birthday_theme_17' => [
            'city'     => 'Medan',
            'child'    => ['Abimanyu Rimba Pratama', 'Abi', 3, 'L', 'Anton Wicaksana', 'Tari Kusumastuti'],
            'party'    => 'Petualangan Hutan Rimba',
            'opening'  => 'Gajah, harimau, dan orangutan sudah menunggu di hutan rimba! Abi genap 3 tahun dan mengajak teman-teman berpetualang bersama hewan-hewan lucu.',
            'events'   => [[null, 'home', '15:30', '18:00']],
            'photo'    => 'child-01.jpg',
            'moments'  => [15, 5, 1, 14, 11, 2, 3, 6, 7],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Abi lahir di Medan. Ayah memberinya nama tengah Rimba, berharap ia tumbuh kuat dan bebas seperti hutan Sumatra.'],
                ['Sahabat Hutan', 2, 'Abi pertama kali melihat orangutan di Bukit Lawang dan terus menirukan gaya bergelantungannya sepanjang jalan pulang.'],
                ['Ulang Tahun ke-3', 3, 'Kini Abi merayakan ulang tahun ke-3 dengan petualangan hutan rimba. Ayo bergabung dengan rombongan penjelajah!'],
            ],
            'wishlist' => [
                ['Boneka Orangutan', 'Bulu lembut, 35 cm', 170000, 'mainan'],
                ['Teropong Anak', 'Untuk mengamati burung dan hewan', 120000, 'edukasi'],
                ['Buku Hewan Hutan Sumatra', 'Buku papan bergambar', 110000, 'buku'],
            ],
        ],
        'birthday_theme_18' => [
            'city'     => 'Bandung',
            'child'    => ['Daffa Arkan Maulana', 'Daffa', 8, 'L', 'Irfan Maulana', 'Nur Aisyah'],
            'party'    => 'Piala Si Jagoan Kecil',
            'opening'  => 'Peluit sudah ditiup, bola siap ditendang! Daffa genap 8 tahun dan mengajak teman-teman bertanding di lapangan pesta. Ayo cetak gol kebahagiaan bersama!',
            'events'   => [[null, 'home', '15:30', '18:00']],
            'photo'    => 'child-07.jpg',
            'moments'  => [5, 15, 2, 6, 11, 3, 14, 1, 7],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Daffa lahir di Bandung bertepatan dengan malam final sepak bola. Sejak hari itu, sorakan paling meriah di rumah selalu untuk Daffa.'],
                ['Tendangan Pertama', 2, 'Belum lancar berlari, Daffa sudah menendang bola plastik sampai memecahkan pot bunga Bunda. Untungnya Bunda tidak marah!'],
                ['Sekolah Sepak Bola', 6, 'Daffa bergabung dengan sekolah sepak bola di dekat rumah dan berlatih setiap Sabtu pagi tanpa pernah absen.'],
                ['Gol Pertama di Turnamen', 7, 'Di turnamen antarsekolah, Daffa mencetak gol pertamanya. Seluruh keluarga ikut bersorak di pinggir lapangan!'],
                ['Ulang Tahun ke-8', 8, 'Tahun ini Daffa merayakan ulang tahun ke-8 dengan tema sepak bola. Kenakan jersey favoritmu, ya!'],
            ],
            'wishlist' => [
                ['Bola Sepak Ukuran 4', 'Untuk usia 8–12 tahun', 250000, 'olahraga'],
                ['Sepatu Futsal Anak', 'Ukuran 33', 380000, 'olahraga'],
                ['Jersey dengan Nama', 'Sablon nama dan nomor punggung', 225000, 'pakaian'],
            ],
        ],
        'birthday_theme_19' => [
            'city'     => 'Yogyakarta',
            'child'    => ['Kanaya Pelangi Putri', 'Kanaya', 6, 'P', 'Wahyu Hidayat', 'Indah Permatasari'],
            'party'    => 'Pesta Cat Warna-warni',
            'opening'  => 'Siapkan kuas dan celemekmu! Kanaya genap 6 tahun dan mengajak teman-teman berkreasi dengan cat warna-warni di pesta paling ceria tahun ini.',
            'events'   => [[null, 'home', '09:30', '12:00']],
            'photo'    => 'child-08.jpg',
            'moments'  => [5, 2, 7, 3, 15, 4, 11, 13, 1],
            'stories'  => [
                ['Hari Pertama di Dunia', 0, 'Kanaya lahir di Yogyakarta, kota seni yang kelak menjadi tempatnya belajar mengenal warna.'],
                ['Coretan Pertama', 2, 'Dinding kamar menjadi kanvas pertama Kanaya. Ayah memutuskan tidak mengecatnya ulang karena gambarnya terlalu indah.'],
                ['Pameran Kecil', 5, 'Lukisan Kanaya tentang keluarga kami dipajang di pameran karya anak di sebuah galeri seni di Yogyakarta.'],
                ['Ulang Tahun ke-6', 6, 'Tahun ini Kanaya merayakan ulang tahun ke-6 dengan pesta cat warna-warni. Jangan takut kotor, ya!'],
            ],
            'wishlist' => [
                ['Set Cat Air & Kuas', 'Isi 24 warna', 150000, 'alat lukis'],
                ['Easel Kayu Anak', 'Dua sisi: papan tulis dan kanvas', 420000, 'alat lukis'],
                ['Celemek Lukis dengan Nama', 'Bahan tahan air', 95000, 'pakaian'],
            ],
        ],
        'birthday_theme_20' => [
            'city'            => 'Jakarta',
            'child'           => ['Alya Rahmania Putri', 'Alya', 16, 'P', 'Ardiansyah Putra', 'Melinda Kusuma'],
            'party'           => 'Sweet Sixteen Rose Gold',
            'opening'         => 'Enam belas tahun penuh cerita, tawa, dan mimpi. Dengan penuh sukacita, Alya mengundangmu ke malam Sweet Sixteen bernuansa rose gold.',
            'greeting'        => 'Dengan penuh sukacita, kami mengundang Anda untuk merayakan Sweet Sixteen Alya.',
            'countdown_label' => 'Menuju Sweet Sixteen',
            'events'          => [
                ['Syukuran & Doa Bersama', 'home', '16:00', '17:30'],
                ['Sweet Sixteen Party', 'hall', '19:00', '22:00', 'countdown' => true],
            ],
            'weekday'         => Carbon::SATURDAY,
            'photo'           => 'moment-09.jpg',
            'moments'         => [11, 12, 4, 7, 13, 1, 10, 6, 3],
            'stories'         => [
                ['Hari Pertama di Dunia', 0, 'Alya lahir di Jakarta sebagai anak pertama yang dinanti-nantikan seluruh keluarga.'],
                ['Kelas Balet Pertama', 5, 'Dengan tutu merah muda, Alya mengikuti kelas balet pertamanya dan langsung jatuh cinta pada panggung.'],
                ['Juara Olimpiade Sains', 14, 'Alya meraih medali perak olimpiade sains tingkat provinsi. Kerja kerasnya terbayar manis.'],
                ['Sweet Sixteen', 16, 'Kini Alya genap 16 tahun. Kami ingin merayakan babak baru ini bersama orang-orang tersayang.'],
            ],
            'wishes'          => [
                ['Geng Kelas XI IPA 2', 'Happy sweet sixteen, Alya! Makin bersinar, makin baik hati, dan tetap jadi sahabat terbaik kami 💗'],
                ['Tante Sarah & Keluarga', 'Selamat ulang tahun ke-16, sayang. Semoga semua cita-citamu tercapai dan selalu dalam lindungan Allah.'],
                ['Dimas (Sepupu)', 'Selamat datang di usia 16, Alya! Jangan lupa traktirannya, ya 😄'],
                ['Bu Wening, Wali Kelas', 'Selamat ulang tahun, Alya. Terus menjadi pribadi yang rendah hati dan semangat belajar.'],
                ['Kakek & Nenek', 'Doa terbaik untuk cucu tersayang. Sehat selalu, panjang umur, dan bahagia dunia akhirat.'],
            ],
            'wishlist'        => [
                ['Kamera Instan', 'Warna blush pink', 1100000, 'elektronik'],
                ['Kalung Inisial Rose Gold', 'Perak 925 berlapis rose gold', 450000, 'aksesori'],
                ['Novel Klasik Edisi Koleksi', 'Set tiga judul', 380000, 'buku'],
            ],
        ],
    ];

    /** Baby photo that opens every story ("Hari Pertama di Dunia"). */
    private const BABY_PHOTO = ['L' => 'child-03.jpg', 'P' => 'child-04.jpg'];

    private const GALLERY_MOMENTS = 7;

    /** @return array<int, string> */
    public static function slugs(): array
    {
        return array_keys(self::THEMES);
    }

    /** Sample content for $slug, or null when the theme has no curated entry. */
    public static function build(?string $slug, Carbon $today): ?array
    {
        $t = self::THEMES[$slug] ?? null;
        if ($t === null) {
            return null;
        }

        $n = (int) substr($slug, -2);
        [$name, $nick, $age, $gender, $father, $mother] = $t['child'];
        $date = SampleInvitationData::eventDate($today, $n, $t['weekday'] ?? Carbon::SUNDAY);
        $birthYear = $date->year - $age;
        $home = $t['home'] ?? "Kediaman Keluarga {$father}";
        $single = count($t['events']) === 1;

        return [
            'city'   => $t['city'],
            'fields' => [
                'child_name'      => $name,
                'child_nickname'  => $nick,
                'child_age'       => (string) $age,
                'birthday_date'   => $date->toDateString(),
                'party_theme'     => $t['party'],
                'father_name'     => $father,
                'mother_name'     => $mother,
                'opening_message' => $t['opening'],
            ],
            'photos'    => ['child_photo' => 'child'],
            'photo_set' => self::photoSet($t, $gender),
            'json'      => [],
            'events'    => array_map(fn ($e) => [
                'name'      => $e[0] ?? "Pesta Ulang Tahun {$nick}",
                'date'      => $date->copy(),
                'time'      => "{$e[2]}:00",
                'time_end'  => "{$e[3]}:00",
                'venue'     => SampleInvitationData::venue($t['city'], $e[1], $home),
                'countdown' => $e['countdown'] ?? $single,
            ], $t['events']),
            'stories' => array_map(fn ($s) => [
                'title'   => $s[0],
                'period'  => (string) ($birthYear + $s[1]),
                'content' => $s[2],
            ], $t['stories']),
            'wishes'   => isset($t['wishes'])
                ? array_map(fn ($w) => ['name' => $w[0], 'message' => $w[1]], $t['wishes'])
                : SampleInvitationData::wishes('birthday', $n, $nick),
            'wishlist' => array_map(fn ($w) => [
                'name'        => $w[0],
                'description' => $w[1],
                'price'       => $w[2],
                'category'    => $w[3],
            ], $t['wishlist']),
            'greeting'        => $t['greeting'] ?? "Dengan penuh sukacita, kami mengundang kamu untuk merayakan ulang tahun {$nick} yang ke-{$age}.",
            'countdown_label' => $t['countdown_label'] ?? 'Menuju Pesta',
            'account_name'    => $father,
            'banks'           => $t['banks'] ?? null,
        ];
    }

    /**
     * Photos from the shared birthday/ pool (SampleInvitationSeeder::photoSet):
     * the profile photo plus the first moments fill the gallery; a baby photo
     * opens the story and the remaining moments follow.
     */
    private static function photoSet(array $t, string $gender): array
    {
        $moments = array_map(fn (int $m) => sprintf('moment-%02d.jpg', $m), $t['moments']);

        $story = [self::BABY_PHOTO[$gender]];
        for ($i = 1; $i < count($t['stories']); $i++) {
            $story[] = $moments[(self::GALLERY_MOMENTS - 1 + $i) % count($moments)];
        }

        return [
            'folder'  => 'birthday',
            'child'   => $t['photo'],
            'gallery' => [$t['photo'], ...array_slice($moments, 0, self::GALLERY_MOMENTS)],
            'story'   => $story,
        ];
    }
}

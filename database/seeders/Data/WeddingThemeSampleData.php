<?php

namespace Database\Seeders\Data;

use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Curated demo content for wedding_theme_13 … wedding_theme_30: one couple per
 * theme, with a city, palette, quote, events and love story that fit the
 * theme's mood (13 is Sundanese, 16 a beach wedding, 18 an evening gala…).
 *
 * build() returns the same shape as SampleInvitationData's wedding() and is
 * used by both SampleInvitationSeeder (full run) and WeddingThemeSampleSeeder
 * (only these themes). Themes 21–30 have no design yet, so their entries lean
 * on regional customs rather than a visual style.
 */
class WeddingThemeSampleData
{
    /**
     * person: [full name, nickname, father, mother, child order, "Seorang …" bio]
     * events: [name, venue kind (mosque|hall|home), start, end] + optional
     *         'day' (offset from the wedding day) and 'countdown'.
     * stories: [title, year offset from the wedding year, content]
     */
    private const THEMES = [
        'wedding_theme_13' => [
            'city'   => 'Bandung',
            'groom'  => ['Galih Rakasiwi Permana', 'Galih', 'H. Ujang Sopandi', 'Hj. Imas Masitoh', 1, 'arsitek yang gemar memainkan kacapi di waktu luang'],
            'bride'  => ['Kania Rengganis Dewi', 'Kania', 'Asep Rahmat Hidayat', 'Euis Rosmiati', 2, 'pengajar tari jaipong di sanggar milik keluarga'],
            'quote'  => 'Sareundeuk saigel, sabobot sapihanéan, sabata sarimbangan. (Seia sekata, sehidup semati dalam suka dan duka.)',
            'colors' => [['Sogan', '#6B4226'], ['Emas', '#C9A84C'], ['Putih Gading', '#F5F0E1']],
            'events' => [
                ['Akad Nikah', 'mosque', '08:00', '09:30', 'countdown' => true],
                ['Upacara Adat Sawer & Nincak Endog', 'hall', '10:00', '11:00'],
                ['Resepsi', 'hall', '11:00', '14:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -6, 'Galih dan Kania pertama kali bertemu di unit kesenian Sunda kampus. Galih memainkan kacapi, Kania menari jaipong di pentas yang sama.'],
                ['Mulai Dekat', -4, 'Obrolan sepulang latihan berlanjut ke secangkir kopi di Jalan Braga. Sejak itu, setiap akhir pekan selalu ada cerita baru.'],
                ['Narosan', -1, 'Keluarga Galih datang ke rumah Kania untuk narosan. Dengan restu kedua keluarga, hari pernikahan pun ditetapkan.'],
                ['Menuju Hari Bahagia', 0, 'Kini kami siap melangkah bersama. Mohon doa restu agar rumah tangga kami sakinah, mawaddah, warahmah.'],
            ],
        ],
        'wedding_theme_14' => [
            'city'   => 'Yogyakarta',
            'groom'  => ['Bima Aryasatya', 'Bima', 'Ir. Prakoso Hadi', 'Retno Palupi', 2, 'perajin furnitur kayu daur ulang'],
            'bride'  => ['Sekar Ayu Larasati', 'Sekar', 'Darmanto', 'Sri Rahayu', 1, 'ilustrator lepas yang mencintai tanaman'],
            'quote'  => 'Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat kebesaran Allah. (QS. Adz-Dzariyat: 49)',
            'colors' => [['Sogan', '#5F3B27'], ['Emas', '#B58A45'], ['Gading', '#F2E6CC']],
            'events' => [
                ['Akad Nikah', 'home', '08:00', '09:30', 'countdown' => true],
                ['Panggih & Resepsi', 'hall', '11:00', '14:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -5, 'Bima dan Sekar bertemu di sebuah lokakarya keramik di Kasongan. Vas buatan Bima retak, dan Sekar menawarkan bantuan sambil tertawa.'],
                ['Perjalanan Pertama', -3, 'Menyusuri pantai selatan Gunungkidul membuat kami sadar: kami nyaman menghabiskan waktu berdua, bahkan dalam diam.'],
                ['Lamaran', -1, 'Di bawah pohon beringin halaman rumah eyang, Bima melamar Sekar disaksikan kedua keluarga.'],
                ['Menuju Halal', 0, 'Kami memilih merayakan hari bahagia secara sederhana dan hangat, dikelilingi orang-orang tercinta.'],
            ],
        ],
        'wedding_theme_15' => [
            'city'   => 'Malang',
            'groom'  => ['Satya Dharma Wicaksana', 'Satya', 'Drs. Wicaksono', 'Tri Utami', 1, 'kurator museum yang gemar mengoleksi piringan hitam'],
            'bride'  => ['Ratri Kusumawardhani', 'Ratri', 'Hadi Kusumo', 'Endah Purwaningsih', 3, 'penulis lepas dan pencinta buku antik'],
            'quote'  => 'Aku ingin mencintaimu dengan sederhana: dengan kata yang tak sempat diucapkan kayu kepada api yang menjadikannya abu. (Sapardi Djoko Damono)',
            'colors' => [['Lavender', '#8580B7'], ['Blush', '#F2C5D2'], ['Sage', '#A6C5A4']],
            'stories' => [
                ['Surat Pertama', -7, 'Satya dan Ratri berkenalan lewat komunitas sahabat pena pencinta buku antik. Surat pertama Satya masih Ratri simpan di kotak kayu.'],
                ['Kencan di Kayutangan', -5, 'Pertemuan pertama kami di kawasan heritage Kayutangan. Dua cangkir kopi tubruk menemani obrolan hingga senja.'],
                ['Lamaran', -1, 'Satya datang membawa cincin peninggalan neneknya. Ratri menjawab "ya" tanpa ragu.'],
                ['Menuju Halal', 0, 'Kami percaya cinta yang sederhana adalah yang paling abadi. Mohon doa restu untuk langkah kami.'],
            ],
        ],
        'wedding_theme_16' => [
            'city'   => 'Denpasar',
            'groom'  => ['Bayu Samudra Wiratama', 'Bayu', 'Wiratama Putra', 'Nur Laila', 1, 'instruktur selam bersertifikat internasional'],
            'bride'  => ['Kinanti Maharani Putri', 'Kinanti', 'H. Syamsul Arifin', 'Hj. Dewi Sartika', 2, 'fotografer lepas yang jatuh cinta pada laut'],
            'quote'  => 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. (QS. Ar-Rum: 21)',
            'colors' => [['Ocean Blue', '#0369A1'], ['Sky Blue', '#BAE6FD'], ['Pearl White', '#F8FAFC']],
            'events' => [
                ['Akad Nikah', 'mosque', '09:00', '10:30', 'countdown' => true],
                ['Sunset Reception', 'hall', '16:00', '19:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -4, 'Bayu bertemu Kinanti yang baru pertama kali menyelam di Amed. Kinanti panik, Bayu dengan sabar menuntunnya kembali ke permukaan.'],
                ['Senja di Jimbaran', -3, 'Kencan pertama ditutup dengan senja di Jimbaran. Sejak hari itu, laut selalu menjadi tempat favorit kami.'],
                ['Lamaran', -1, 'Di tepi pantai Nusa Dua, Bayu berlutut dengan cincin di tangan tepat saat matahari tenggelam.'],
                ['Menuju Halal', 0, 'Kami ingin memulai hidup baru diiringi debur ombak dan doa restu dari Anda.'],
            ],
        ],
        'wedding_theme_17' => [
            'city'   => 'Semarang',
            'groom'  => ['Dafa Mahardika', 'Dafa', 'Mahardi Susanto', 'Siti Khotimah', 2, 'ahli agronomi yang betah berlama-lama di kebun'],
            'bride'  => ['Kamila Puspitasari', 'Kamila', 'H. Bambang Sudarsono', 'Hj. Sri Wahyuningsih', 1, 'florist yang merangkai bunga sejak SMA'],
            'quote'  => 'Mahasuci (Allah) yang telah menciptakan semuanya berpasang-pasangan, baik dari apa yang ditumbuhkan oleh bumi dan dari diri mereka sendiri, maupun dari apa yang tidak mereka ketahui. (QS. Yasin: 36)',
            'colors' => [['Leaf Green', '#4D7C3A'], ['Blossom Pink', '#F8D7E3'], ['Ivory', '#FFFFF0']],
            'stories' => [
                ['Pertama Bertemu', -5, 'Dafa dan Kamila bertemu sebagai relawan penghijauan kota Semarang. Mereka menanam pohon di petak yang bersebelahan.'],
                ['Mulai Dekat', -3, 'Kamila mengajari Dafa merawat anggrek. Dafa mengajari Kamila sabar menunggu bunga mekar.'],
                ['Lamaran', -1, 'Dafa melamar Kamila dengan buket mawar merah muda yang dirangkainya sendiri, meski tak serapi buatan Kamila.'],
                ['Menuju Halal', 0, 'Seperti taman yang dirawat setiap hari, kami ingin menumbuhkan cinta ini bersama. Mohon doa restu.'],
            ],
        ],
        'wedding_theme_18' => [
            'city'   => 'Jakarta',
            'groom'  => ['Muhammad Aryasatya Pradipta', 'Arya', 'H. Pradipta Wiranata', 'Hj. Ayu Kartikasari', 1, 'investment banker yang hobi bermain piano'],
            'bride'  => ['Kayla Adinda Prameswari', 'Kayla', 'Dr. Ir. Adi Prameswara', 'Larasati Wulandari', 1, 'arsitek interior lulusan London'],
            'quote'  => 'Dan Allah menjadikan bagimu pasangan (suami atau istri) dari jenis kamu sendiri dan menjadikan anak dan cucu bagimu dari pasanganmu, serta memberimu rezeki dari yang baik. (QS. An-Nahl: 72)',
            'colors' => [['Champagne', '#F7E7CE'], ['Gold', '#C8A45C'], ['Black', '#1C1C1C']],
            'events' => [
                ['Akad Nikah', 'mosque', '08:00', '10:00', 'countdown' => true],
                ['Resepsi', 'hall', '19:00', '21:30'],
            ],
            'stories' => [
                ['Pertama Bertemu', -5, 'Arya dan Kayla dipertemukan di sebuah gala dinner amal di Jakarta. Mereka duduk semeja karena kartu nama yang salah tulis.'],
                ['Jarak Jauh', -3, 'Kayla melanjutkan studi magister di London. Ribuan kilometer dan perbedaan waktu tak membuat kami saling melepaskan.'],
                ['Lamaran', -1, 'Sepulang Kayla ke tanah air, Arya melamar di hadapan kedua keluarga besar dalam acara yang khidmat.'],
                ['Menuju Halal', 0, 'Dengan penuh syukur, kami mengundang Anda menjadi saksi awal perjalanan kami sebagai suami istri.'],
            ],
        ],
        'wedding_theme_19' => [
            'city'   => 'Bandung',
            'groom'  => ['Galang Pambudi', 'Galang', 'Dedi Supriadi', 'Nining Kurniasih', 3, 'polisi hutan yang menjaga kawasan konservasi Jawa Barat'],
            'bride'  => ['Lintang Ayu Prameswari', 'Lintang', 'H. Wawan Setiawan', 'Hj. Rina Marlina', 1, 'dokter hewan yang aktif di komunitas pecinta alam'],
            'quote'  => 'Dan nikahkanlah orang-orang yang masih membujang di antara kamu. Jika mereka miskin, Allah akan memberi kemampuan kepada mereka dengan karunia-Nya. (QS. An-Nur: 32)',
            'colors' => [['Forest Green', '#22432B'], ['Moss', '#6B7F4E'], ['Cream', '#EEE7D8']],
            'stories' => [
                ['Pertama Bertemu', -6, 'Galang dan Lintang bertemu dalam pendakian ke Gunung Papandayan. Lintang kehabisan air, Galang berbagi botol minumnya.'],
                ['Mulai Dekat', -4, 'Dari satu pendakian ke pendakian berikutnya, kami belajar bahwa perjalanan terasa ringan bila dijalani bersama.'],
                ['Lamaran', -1, 'Di tengah hutan pinus Lembang, Galang melamar Lintang ditemani kabut pagi dan kicau burung.'],
                ['Menuju Halal', 0, 'Kini kami siap mendaki perjalanan terpanjang: kehidupan berumah tangga. Mohon doa restu.'],
            ],
        ],
        'wedding_theme_20' => [
            'city'   => 'Surabaya',
            'groom'  => ['Haikal Fikri Ramadhan', 'Haikal', 'H. Fikri Abdullah', 'Hj. Ramlah', 2, 'insinyur robotika yang pernah bekerja di Osaka'],
            'bride'  => ['Hana Kirania Putri', 'Hana', 'Kiran Santoso', 'Yuni Astuti', 1, 'penerjemah bahasa Jepang dan pencinta origami'],
            'quote'  => 'Seperti sakura yang mekar tepat pada musimnya, cinta kami tumbuh di waktu yang telah Allah tetapkan.',
            'colors' => [['Sakura Pink', '#E895B3'], ['Blush', '#FFF5F8'], ['Plum', '#8E4162']],
            'stories' => [
                ['Pertama Bertemu', -5, 'Haikal dan Hana bertemu di kelas bahasa Jepang. Mereka satu kelompok saat ujian percakapan dan sama-sama gugup.'],
                ['Hanami', -3, 'Mendapat beasiswa ke Jepang di tahun yang sama, kami menikmati hanami pertama di bawah pohon sakura Taman Ueno.'],
                ['Lamaran', -1, 'Kembali ke Surabaya, Haikal melamar Hana bersama keluarga dengan seserahan bernuansa merah muda.'],
                ['Menuju Halal', 0, 'Mohon doa restu agar cinta kami terus bermekaran setiap musimnya.'],
            ],
        ],
        'wedding_theme_21' => [
            'city'   => 'Padang',
            'groom'  => ['Fikri Aulia Rahman', 'Fikri', 'H. Syafrizal', 'Hj. Ernawati', 1, 'pengusaha rumah makan Minang di perantauan'],
            'bride'  => ['Rahmi Annisa Putri', 'Rahmi', 'Drs. Yuliardi', 'Desmawati', 2, 'dosen ekonomi syariah'],
            'quote'  => 'Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati, dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa. (QS. Al-Furqan: 74)',
            'colors' => [['Merah Marun', '#7A0C2E'], ['Emas', '#C9A84C'], ['Hitam', '#1C1917']],
            'events' => [
                ['Malam Bainai', 'home', '19:30', '21:30', 'day' => -1],
                ['Akad Nikah', 'mosque', '08:00', '09:30', 'countdown' => true],
                ['Baralek (Resepsi)', 'hall', '11:00', '15:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -6, 'Fikri dan Rahmi bertemu di perantauan, dalam acara ikatan keluarga Minang di Jakarta.'],
                ['Pulang Basamo', -3, 'Lebaran membawa kami pulang ke Padang bersama. Ternyata rumah orang tua kami hanya berjarak dua nagari.'],
                ['Maminang', -1, 'Sesuai adat Minangkabau, keluarga Rahmi datang maminang ke rumah keluarga Fikri, dan pinangan itu diterima dengan haru.'],
                ['Menuju Halal', 0, 'Dengan restu niniak mamak dan kedua orang tua, kami siap melangkah bersama.'],
            ],
        ],
        'wedding_theme_22' => [
            'city'   => 'Makassar',
            'groom'  => ['Andi Muhammad Fauzan', 'Fauzan', 'H. Andi Baso Amir', 'Hj. Andi Rosmiati', 2, 'insinyur perkapalan di Pelabuhan Makassar'],
            'bride'  => ['Nurul Izzah Ramadhani', 'Izzah', 'Ir. H. Syamsuddin', 'Hj. Nurhaedah', 1, 'apoteker di rumah sakit daerah'],
            'quote'  => 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya. (QS. Ar-Rum: 21)',
            'colors' => [['Hijau Botol', '#0B5345'], ['Emas', '#D4AF37'], ['Merah Bata', '#A93226']],
            'events' => [
                ['Mappacci', 'home', '19:30', '21:30', 'day' => -1],
                ['Akad Nikah', 'mosque', '09:00', '10:30', 'countdown' => true],
                ['Resepsi', 'hall', '12:00', '15:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -5, 'Fauzan dan Izzah satu angkatan di Universitas Hasanuddin. Awalnya hanya rekan diskusi di perpustakaan.'],
                ['Senja di Losari', -3, 'Senja di Pantai Losari menjadi saksi obrolan panjang kami tentang mimpi dan masa depan.'],
                ['Madduta', -1, 'Keluarga Fauzan datang madduta, dan kedua keluarga sepakat menetapkan hari baik pernikahan.'],
                ['Menuju Halal', 0, 'Mohon doa restu agar bahtera rumah tangga kami berlayar dengan tenang.'],
            ],
        ],
        'wedding_theme_23' => [
            'city'   => 'Medan',
            'groom'  => ['Rizki Hamonangan Nasution', 'Rizki', 'H. Parlindungan Nasution', 'Hj. Masdelina Lubis', 1, 'auditor di sebuah BUMN perkebunan'],
            'bride'  => ['Siti Hafsah Harahap', 'Hafsah', 'Drs. Sahrul Harahap', 'Nur Aini Siregar', 2, 'guru bahasa Inggris yang gemar memasak'],
            'quote'  => 'Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat kebesaran Allah. (QS. Adz-Dzariyat: 49)',
            'colors' => [['Navy', '#1B2A4A'], ['Silver', '#C7CCD6'], ['White', '#FFFFFF']],
            'stories' => [
                ['Pertama Bertemu', -5, 'Rizki dan Hafsah bertemu di pengajian remaja Masjid Raya Al-Mashun.'],
                ['Mulai Dekat', -3, 'Kesamaan hobi kuliner membuat kami menjelajah Medan, dari soto hingga durian.'],
                ['Lamaran', -1, 'Keluarga besar Nasution datang melamar ke keluarga Harahap dengan penuh suka cita.'],
                ['Menuju Halal', 0, 'Kini kami memantapkan hati untuk melangkah bersama. Mohon doa restu dari Bapak/Ibu/Saudara/i.'],
            ],
        ],
        'wedding_theme_24' => [
            'city'   => 'Banda Aceh',
            'groom'  => ['Teuku Fadhlan Akbar', 'Fadhlan', 'T. Zulfikar', 'Cut Rahmawati', 2, 'hafiz Al-Qur\'an dan pengajar di dayah'],
            'bride'  => ['Cut Farah Nabila', 'Farah', 'Teuku Ramli', 'Cut Asmaul Husna', 1, 'bidan di puskesmas kota'],
            'quote'  => 'Dan nikahkanlah orang-orang yang masih membujang di antara kamu. Jika mereka miskin, Allah akan memberi kemampuan kepada mereka dengan karunia-Nya. (QS. An-Nur: 32)',
            'colors' => [['Emerald', '#047857'], ['Gold', '#D4AF37'], ['Cream', '#FEF3C7']],
            'events' => [
                ['Akad Nikah', 'mosque', '08:30', '10:00', 'countdown' => true],
                ['Peusijuek & Resepsi', 'hall', '11:00', '14:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -6, 'Fadhlan dan Farah pertama kali bertemu di Museum Tsunami Aceh saat sama-sama menjadi pemandu relawan.'],
                ['Mulai Dekat', -4, 'Secangkir kopi sanger di Ulee Kareng menjadi saksi banyak percakapan kami.'],
                ['Ba Ranub', -1, 'Keluarga Fadhlan datang membawa ranub sebagai tanda lamaran, dan diterima dengan penuh syukur.'],
                ['Menuju Halal', 0, 'Mohon doa restu agar kami menjadi keluarga yang sakinah, mawaddah, warahmah.'],
            ],
        ],
        'wedding_theme_25' => [
            'city'   => 'Surabaya',
            'groom'  => ['Wahyu Adi Saputra', 'Wahyu', 'Suprapto', 'Kasiyati', 3, 'analis data di sebuah perusahaan logistik'],
            'bride'  => ['Fitria Nur Laili', 'Fitria', 'H. Mochammad Ali', 'Hj. Siti Fatimah', 2, 'akuntan yang hobi membuat kue'],
            'quote'  => 'Maka nikmat Tuhanmu yang manakah yang kamu dustakan? (QS. Ar-Rahman: 13)',
            'colors' => [['Dusty Blue', '#7393B3'], ['Abu-abu', '#A0A0A0'], ['Putih', '#FFFFFF']],
            'stories' => [
                ['Pertama Bertemu', -4, 'Wahyu dan Fitria bertemu di kantor yang sama di Surabaya. Meja kerja kami hanya dipisahkan satu sekat.'],
                ['Mulai Dekat', -3, 'Lembur akhir tahun dan sepiring lontong balap selepasnya membuat kami semakin dekat.'],
                ['Lamaran', -1, 'Wahyu datang bersama keluarga untuk melamar Fitria. Kue lamaran buatan Fitria sendiri ludes dalam sekejap.'],
                ['Menuju Halal', 0, 'Kami memantapkan hati untuk melangkah bersama. Mohon doa restu.'],
            ],
        ],
        'wedding_theme_26' => [
            'city'   => 'Semarang',
            'groom'  => ['Prasetyo Adi Nugroho', 'Prasetyo', 'R. Adi Nugroho', 'Sri Mulyani', 1, 'dalang muda dan dosen seni pertunjukan'],
            'bride'  => ['Woro Anindyaswari', 'Woro', 'Ir. Haryanto', 'Anindya Kusumastuti', 1, 'perancang batik tulis'],
            'quote'  => 'Witing tresno jalaran soko kulino. (Cinta tumbuh karena terbiasa bersama.)',
            'colors' => [['Sogan', '#6B4226'], ['Hijau Pupus', '#A3B18A'], ['Emas', '#C9A84C']],
            'events' => [
                ['Siraman', 'home', '09:00', '11:00', 'day' => -1],
                ['Midodareni', 'home', '19:00', '21:00', 'day' => -1],
                ['Akad Nikah', 'mosque', '08:00', '09:30', 'countdown' => true],
                ['Panggih & Resepsi', 'hall', '11:00', '14:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -6, 'Prasetyo dan Woro bertemu dalam kepanitiaan pagelaran wayang orang di kampus.'],
                ['Mulai Dekat', -4, 'Berawal dari rapat panitia, berlanjut ke lumpia Gang Lombok setiap Sabtu sore.'],
                ['Lamaran & Peningsetan', -1, 'Keluarga Prasetyo datang melamar dan menyerahkan peningset sebagai tanda ikatan kedua keluarga.'],
                ['Menuju Halal', 0, 'Mugi-mugi pinaringan berkah. Mohon doa restu untuk langkah kami.'],
            ],
        ],
        'wedding_theme_27' => [
            'city'   => 'Jakarta',
            'groom'  => ['Rasyid Hidayatullah', 'Rasyid', 'H. Abdul Rojak', 'Hj. Siti Romlah', 2, 'pelatih silat Betawi dan pegawai bank'],
            'bride'  => ['Nurlaila Fitriani', 'Laila', 'H. Sabeni', 'Hj. Zubaedah', 1, 'pengusaha kuliner khas Betawi'],
            'quote'  => 'Mahasuci (Allah) yang telah menciptakan semuanya berpasang-pasangan, baik dari apa yang ditumbuhkan oleh bumi dan dari diri mereka sendiri. (QS. Yasin: 36)',
            'colors' => [['Merah', '#B91C1C'], ['Hijau', '#15803D'], ['Kuning Emas', '#EAB308']],
            'events' => [
                ['Akad Nikah', 'home', '08:00', '09:30', 'countdown' => true],
                ['Palang Pintu & Resepsi', 'hall', '11:00', '14:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -5, 'Rasyid dan Laila bertemu di festival budaya Betawi di Setu Babakan. Laila menjaga stan kerak telor milik keluarganya.'],
                ['Mulai Dekat', -3, 'Rasyid jadi pelanggan tetap kerak telor, padahal sebenarnya ia hanya ingin mengobrol dengan Laila.'],
                ['Lamaran', -1, 'Dengan berbalas pantun dan seserahan roti buaya, keluarga Rasyid datang melamar.'],
                ['Menuju Halal', 0, 'Mohon doa restu agar kami setia sampai tua, seperti sepasang roti buaya.'],
            ],
        ],
        'wedding_theme_28' => [
            'city'   => 'Yogyakarta',
            'groom'  => ['Ardiansyah Putra Mahesa', 'Ardi', 'Mahesa Wijaya', 'Endang Sulistyowati', 1, 'product designer di sebuah startup'],
            'bride'  => ['Anggita Rahayu Kinasih', 'Gita', 'Drs. Rahmat Hidayat', 'Sri Handayani', 2, 'UX researcher yang gemar fotografi analog'],
            'quote'  => 'Rumah bukanlah tempat, melainkan seseorang. Dan kami telah menemukan rumah itu satu sama lain.',
            'colors' => [['Mocha', '#8B6F5C'], ['Beige', '#E8D9C4'], ['Olive', '#708238']],
            'stories' => [
                ['Pertama Bertemu', -5, 'Ardi dan Gita bertemu di sebuah coworking space di Jogja. Mereka berebut colokan terakhir di meja pojok.'],
                ['Proyek Bersama', -3, 'Sebuah proyek desain aplikasi mempertemukan kami kembali, kali ini sebagai satu tim.'],
                ['Lamaran', -1, 'Ardi melamar Gita di Bukit Bintang dengan pemandangan lampu kota Yogyakarta.'],
                ['Menuju Halal', 0, 'Kami siap membangun rumah bersama. Mohon doa restu dari Anda.'],
            ],
        ],
        'wedding_theme_29' => [
            'city'   => 'Malang',
            'groom'  => ['Akbar Maulana Yusuf', 'Akbar', 'H. Yusuf Effendi', 'Hj. Lilik Suryani', 2, 'dokter umum di rumah sakit swasta'],
            'bride'  => ['Shafa Aqilah Zahira', 'Shafa', 'Agung Prasetya', 'Diah Ayu Pitaloka', 1, 'psikolog anak yang suka berkebun'],
            'quote'  => 'Dan Allah menjadikan bagimu pasangan (suami atau istri) dari jenis kamu sendiri dan menjadikan anak dan cucu bagimu dari pasanganmu. (QS. An-Nahl: 72)',
            'colors' => [['Lilac', '#C8A2C8'], ['Silver', '#C0C0C0'], ['White', '#FFFFFF']],
            'stories' => [
                ['Pertama Bertemu', -8, 'Akbar dan Shafa adalah teman satu SMA di Malang yang jarang sekali bertegur sapa.'],
                ['Bertemu Kembali', -3, 'Reuni sekolah mempertemukan kami lagi. Petik apel di Batu dan sore di alun-alun kota pun menjadi agenda rutin.'],
                ['Lamaran', -1, 'Akbar datang bersama keluarga melamar Shafa, disambut tawa haru teman-teman satu angkatan.'],
                ['Menuju Halal', 0, 'Mohon doa restu agar kami selalu saling menguatkan dalam setiap musim kehidupan.'],
            ],
        ],
        'wedding_theme_30' => [
            'city'   => 'Jakarta',
            'groom'  => ['Kenan Abhipraya', 'Kenan', 'Ir. Abhimanyu Putra', 'Ratna Sari Dewi', 1, 'komposer musik film'],
            'bride'  => ['Aurelia Nadhira', 'Nadhira', 'H. Nadhif Rasyid', 'Hj. Santi Rahmawati', 2, 'pianis dan pengajar musik klasik'],
            'quote'  => 'Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati. (QS. Al-Furqan: 74)',
            'colors' => [['Charcoal', '#36454F'], ['Champagne', '#F7E7CE'], ['Dusty Rose', '#D8A7A7']],
            'events' => [
                ['Akad Nikah', 'mosque', '10:00', '11:30', 'countdown' => true],
                ['Intimate Dinner', 'hall', '18:30', '21:00'],
            ],
            'stories' => [
                ['Pertama Bertemu', -4, 'Kenan dan Nadhira bertemu di sebuah konser jazz di Jakarta. Kursi mereka ternyata bersebelahan.'],
                ['Mulai Dekat', -3, 'Playlist yang saling kami bagikan perlahan berubah menjadi lagu-lagu tentang kita.'],
                ['Lamaran', -1, 'Dalam makan malam sederhana bersama keluarga, Kenan menyampaikan niat baiknya untuk meminang Nadhira.'],
                ['Menuju Halal', 0, 'Kami memilih pernikahan yang intim bersama keluarga dan sahabat terdekat. Terima kasih telah menjadi bagian dari cerita kami.'],
            ],
        ],
    ];

    /** Used when a theme defines no events of its own. */
    private const DEFAULT_EVENTS = [
        ['Akad Nikah', 'mosque', '08:00', '10:00', 'countdown' => true],
        ['Resepsi', 'hall', '11:00', '14:00'],
    ];

    /** [name, description, price, category]; each theme gets four, rotated by theme number. */
    private const WISHLIST = [
        ['Set Peralatan Masak', 'Panci & wajan anti lengket 5 pcs', 1250000, 'dapur'],
        ['Sprei & Bed Cover King', 'Katun jepang, warna netral', 850000, 'kamar'],
        ['Air Fryer', 'Kapasitas 4 liter', 1100000, 'elektronik'],
        ['Dinner Set 24 pcs', 'Piring & mangkuk keramik', 650000, 'dapur'],
        ['Mesin Kopi Espresso', 'Untuk kopi pagi berdua', 1800000, 'elektronik'],
        ['Robot Vacuum Cleaner', 'Bisa dijadwalkan lewat aplikasi', 2500000, 'elektronik'],
        ['Set Handuk Premium', 'Katun 100%, isi 4', 400000, 'kamar'],
        ['Rice Cooker Digital', 'Kapasitas 1,8 liter', 900000, 'dapur'],
    ];

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
        $g = $t['groom'];
        $b = $t['bride'];
        $city = $t['city'];
        $date = SampleInvitationData::eventDate($today, $n, Carbon::SATURDAY);
        $year = (int) $date->year;

        return [
            'city'   => $city,
            'fields' => [
                'groom_name'        => $g[0],
                'groom_nickname'    => $g[1],
                'groom_child_order' => (string) $g[4],
                'groom_father'      => 'Bapak '.$g[2],
                'groom_mother'      => 'Ibu '.$g[3],
                'groom_instagram'   => self::instagram($g[0]),
                'groom_bio'         => "Putra ke-{$g[4]} dari Bapak {$g[2]} & Ibu {$g[3]}. Seorang {$g[5]}.",
                'bride_name'        => $b[0],
                'bride_nickname'    => $b[1],
                'bride_child_order' => (string) $b[4],
                'bride_father'      => 'Bapak '.$b[2],
                'bride_mother'      => 'Ibu '.$b[3],
                'bride_instagram'   => self::instagram($b[0]),
                'bride_bio'         => "Putri ke-{$b[4]} dari Bapak {$b[2]} & Ibu {$b[3]}. Seorang {$b[5]}.",
                'opening_quote'     => $t['quote'],
                'rsvp_deadline'     => $date->copy()->subDays(14)->toDateString(),
            ],
            'photos' => ['groom_photo' => 'groom', 'bride_photo' => 'bride', 'couple_photo' => 'couple'],
            'json'   => [
                'dress_code_colors' => array_map(fn ($c) => ['name' => $c[0], 'hex' => $c[1]], $t['colors']),
            ],
            'events'  => array_map(fn ($e) => [
                'name'      => $e[0],
                'date'      => $date->copy()->addDays($e['day'] ?? 0),
                'time'      => "{$e[2]}:00",
                'time_end'  => "{$e[3]}:00",
                'venue'     => SampleInvitationData::venue($city, $e[1], 'Kediaman Mempelai Wanita'),
                'countdown' => $e['countdown'] ?? false,
            ], $t['events'] ?? self::DEFAULT_EVENTS),
            'stories' => array_map(fn ($s) => [
                'title'   => $s[0],
                'period'  => (string) ($year + $s[1]),
                'content' => $s[2],
            ], $t['stories']),
            'wishes'   => SampleInvitationData::wishes('wedding', $n, "{$g[1]} & {$b[1]}"),
            'wishlist' => array_map(function ($i) use ($n) {
                [$name, $description, $price, $category] = self::WISHLIST[($n + $i) % count(self::WISHLIST)];

                return ['name' => $name, 'description' => $description, 'price' => $price, 'category' => $category];
            }, range(0, 3)),
            'greeting'         => "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia {$g[1]} & {$b[1]}.",
            'countdown_label'  => 'Menuju Hari Bahagia',
            'account_name'     => $g[0],
            'bank_second_name' => $b[0],
            'child_order'      => ['groom' => $g[4], 'bride' => $b[4]],
        ];
    }

    /** "Galih Rakasiwi Permana" → "galih.permana" */
    private static function instagram(string $fullName): string
    {
        $words = explode(' ', $fullName);

        return Str::slug($words[0].' '.end($words), '.');
    }
}

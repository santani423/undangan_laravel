<?php

/*
|--------------------------------------------------------------------------
| Theme renderers
|--------------------------------------------------------------------------
|
| Theme slugs that have a real React renderer in the frontend, keyed by slug
| with the invitation type (event_type) as value. Before the frontend was
| split out, Theme::rendererSlugs() discovered these by scanning
| resources/js/pages/invitation/themes/{type}/{slug}/*.tsx — the backend can
| no longer see the frontend's files, so the list lives here.
|
| Keep in sync with frontend/src/features/invitation/theme-registry.tsx
| (`npm run check:themes` in frontend/ compares both lists).
|
*/

return [

    'renderers' => [
        'aqiqah_theme_01'        => 'aqiqah',
        'aqiqah_theme_02'        => 'aqiqah',
        'aqiqah_theme_03'        => 'aqiqah',
        'aqiqah_theme_04'        => 'aqiqah',
        'aqiqah_theme_05'        => 'aqiqah',
        'aqiqah_theme_06'        => 'aqiqah',
        'aqiqah_theme_07'        => 'aqiqah',
        'aqiqah_theme_08'        => 'aqiqah',
        'aqiqah_theme_09'        => 'aqiqah',
        'aqiqah_theme_10'        => 'aqiqah',
        'aqiqah_theme_11'        => 'aqiqah',
        'aqiqah_theme_12'        => 'aqiqah',
        'aqiqah_theme_13'        => 'aqiqah',
        'aqiqah_theme_14'        => 'aqiqah',

        'birthday_theme_01'      => 'birthday',
        'birthday_theme_02'      => 'birthday',
        'birthday_theme_03'      => 'birthday',
        'birthday_theme_04'      => 'birthday',
        'birthday_theme_05'      => 'birthday',
        'birthday_theme_06'      => 'birthday',
        'birthday_theme_07'      => 'birthday',
        'birthday_theme_08'      => 'birthday',
        'birthday_theme_09'      => 'birthday',
        'birthday_theme_10'      => 'birthday',
        'birthday_theme_11'      => 'birthday',

        'gender_reveal_theme_01' => 'gender_reveal',
        'gender_reveal_theme_02' => 'gender_reveal',
        'gender_reveal_theme_03' => 'gender_reveal',

        'khitanan_theme_01'      => 'khitanan',
        'khitanan_theme_02'      => 'khitanan',

        'syukuran_theme_01'      => 'syukuran',
        'syukuran_theme_02'      => 'syukuran',

        'blossom-garden'         => 'wedding',
        'wedding_theme_01'       => 'wedding',
        'wedding_theme_02'       => 'wedding',
        'wedding_theme_03'       => 'wedding',
        'wedding_theme_04'       => 'wedding',
        'wedding_theme_05'       => 'wedding',
        'wedding_theme_06'       => 'wedding',
        'wedding_theme_07'       => 'wedding',
        'wedding_theme_08'       => 'wedding',
        'wedding_theme_09'       => 'wedding',
        'wedding_theme_10'       => 'wedding',
        'wedding_theme_11'       => 'wedding',
        'wedding_theme_12'       => 'wedding',
        'wedding_theme_13'       => 'wedding',
        'wedding_theme_14'       => 'wedding',
        'wedding_theme_15'       => 'wedding',
        'wedding_theme_16'       => 'wedding',
    ],

];

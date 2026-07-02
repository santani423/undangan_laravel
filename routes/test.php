<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-invitation', function() {
    $request = new \Illuminate\Http\Request();
    $request->merge([
        'event_type_id' => 1,
        'package_id' => 1,
        'theme_id' => 1,
        'field_values.groom_child_order' => '1',
        'field_values.bride_child_order' => '2',
    ]);
    
    $invitation = \App\Models\Invitation::create([
        'user_id'          => 4,
        'event_type_id'    => $request->input('event_type_id'),
        'package_id'       => $request->input('package_id'),
        'theme_id'         => $request->input('theme_id'),
        'slug'             => 'test-slug',
        'title'            => 'Test Title',
        'invitation_code'  => '1234',
        'status'           => 'draft',
        'groom_child_order'=> $request->filled('field_values.groom_child_order') ? (int) $request->input('field_values.groom_child_order') : null,
        'bride_child_order'=> $request->filled('field_values.bride_child_order') ? (int) $request->input('field_values.bride_child_order') : null,
    ]);
    
    return $invitation;
});

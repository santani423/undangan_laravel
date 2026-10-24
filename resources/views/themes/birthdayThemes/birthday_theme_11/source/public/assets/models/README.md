# Optional 3D models

The site ships with **no model files**. Every character and prop is built procedurally in
`src/scene/` so the invitation is complete without anything in this folder.

You can swap three of them for your own GLB/GLTF files:

| Drop file here (suggested name) | Set in `src/config/invitation.js` | Replaces |
| --- | --- | --- |
| `dr-smiley.glb` | `models.mascot: '/assets/models/dr-smiley.glb'` | Dr. Smiley (follows the camera between scenes) |
| `tooth-friend.glb` | `models.toothFriend: '/assets/models/tooth-friend.glb'` | All six tooth friends |
| `birthday-cake.glb` | `models.cake: '/assets/models/birthday-cake.glb'` | The cake tiers (the candles stay interactive) |

Guidelines: Y-up, facing +Z, origin at the feet. Size doesn't matter (models are
auto-scaled), and an animation clip named `idle` (or the first clip) loops automatically.
Prefer `.glb` files under ~2 MB. A missing or broken file only logs a warning, and the
built-in model stays in place.

Use original models or assets whose licence allows commercial use and redistribution,
and keep proof of the licence. See `ASSETS.md` in the project root for details.

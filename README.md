# McLaren F1 Rush

A browser racing game built with [three.js](https://threejs.org/) (r128). Race a McLaren F1 through four themed circuits against AI cars. Finish in the top 3 to unlock the next level.

| # | Level | Vibe |
|---|-------|------|
| 1 | Sunset City | Warm-up lap |
| 2 | Neon Night | Tight and technical |
| 3 | Desert Rush | Flat-out speed |
| 4 | Alpine Storm | Hairpins on ice |

Difficulty (easy / normal / hard), key bindings and mouse steering are in the settings menu. Progress, best results and settings are saved in your browser's `localStorage`.

## Controls (defaults, remappable)

| Action | Key |
|--------|-----|
| Steer | A / D |
| Gas / Brake | W / S |
| Boost | Left Shift |
| Drift | Space |
| Reset car | T |
| Look back | V |
| Pause | P |

On phones it switches to on-screen touch controls; rotate to landscape for the best fit.

## Run it

The game loads its textures as files, so open it through a web server rather than double-clicking `index.html`.

```bash
# any one of these, from the repo folder
php -S localhost:8000
python3 -m http.server 8000
npx serve
```

Then open <http://localhost:8000>. On Android you can do this in Termux (`pkg install php`).

## Play online with GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**, set the source to **Deploy from a branch**, choose `main` and `/ (root)`.
3. Your game will be live at `https://<your-username>.github.io/<repo-name>/`.

## Project layout

```
index.html          page markup and HUD/menu elements
css/style.css       styles
js/game.js          game logic, levels, AI, audio, controls
js/car-data.js      car mesh data and texture paths
assets/textures/    car textures (WebP)
```

three.js and the Orbitron / Rajdhani fonts are loaded from CDNs, so the first load needs an internet connection.

## Credits and licensing

- **Code** (`index.html`, `css/`, `js/game.js`): see [LICENSE](LICENSE).
- **Car model and textures** (`js/car-data.js`, `assets/`): these are third-party assets and are **not** covered by the code license. Add the original author, source and license here before making the repo public.
- three.js is MIT licensed. Orbitron and Rajdhani are SIL Open Font License.
- This is an unofficial fan project. McLaren and the McLaren logo are trademarks of their respective owners, and this project is not affiliated with or endorsed by McLaren.

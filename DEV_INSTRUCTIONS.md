# 🚀 Orange Sky Development - LOCKED DOWN PROCESS

This is the **GUARANTEED WORKING** development process for your Mac.

## Quick Start (One Command!)

```bash
./dev.sh
```

Then open: **http://127.0.0.1:7777**

## The Full Process (If you need manual control)

### Terminal 1 - File Watcher (Optional)
```bash
npm run build:watch
```
This automatically rebuilds when you save files.

### Terminal 2 - Server
```bash
cd dist && python3 -m http.server 7777 --bind 127.0.0.1
```

### Browser
Open: **http://127.0.0.1:7777**

## Why This Works 100% of the Time

1. **Python's http.server** - Built into macOS, no npm packages needed
2. **Port 7777** - Rarely used by other services
3. **127.0.0.1** - Works in ALL browsers (Safari, Chrome, Firefox, Arc)
4. **No Vite** - No complex networking issues

## Troubleshooting

**If port 7777 is taken:**
```bash
cd dist && python3 -m http.server 8899 --bind 127.0.0.1
```
Then use: http://127.0.0.1:8899

**To kill all Python servers:**
```bash
pkill -f "python3 -m http.server"
```

## Your Development Workflow

1. Make changes to source files in `src/`
2. Run `npm run build` (or have build:watch running)
3. Refresh browser at http://127.0.0.1:7777
4. See changes instantly!

## Package.json Scripts

- `npm run dev` - Uses live-server (backup option)
- `npm run build` - Build once
- `npm run build:watch` - Auto-rebuild on changes
- `./dev.sh` - The BEST option that always works!

---

**Remember:** When in doubt, just run `./dev.sh` and it will work!
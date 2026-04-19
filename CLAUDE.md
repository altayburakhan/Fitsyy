# FitSyy - Claude Talimatları

## Geliştirme Ortamı

- Proje dizini: `/mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy/fitsyy-app`
- Framework: React + Vite + TypeScript + Tailwind CSS
- Tema rengi: `#55EDB4` (mint) — `src/theme.ts` dosyasında tanımlı

## Kod değişikliği sonrası yapılacaklar

Her kod değişikliğinin ardından şu adımları takip et:

1. **Build ile doğrula** — her zaman önce build al:
   ```
   cd /mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy/fitsyy-app && npm run build
   ```

2. **Dev server'ı yeniden başlat** — değişiklikler tarayıcıya yansımıyorsa mevcut server'ı öldür ve yeni port ile başlat:
   ```
   pkill -f vite
   nohup npx vite --host --port 4200 > /tmp/vite.log 2>&1 &
   sleep 5 && cat /tmp/vite.log
   ```
   Ardından kullanıcıya **http://localhost:4200** adresini ver.

3. **Cache sorunu varsa** — kullanıcıya şunu söyle:
   > Tarayıcıda **Ctrl + Shift + R** (Windows/Linux) veya **Cmd + Shift + R** (Mac) ile sert yenile.

## Yaygın sorunlar

| Sorun | Çözüm |
|---|---|
| Değişiklik yansımıyor | Dev server'ı yeniden başlat, yeni port kullan |
| Port kullanımda | 4200, 4500, 8080 gibi yüksek port dene |
| Build hatası | `npm run build` çıktısına bak, TypeScript hatasını düzelt |
| Push edilmiyor | `git status` ile durumu kontrol et, önce commit yap |

## Push akışı

```bash
cd /mnt/c/Users/Burakhan/Desktop/Projects/Fitsyy
git add .
git commit -m "değişiklik açıklaması"
git push origin main
```

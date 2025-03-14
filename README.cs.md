[English](README.md)

# VanGogh Painter
Jedná se o webovou aplikaci, která spolupracuje s robotem [VanGogh Painter](https://github.com/microbit-cz/Vangogh-painter) při kreslení vektorové grafiky pomocí atributu `d` v elementu `<path>`. Dokáže také převádět další prvky SVG (`<rect>`, `<circle>`, `<ellipse>` atd.) na cesty.

## Postup
- Připojení k robotu bohužel není kompatibilní s Windows 10, protože systém brzy ztratí podporu. Dlouhodobě by tudíž nedávalo smysl tuto funkci implementovat.
1. Otevřete [webovou aplikaci](https://van-gogh-painter-web.vercel.app/) nebo spusťte lokálně přes příkazový řádek (`npm run dev` v root složce projektu).
2. Spárujte micro:bit s počítačem.
3. Klikněte na tlačítko „Connect“ (Připojit) a vyberte micro:bit ze seznamu.
4. Klikněte na část „Upload“ (Nahrát) a vyberte vámi zvolený soubor SVG.
5. Ujistěte se, že jsou cesty správně dimenzovány pomocí pravítka a nastavení měřítka plátna.
5. Klepnutím na tlačítko 'Start' zahájíte proces kreslení.

## Další Funkce
- Jednoduchý editor **SVG** pro přidání jednoduchých tvarů nebo stažení souboru SVG.
- Pomocí posuvníku pod nastavením měřítka přibližujte/oddalujte plátno.
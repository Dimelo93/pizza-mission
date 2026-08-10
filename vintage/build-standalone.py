#!/usr/bin/env python3
"""Baut aus index.html, app.css, data.js und app.js eine einzelne HTML-Datei.

Zweck: eine Fassung, die sich verschicken, auf einen Stick legen oder direkt
vom Dateisystem öffnen lässt — ohne Server, ohne Nachladen. Nach jeder Änderung
an den Quelldateien neu ausführen:

    python3 build-standalone.py
"""

import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'vintage-mission.html'


def read(name: str) -> str:
    path = HERE / name
    if not path.exists():
        sys.exit(f'fehlt: {name}')
    return path.read_text(encoding='utf-8')


def main(body_only: bool = False) -> str:
    html = read('index.html')
    css = read('app.css')
    js = read('data.js') + '\n' + read('app.js')

    # Der Service Worker kann ohne eigene Datei nicht laufen — Registrierung raus.
    js = js.replace("navigator.serviceWorker.register('./sw.js').catch(function(){});", '/* kein Service Worker in der Einzeldatei */')

    html = html.replace(
        '<link rel="stylesheet" href="app.css">',
        '<style>\n' + css + '\n</style>')
    # Als Lambda, nicht als Ersetzungsstring: re.sub würde sonst Sequenzen wie
    # \r, \n oder \g im eingebetteten JavaScript als Escapes auflösen.
    html = re.sub(r'\s*<script src="data\.js"></script>\s*<script src="app\.js"></script>',
                  lambda m: '\n<script>\n' + js + '\n</script>', html)
    # Manifest und Icons zeigen auf Nachbardateien, die es hier nicht gibt.
    html = re.sub(r'\s*<link rel="(manifest|apple-touch-icon|icon)"[^>]*>', '', html)

    if body_only:
        # Nur der Inhalt zwischen <body> und </body>, plus <style>/<script>:
        # Form, die eine Artifact-Veröffentlichung erwartet.
        style = re.search(r'<style>.*?</style>', html, re.S).group(0)
        title = re.search(r'<title>(.*?)</title>', html, re.S).group(1)
        body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
        return f'<title>{title}</title>\n{style}\n{body}\n'
    return html


if __name__ == '__main__':
    body_only = '--body-only' in sys.argv
    out = OUT.with_name('vintage-mission-artifact.html') if body_only else OUT
    text = main(body_only)
    out.write_text(text, encoding='utf-8')
    print(f'{out.name}: {len(text) / 1024:.0f} KB')

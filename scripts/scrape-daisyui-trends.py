import os, re, sys, time, urllib.error, urllib.request as r
from urllib.parse import urljoin
from bs4 import BeautifulSoup

BASE = 'https://trends.daisyui.com'
OUT = 'design-trends'
UA = {'User-Agent': 'Mozilla/5.0'}


def fetch(url):
    for attempt in range(4):
        try:
            return r.urlopen(r.Request(url, headers=UA), timeout=30).read()
        except urllib.error.HTTPError:
            raise
        except OSError:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))


def text(url):
    return fetch(url).decode('utf8')


def to_markdown(page_html, url):
    soup = BeautifulSoup(page_html, 'html.parser')
    main = soup.find('main') or soup
    for t in main.find_all(['script', 'style', 'button', 'nav', 'svg', 'img', 'figure']):
        t.decompose()
    lines = [f'<!-- source: {url} -->']
    for el in main.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'li']):
        if el.name == 'p' and el.find_parent('li'):
            continue
        s = re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip()
        if not s:
            continue
        if el.name == 'li':
            lines.append(f'- {s}')
        elif el.name == 'p':
            lines.append(f'\n{s}\n')
        else:
            lines.append(f'\n{"#" * int(el.name[1])} {s}\n')
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)) + '\n'


def save(path, data):
    mode = 'wb' if isinstance(data, bytes) else 'w'
    with open(path, mode, **({} if mode == 'wb' else {'encoding': 'utf8'})) as f:
        f.write(data)


def main():
    index = text(f'{BASE}/')
    slugs = sorted(set(re.findall(r'href="\./trend/([^"]+)/"', index)))
    print(len(slugs), 'trends')
    report = {}
    for slug in slugs:
        d = f'{OUT}/{slug}'
        if os.path.exists(f'{d}/{slug}.demo.html'):
            continue
        os.makedirs(d, exist_ok=True)
        got = []
        url = f'{BASE}/trend/{slug}/'
        try:
            page = text(url)
            save(f'{d}/{slug}.md', to_markdown(page, url))
            got.append('md')
            m = re.search(r'src="([^"]*screenshots/[^"]+)"', page)
            if m:
                shot = urljoin(url, m.group(1))
                save(f'{d}/{slug}.screenshot{os.path.splitext(shot)[1]}', fetch(shot))
                got.append('shot')
        except OSError as e:
            print('FAIL page', slug, e)
        durl = f'{BASE}/{slug}/demo/'
        try:
            demo = text(durl)
            for i, href in enumerate(re.findall(r'<link href="([^"]+\.css)" rel="stylesheet">', demo)):
                name = f'{slug}.demo.css' if i == 0 else f'{slug}.demo.{i}.css'
                save(f'{d}/{name}', fetch(urljoin(durl, href)))
                demo = demo.replace(href, name)
            save(f'{d}/{slug}.demo.html', demo)
            got.append('demo')
        except OSError as e:
            print('no demo', slug, e)
        report[slug] = got
        print(slug, got, flush=True)
        time.sleep(0.2)
    print('summary:', {k: sum(k in v for v in report.values()) for k in ('md', 'shot', 'demo')})


main()

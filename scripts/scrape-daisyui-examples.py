import html, os, re, sys, time, urllib.parse as u, urllib.request as r

BASE = 'https://daisyui.com'
COMPONENTS_DIR = 'styles/components'
UA = {'User-Agent': 'Mozilla/5.0'}


def get(url):
    return r.urlopen(r.Request(url, headers=UA), timeout=30).read().decode('utf8')


def slugs():
    page = get(f'{BASE}/components/')
    return sorted(set(re.findall(r'href="/components/([a-z0-9-]+)/"', page)))


def norm(s):
    return s.replace('-', '')


def extract(page):
    out, seen = [], set()
    for m in re.finditer(r'data-copy-code="([^"]*)"', page):
        code = u.unquote(m.group(1)).replace('$$', '')
        if code in seen:
            continue
        seen.add(code)
        heads = re.findall(r'<h[2-4][^>]*>(.*?)</h[2-4]>', page[max(0, m.start() - 4000):m.start()], re.S)
        title = html.unescape(re.sub(r'<[^>]+>', '', heads[-1])).strip() if heads else ''
        out.append((title or f'Example {len(out) + 1}', code))
    return out


def main():
    by_norm = {norm(s): s for s in slugs()}
    done, missing = [], []
    for name in sorted(os.listdir(COMPONENTS_DIR)):
        if not os.path.isdir(f'{COMPONENTS_DIR}/{name}'):
            continue
        slug = by_norm.get(norm(name))
        if name == 'mockup':
            continue  # no single page; mockup-browser/code/phone/window were scraped separately
        if not slug:
            missing.append(name)
            continue
        examples = extract(get(f'{BASE}/components/{slug}/'))
        if not examples:
            missing.append(name)
            continue
        body = [f'<!-- source: {BASE}/components/{slug}/ -->']
        for title, code in examples:
            body.append(f'\n<!-- {title} -->\n{code}')
        with open(f'{COMPONENTS_DIR}/{name}/{name}.example.html', 'w', encoding='utf8') as f:
            f.write('\n'.join(body) + '\n')
        done.append((name, len(examples)))
        print(name, slug, len(examples), flush=True)
        time.sleep(0.3)
    print('missing:', missing)


main()

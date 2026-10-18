import os, re, urllib.request as r
from urllib.parse import urljoin

BASE = 'https://www.uupm.cc'
OUT = 'examples/uupm-site-pet-grooming'
UA = {'User-Agent': 'Mozilla/5.0'}
get = lambda u: r.urlopen(r.Request(u, headers=UA), timeout=30).read()

page = get(f'{BASE}/demo/pet-grooming').decode('utf8')
os.makedirs(f'{OUT}/css', exist_ok=True)
for href in dict.fromkeys(re.findall(r'<link[^>]+href="(/_next/static/[^"]+\.css)"', page)):
    name = os.path.basename(href)
    open(f'{OUT}/css/{name}', 'wb').write(get(urljoin(BASE, href)))
    page = page.replace(href, f'css/{name}')
page = re.sub(r'<script[\s\S]*?</script>', '', page)
page = re.sub(r'<link[^>]+rel="preload"[^>]*>', '', page)
open(f'{OUT}/pet-grooming.demo.html', 'w', encoding='utf8').write(page)
open(f'{OUT}/thumbnail.png', 'wb').write(get(f'{BASE}/thumbnails/pet-grooming.png'))
print(len(os.listdir(f'{OUT}/css')), 'css files')

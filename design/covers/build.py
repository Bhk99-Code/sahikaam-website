"""Builds the ebook cover HTML files (one style per book). Render with render.sh."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))

BASE = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@600;800&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:600px;height:800px;overflow:hidden}
body{font-family:'Plus Jakarta Sans',sans-serif;position:relative;--o:#FF6A00;--o2:#FF8A3D;--o3:#FFB27A;--k:#0A0A0A;--k2:#1C1C1C;--w:#FFFFFF}
.d{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-0.03em;line-height:.92}
.hi{font-family:'Noto Sans Devanagari',sans-serif}
.abs{position:absolute}
.brand{position:absolute;display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px;letter-spacing:.22em}
.brand i{display:inline-flex;width:30px;height:30px;border-radius:9px;background:var(--o);color:#fff;font-style:normal;align-items:center;justify-content:center;font-family:'Bricolage Grotesque';font-size:18px;letter-spacing:0}
.lang{position:absolute;font-size:14px;font-weight:700;letter-spacing:.08em;padding:7px 14px;border-radius:99px}
.tag{display:inline-block;font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
%CSS%
</style></head><body>%BODY%</body></html>"""

def brand(x, y, color="#fff"):
    return f'<div class="brand" style="left:{x}px;top:{y}px;color:{color}"><i>S</i>SAHIKAAM</div>'

def lang(x, y, fg, bg, border=None):
    b = f";border:1.5px solid {border}" if border else ""
    return f'<div class="lang" style="left:{x}px;top:{y}px;color:{fg};background:{bg}{b}"><span class="hi">हिंदी</span> + ENGLISH</div>'

COVERS = {}

# 1 — Giant number: huge 50 + factory skyline
skyline = "".join(
    f'<rect x="{x}" y="{800-h}" width="{w}" height="{h}" fill="{c}"/>'
    for x, w, h, c in [(0,90,60,"#1C1C1C"),(80,60,90,"#262626"),(130,110,70,"#1C1C1C"),(250,26,120,"#FF6A00"),(276,120,80,"#262626"),(396,50,105,"#1C1C1C"),(436,100,72,"#262626"),(520,26,140,"#FF6A00"),(546,60,64,"#1C1C1C")])
skyline += '<path d="M290 740 l30 -24 v24 l30 -24 v24 l30 -24 v84 h-90z" fill="#333"/>'
COVERS["manufacturing-50"] = ("""
body{background:radial-gradient(120% 80% at 80% 0%,#2a1405 0%,#0A0A0A 55%)}
.n{position:absolute;left:28px;top:70px;font-size:420px;font-weight:800;color:transparent;-webkit-text-stroke:3px var(--o);letter-spacing:-0.06em}
.n2{position:absolute;left:28px;top:70px;font-size:420px;font-weight:800;background:linear-gradient(180deg,#FF6A00 0%,#FF8A3D 45%,rgba(255,106,0,0) 80%);-webkit-background-clip:text;color:transparent;letter-spacing:-0.06em;clip-path:inset(0 0 52% 0)}
""", f"""
{brand(40,40)}
<div class="n d">50</div><div class="n2 d">50</div>
<div class="abs" style="left:40px;top:410px;right:40px">
 <div class="tag" style="color:var(--o3)">Most profitable</div>
 <div class="d" style="font-size:62px;font-weight:800;color:#fff;margin-top:10px">Manufacturing<br>Businesses</div>
 <div style="font-size:19px;color:#D4D4D4;margin-top:16px;font-weight:600">From ₹10 lakh to a ₹1,000 crore company</div>
</div>
<svg class="abs" style="left:0;top:0" width="600" height="800">{skyline}
<circle cx="250" cy="520" r="0"/><path d="M250 540 q10 -20 0 -40 q-10 -20 0 -40" stroke="#FF8A3D" stroke-width="3" fill="none" opacity=".0"/></svg>
{lang(40,740,"#fff","rgba(255,255,255,.08)","rgba(255,255,255,.2)")}
""")

# 2 — Swiss editorial: white, heavy black type, dot grid of 128
dots = "".join(f'<circle cx="{10+ (i%16)*15}" cy="{10+(i//16)*15}" r="5" fill="{"#FF6A00" if i in (5,22,39,40,77,93,110,127) else "#0A0A0A"}"/>' for i in range(128))
COVERS["legal-business-andha-paisa"] = ("""
body{background:#fff}
.bar{position:absolute;left:0;top:0;width:24px;height:800px;background:var(--o)}
""", f"""
<div class="bar"></div>
{brand(60,44,"#0A0A0A")}
<div class="abs" style="right:40px;top:46px;font-size:13px;font-weight:800;letter-spacing:.18em;color:#737373">VOL. 1–15</div>
<div class="abs d" style="left:56px;top:120px;font-size:96px;font-weight:800;color:#0A0A0A">Legal<br>Business</div>
<div class="abs d" style="left:56px;top:330px;font-size:84px;font-weight:800;color:var(--o);font-style:italic">Andha Paisa</div>
<div class="abs" style="left:60px;top:440px;width:120px;height:8px;background:#0A0A0A"></div>
<div class="abs" style="left:60px;top:470px;font-size:20px;font-weight:600;color:#333;width:240px;line-height:1.35">Legal businesses you can start with little or no money</div>
<svg class="abs" style="left:330px;top:470px" width="250" height="130">{dots}</svg>
<div class="abs" style="left:330px;top:610px;font-size:13px;font-weight:800;letter-spacing:.14em;color:#0A0A0A">128 IDEAS · 15 CHAPTERS</div>
{lang(60,736,"#fff","#0A0A0A")}
""")

# 3 — Blueprint: orange grid lines, building elevation
bp = "".join(f'<line x1="{x}" y1="0" x2="{x}" y2="800" stroke="#FF6A00" stroke-opacity="{.22 if x%100==0 else .08}"/>' for x in range(0, 601, 20))
bp += "".join(f'<line x1="0" y1="{y}" x2="600" y2="{y}" stroke="#FF6A00" stroke-opacity="{.22 if y%100==0 else .08}"/>' for y in range(0, 801, 20))
bld = """
<g stroke="#FF8A3D" stroke-width="2.5" fill="none">
 <rect x="300" y="300" width="240" height="300"/><path d="M290 300 L420 220 L550 300"/>
 <rect x="330" y="340" width="50" height="60"/><rect x="460" y="340" width="50" height="60"/>
 <rect x="330" y="440" width="50" height="60"/><rect x="460" y="440" width="50" height="60"/>
 <rect x="395" y="500" width="50" height="100"/>
</g>
<g stroke="#fff" stroke-width="1.5" fill="none" opacity=".7">
 <path d="M300 625 v20 M540 625 v20 M300 635 H540"/><path d="M565 300 h20 M565 600 h20 M575 300 V600"/>
</g>
<text x="420" y="660" fill="#fff" opacity=".7" font-size="14" font-family="Plus Jakarta Sans" font-weight="700" text-anchor="middle">12.0 m</text>
<text x="592" y="455" fill="#fff" opacity=".7" font-size="14" font-family="Plus Jakarta Sans" font-weight="700" transform="rotate(90 592 455)" text-anchor="middle">9.0 m</text>
<g transform="rotate(-12 150 640)"><rect x="60" y="600" width="190" height="64" rx="8" fill="none" stroke="#FF6A00" stroke-width="3"/>
<text x="155" y="642" fill="#FF6A00" font-size="26" font-family="Bricolage Grotesque" font-weight="800" text-anchor="middle" letter-spacing="3">APPROVED</text></g>
"""
COVERS["contractor-bano"] = ("""body{background:#0d0d0d}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800">{bp}{bld}</svg>
{brand(40,40)}
<div class="abs" style="left:40px;top:110px"><div class="tag" style="color:var(--o)">Engineer → Contractor</div>
<div class="d" style="font-size:88px;font-weight:800;color:#fff;margin-top:14px">Contractor<br><span style="color:var(--o)">Bano</span></div></div>
<div class="abs" style="left:40px;top:330px;width:230px;font-size:18px;font-weight:600;color:#D4D4D4;line-height:1.4">Start your own contracting business — tenders, BOQ, billing, cash flow</div>
{lang(40,740,"#fff","#0A0A0A","rgba(255,106,0,.6)")}
""")

# 4 — Brick wall: running bond pattern
bricks = ""
for r in range(9):
    y = 430 + r * 42
    off = -45 if r % 2 else 0
    for c in range(-1, 7):
        x = off + c * 92
        shade = ["#FF6A00","#E65F00","#FF8A3D","#C24F00","#FF6A00","#FFB27A"][(r*3 + c*5) % 6]
        bricks += f'<rect x="{x+3}" y="{y+3}" width="86" height="36" rx="3" fill="{shade}"/>'
COVERS["fly-ash-bricks"] = ("""body{background:#fff}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800"><rect y="430" width="600" height="370" fill="#F2F2F2"/>{bricks}</svg>
{brand(40,40,"#0A0A0A")}
<div class="abs" style="left:40px;top:108px"><span class="tag" style="background:#0A0A0A;color:#fff;padding:7px 12px;border-radius:6px">Project report · DPR</span></div>
<div class="abs d" style="left:40px;top:160px;font-size:104px;font-weight:800;color:#0A0A0A">Fly Ash<br>Bricks</div>
<div class="abs" style="left:40px;top:368px;font-size:20px;font-weight:700;color:#333">8,000 bricks a day · ₹33 lakh project</div>
<div class="abs" style="right:36px;top:470px;width:150px;height:150px;border-radius:50%;background:#0A0A0A;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.35)"><span class="d" style="font-size:44px;font-weight:800;color:var(--o)">+Excel</span><span style="font-size:13px;font-weight:700;margin-top:6px;letter-spacing:.06em">BANK-READY</span></div>
{lang(40,740,"#fff","#0A0A0A")}
""")

# 5 — Paver tessellation: hexagon pavers
import math
hexes = ""
R = 34
for row in range(-1, 16):
    for col in range(-1, 11):
        cx = col * R * 1.732 + (R * 0.866 if row % 2 else 0)
        cy = row * R * 1.5
        pts = " ".join(f"{cx + (R-3)*math.cos(math.radians(60*k+30)):.1f},{cy + (R-3)*math.sin(math.radians(60*k+30)):.1f}" for k in range(6))
        c = "#FF6A00" if (row*7 + col*3) % 9 == 0 else ("#262626" if (row + col) % 2 else "#1C1C1C")
        hexes += f'<polygon points="{pts}" fill="{c}"/>'
COVERS["paver-blocks"] = ("""body{background:#0A0A0A}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800">{hexes}</svg>
<div class="abs" style="left:28px;top:150px;right:28px;background:#fff;border-radius:22px;padding:34px 30px;box-shadow:0 20px 50px rgba(0,0,0,.5)">
 <div class="tag" style="color:var(--o)">Project report · DPR</div>
 <div class="d" style="font-size:92px;font-weight:800;color:#0A0A0A;margin-top:12px">Paver<br>Blocks</div>
 <div style="font-size:19px;font-weight:700;color:#333;margin-top:16px">Factory + laying business · ₹48 lakh project</div>
 <div style="display:flex;gap:10px;margin-top:20px"><span class="tag" style="font-size:12px;border:2px solid #0A0A0A;padding:6px 10px;border-radius:8px;color:#0A0A0A">IS 15658</span><span class="tag" style="font-size:12px;background:var(--o);padding:8px 12px;border-radius:8px;color:#fff">+ Excel DPR</span></div>
</div>
<div class="abs" style="left:28px;top:40px;background:#0A0A0A;padding:10px 14px 10px 10px;border-radius:14px">{brand(0,0).replace('position:absolute;','').replace('left:0px;top:0px;','')}</div>
{lang(40,740,"#fff","#0A0A0A","rgba(255,255,255,.25)")}
""")

# 6 — Orange bg, 40 jar-lid circles
lids = ""
for i in range(40):
    x = 52 + (i % 8) * 64; y = 462 + (i // 8) * 47
    fill = "#0A0A0A" if i % 7 == 3 else "#fff"
    lids += f'<circle cx="{x}" cy="{y}" r="22" fill="{fill}"/><circle cx="{x}" cy="{y}" r="15" fill="none" stroke="{"#FF6A00" if fill=="#fff" else "#FF8A3D"}" stroke-width="2.5"/>'
COVERS["food-processing-40"] = ("""body{background:linear-gradient(160deg,#FF8A3D 0%,#FF6A00 55%,#E65F00 100%)}""", f"""
{brand(40,40,"#0A0A0A").replace('background:var(--o)','')}
<div class="abs d" style="right:30px;top:20px;font-size:230px;font-weight:800;color:#fff;opacity:.95">40</div>
<div class="abs" style="left:40px;top:215px"><div class="tag" style="color:#0A0A0A">Business ideas</div>
<div class="d" style="font-size:86px;font-weight:800;color:#0A0A0A;margin-top:10px">Food<br>Processing</div></div>
<div class="abs" style="left:40px;top:432px;display:none"></div>
<svg class="abs" style="left:0;top:0" width="600" height="800">{lids}</svg>
<div class="abs" style="left:40px;top:690px;font-size:16px;font-weight:700;color:#0A0A0A">Spices · pickles · paneer · namkeen · makhana</div>
{lang(40,740,"#fff","#0A0A0A")}
""")

# 7 — Sunrise over furrowed field
furrows = "".join(f'<path d="M-50 {560+i*28} Q300 {500+i*22} 650 {560+i*28}" stroke="{"#FF6A00" if i%3==0 else "#333"}" stroke-width="{3 if i%3==0 else 2}" fill="none"/>' for i in range(10))
COVERS["krishi-kachra-se-kamaai"] = ("""body{background:#0A0A0A}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800">
<defs><radialGradient id="g"><stop offset="0" stop-color="#FFB27A"/><stop offset=".6" stop-color="#FF6A00"/><stop offset="1" stop-color="#FF6A00" stop-opacity="0"/></radialGradient></defs>
<circle cx="300" cy="560" r="300" fill="url(#g)" opacity=".35"/><circle cx="300" cy="560" r="150" fill="#FF6A00"/>
<rect y="545" width="600" height="260" fill="#0A0A0A"/>{furrows}
<g stroke="#FFB27A" stroke-width="3" fill="none" stroke-linecap="round"><path d="M90 545 v-60 M90 505 q-22 -8 -26 -30 M90 515 q20 -6 26 -28"/><path d="M500 545 v-50 M500 510 q-18 -6 -22 -26 M500 520 q18 -4 22 -24"/></g>
</svg>
{brand(40,40)}
<div class="abs" style="left:0;right:0;top:110px;text-align:center"><div class="tag" style="color:var(--o3)">30 businesses from crop waste</div>
<div class="d" style="font-size:84px;font-weight:800;color:#fff;margin-top:14px">Krishi Kachra<br><span style="color:var(--o)">se Kamaai</span></div>
<div style="font-size:18px;font-weight:600;color:#D4D4D4;margin-top:18px">Parali · husk · bagasse · dung · peels</div></div>
{lang(40,740,"#fff","rgba(255,255,255,.08)","rgba(255,255,255,.2)")}
""")

# 8 — Workforce grid: people icons with hard hats
people = ""
for r in range(4):
    for c in range(7):
        x = 60 + c * 80; y = 440 + r * 72
        hat = (r * 7 + c) % 4 == 1 or (r, c) in ((0, 3), (2, 5))
        col = "#FF6A00" if hat else "#0A0A0A"
        people += f'<circle cx="{x}" cy="{y}" r="13" fill="{col}"/><path d="M{x-22} {y+42} q0 -24 22 -24 q22 0 22 24z" fill="{col}"/>'
        if hat: people += f'<path d="M{x-16} {y-6} q16 -26 32 0z" fill="#0A0A0A"/><rect x="{x-19}" y="{y-8}" width="38" height="5" rx="2" fill="#0A0A0A"/>'
COVERS["labour-contractor-bano"] = ("""body{background:#fff}""", f"""
<div class="abs" style="left:0;top:0;width:600px;height:400px;background:#0A0A0A"></div>
{brand(40,40)}
<div class="abs" style="left:40px;top:110px"><div class="tag" style="color:var(--o)">Manpower supply business</div>
<div class="d" style="font-size:90px;font-weight:800;color:#fff;margin-top:12px">Labour<br>Contractor <span style="color:var(--o)">Bano</span></div></div>
<svg class="abs" style="left:0;top:0" width="600" height="800">{people}</svg>
<div class="abs" style="left:40px;top:700px;font-size:16px;font-weight:700;color:#333">Licence · rates · PF/ESIC · first client</div>
{lang(40,740,"#fff","#0A0A0A")}
""")

# 9 — Staircase steps with rupee
steps = ""
for i in range(6):
    h = 80 + i * 55
    steps += f'<rect x="{40 + i*88}" y="{800 - h}" width="84" height="{h}" rx="6" fill="{["#262626","#333","#C24F00","#E65F00","#FF6A00","#FF8A3D"][i]}"/>'
    steps += f'<text x="{82 + i*88}" y="{830 - h + 12}" fill="#fff" font-family="Bricolage Grotesque" font-weight="800" font-size="22" text-anchor="middle" opacity=".9">{i+1}</text>'
COVERS["pmegp-step-by-step"] = ("""body{background:#0A0A0A}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800">{steps}
<circle cx="522" cy="285" r="42" fill="#fff"/><text x="522" y="303" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="50" fill="#FF6A00">₹</text></svg>
{brand(40,40)}
<div class="abs" style="left:40px;top:108px"><div class="d" style="font-size:112px;font-weight:800;color:#fff">PMEGP</div>
<div class="d" style="font-size:46px;font-weight:700;color:var(--o);margin-top:6px">Step by Step</div>
<div style="font-size:18px;font-weight:600;color:#D4D4D4;margin-top:16px;width:300px;line-height:1.4">Bank loan with up to <b style="color:#fff">35% subsidy</b> — from eligibility to claim</div></div>
{lang(40,40+0,"#fff","#0A0A0A","rgba(255,255,255,.25)").replace("left:40px;top:40px","right:40px;top:40px")}
""")

# 10 — Storefront with striped awning
stripes = "".join(f'<rect x="{x}" y="250" width="50" height="70" fill="{"#FF6A00" if (x//50)%2==0 else "#fff"}"/>' for x in range(0, 600, 50))
scallops = "".join(f'<circle cx="{x+25}" cy="320" r="25" fill="{"#FF6A00" if (x//50)%2==0 else "#fff"}"/>' for x in range(0, 600, 50))
COVERS["franchise-lo-sahi-lo"] = ("""body{background:#0A0A0A}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800"><rect x="0" y="236" width="600" height="16" fill="#1C1C1C"/>{stripes}{scallops}
<rect x="60" y="400" width="300" height="250" rx="10" fill="none" stroke="#333" stroke-width="4"/><rect x="400" y="400" width="140" height="300" rx="10" fill="none" stroke="#333" stroke-width="4"/>
<g transform="rotate(-6 210 470)"><rect x="140" y="440" width="140" height="56" rx="10" fill="#FF6A00"/><text x="210" y="478" text-anchor="middle" fill="#fff" font-family="Bricolage Grotesque" font-weight="800" font-size="28" letter-spacing="3">OPEN</text></g>
<path d="M210 400 L170 440 M210 400 L250 440" stroke="#555" stroke-width="2"/></svg>
{brand(40,40)}
<div class="abs" style="left:40px;top:96px"><div class="d" style="font-size:80px;font-weight:800;color:#fff">Franchise Lo,</div></div>
<div class="abs" style="left:40px;top:172px"><div class="d" style="font-size:52px;font-weight:800;color:var(--o)">Sahi Lo.</div></div>
<div class="abs" style="left:60px;top:560px;width:290px;font-size:18px;font-weight:600;color:#D4D4D4;line-height:1.4">Which brand, how much money, how much profit — without getting cheated</div>
{lang(40,740,"#fff","rgba(255,255,255,.08)","rgba(255,255,255,.2)")}
""")

# 11 — Minimal lightbulb with check
COVERS["idea-test-karo"] = ("""body{background:#F7F4F0}""", f"""
<svg class="abs" style="left:0;top:0" width="600" height="800">
<circle cx="390" cy="300" r="190" fill="#FF6A00" opacity=".12"/>
<g fill="none" stroke="#0A0A0A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
<path d="M390 160 c-75 0 -125 55 -125 120 c0 45 25 75 50 100 c15 15 20 30 20 50 h110 c0 -20 5 -35 20 -50 c25 -25 50 -55 50 -100 c0 -65 -50 -120 -125 -120z"/>
<path d="M340 470 h100 M350 505 h80"/></g>
<path d="M340 285 l35 35 l65 -70" fill="none" stroke="#FF6A00" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
<g stroke="#FF6A00" stroke-width="8" stroke-linecap="round"><path d="M390 100 v-35 M520 150 l25 -25 M260 150 l-25 -25 M580 280 h35"/></g>
</svg>
{brand(40,40,"#0A0A0A")}
<div class="abs" style="left:40px;top:505px"><div class="d" style="font-size:84px;font-weight:800;color:#0A0A0A">Idea Test <span style="color:var(--o)">Karo</span></div>
<div style="font-size:19px;font-weight:600;color:#333;margin-top:16px">Will people really buy? Find out before you invest.</div></div>
<div class="abs" style="left:40px;top:200px;display:flex;flex-direction:column;gap:10px">
<span class="tag" style="background:#0A0A0A;color:#fff;padding:9px 14px;border-radius:10px;font-size:15px">7 days</span>
<span class="tag" style="background:var(--o);color:#fff;padding:9px 14px;border-radius:10px;font-size:15px">₹0 cost</span></div>
{lang(40,740,"#fff","#0A0A0A")}
""")

if __name__ == "__main__":
    for slug, (css, body) in COVERS.items():
        with open(os.path.join(HERE, f"{slug}.html"), "w") as f:
            f.write(BASE.replace("%CSS%", css).replace("%BODY%", body))
        print(slug)

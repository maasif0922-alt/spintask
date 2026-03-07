import os
import glob
import re

internal_pages = [
    "dashboard.html", "tasks.html", "spin.html", "luckydraw.html", 
    "pool.html", "plans.html", "referral.html", "deposit.html", 
    "withdraw.html", "support.html", "profile.html"
]

def load_file(fname):
    filepath = os.path.join(".", fname)
    if not os.path.exists(filepath): return None
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def save_file(fname, data):
    filepath = os.path.join(".", fname)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(data)

# Extract correct header and drawer from dashboard.html
dashboard_cnt = load_file("dashboard.html")

# Get Top Header
header_match = re.search(r'(<header class="top-header">.*?</header>)', dashboard_cnt, re.DOTALL)
correct_header = header_match.group(1) if header_match else ""

# Get Drawer and Script
drawer_match = re.search(r'(<!-- ========== MOBILE NAVIGATION DRAWER ========== -->.*?</body>)', dashboard_cnt, re.DOTALL)
correct_drawer = drawer_match.group(1).replace("</body>", "").strip() if drawer_match else ""

print(f"Header len: {len(correct_header)}, Drawer len: {len(correct_drawer)}")

if len(correct_header) > 0 and len(correct_drawer) > 0:
    for page in internal_pages:
        if page == "dashboard.html": 
            continue
            
        content = load_file(page)
        if not content: continue
        
        # Replace existing top-header
        content = re.sub(r'<header class="top-header">.*?</header>', correct_header, content, flags=re.DOTALL)
        
        # Remove any existing mobile-bottom-nav
        content = re.sub(r'<!-- Mobile Bottom Nav -->.*?</div>\s*<div class="sidebar-overlay"[^>]*></div>', '', content, flags=re.DOTALL)
        content = re.sub(r'<nav class="mobile-bottom-nav".*?</nav>\s*<div class="mobile-more-sheet".*?</div>', '', content, flags=re.DOTALL)
        content = re.sub(r'<script src="js/mobile.js"></script>', '', content)
        
        # Look for existing drawer inside other pages and replace them to avoid duplicates
        if "<!-- ========== MOBILE NAVIGATION DRAWER ========== -->" in content:
            content = re.sub(r'<!-- ========== MOBILE NAVIGATION DRAWER ========== -->.*?(?=</body>)', correct_drawer + '\n', content, flags=re.DOTALL)
        else:
            # Just insert before </body>
            content = content.replace("</body>", correct_drawer + '\n</body>')
            
        save_file(page, content)
        print(f"Updated {page}")

print("Done standardizing headers and drawers.")

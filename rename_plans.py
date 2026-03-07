import os
import glob

html_files = glob.glob("*.html")

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Desktop Sidebar
    content = content.replace(
        "<span>🚀</span> Investment Plans",
        "<span>📈</span> Trading Plans"
    )
    
    # Mobile Navigation (two lines typically, so let's use regex or split logic)
    content = content.replace(
        """<div class="mob-nav-icon">🚀</div>
                <div class="mob-nav-label">Investment Plans</div>""",
        """<div class="mob-nav-icon">📈</div>
                <div class="mob-nav-label">Trading Plans</div>"""
    )
    
    # Fallback in case spacing is different
    content = content.replace(
        '<div class="mob-nav-icon">🚀</div>\n                <div class="mob-nav-label">Investment Plans</div>',
        '<div class="mob-nav-icon">📈</div>\n                <div class="mob-nav-label">Trading Plans</div>'
    )
    
    # Just generic "Investment Plans" inside the mob-nav-label if standard replacement missed it
    content = content.replace(">Investment Plans<", ">Trading Plans<")

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Replacement complete.")

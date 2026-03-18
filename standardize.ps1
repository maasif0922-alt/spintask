$dashboard = [System.IO.File]::ReadAllText("dashboard.html")

# Extract the correct drawer HTML from dashboard.html
# It starts at "<!-- ========== MOBILE NAVIGATION DRAWER ========== -->" and ends before "</body>"
$drawerMatch = [regex]::Match($dashboard, '(?s)<!-- ========== MOBILE NAVIGATION DRAWER ========== -->.*?</body>')
if (-not $drawerMatch.Success) {
    Write-Host "Could not find drawer in dashboard.html"
    exit
}
$drawerHtml = $drawerMatch.Value.Replace('</body>', '')

$headerOld = '(?s)<header class="top-header">\s*<button class="mobile-menu-btn"[^>]*>.*?</button>\s*<a href="dashboard\.html" class="header-logo">\s*<svg[^>]*>.*?</svg>\s*SpinTask<span>\.</span>\s*</a>\s*</header>'
$headerNew = '<header class="top-header">
        <a href="dashboard.html" class="header-logo">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="#39ff14" stroke-width="2" />
                <circle cx="20" cy="20" r="4" fill="#39ff14" />
            </svg>
            SpinTask<span>.</span>
        </a>
        <!-- 3-Dots Mobile Menu Button -->
        <button class="mobile-dots-btn" id="mob-dots-btn" aria-label="Open navigation menu">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </button>
    </header>'

$files = "tasks.html", "spin.html", "luckydraw.html", "pool.html", "referral.html", "deposit.html", "withdraw.html", "support.html", "profile.html", "cricket.html", "football.html", "tennis.html", "basketball.html", "esports.html", "betting.html"

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = [System.IO.File]::ReadAllText($f)
        
        # Replace Header
        if ($content -match $headerOld) {
            $content = $content -replace $headerOld, $headerNew
        }
        
        # Remove old bottom nav and more sheet
        $bottomNavPattern = '(?s)<!-- Mobile Bottom Nav -->.*?</nav>\s*<div class="mobile-more-sheet".*?</div>\s*<div class="sidebar-overlay"[^>]*></div>\s*<script src="js/mobile\.js"></script>'
        if ($content -match $bottomNavPattern) {
            $content = $content -replace $bottomNavPattern, ''
        }
        
        # Add new drawer if not already present
        if (-not $content.Contains("<!-- ========== MOBILE NAVIGATION DRAWER ========== -->")) {
            $content = $content.Replace("</body>", $drawerHtml + "`n</body>")
        }
        
        [System.IO.File]::WriteAllText((Resolve-Path $f).Path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Processed $f"
    } else {
        Write-Host "File not found: $f"
    }
}
Write-Host "Done!"

$files = Get-ChildItem -Path 'c:\Users\PC\Desktop\spin earn website\spintask\*.html' -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $hasFirebase = $false
    foreach($l in $content) { if($l -like '*firebase-app.js*') { $hasFirebase = $true; break } }
    
    if (!$hasFirebase) {
        $found = $false
        foreach($l in $content) { if($l -like '*js/auth.js*' -or $l -like '*js/admin.js*') { $found = $true; break } }
        
        if ($found) {
            Write-Host "Updating $($file.FullName)..."
            $newContent = @()
            $done = $false
            foreach ($line in $content) {
                if (!$done -and ($line -like '*<script src="js/auth.js"></script>*' -or $line -like '*<script src="js/admin.js"></script>*')) {
                    $newContent += '    <!-- Firebase SDK (V8) -->'
                    $newContent += '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>'
                    $newContent += '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>'
                    $newContent += '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>'
                    $newContent += '    <script src="js/firebase-config.js"></script>'
                    $done = $true
                }
                $newContent += $line
            }
            $newContent | Set-Content $file.FullName
        }
    }
}
Write-Host "Batch update complete."

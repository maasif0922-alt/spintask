$path = 'c:\Users\PC\Desktop\spin earn website\spintask\admin-dashboard.html'
$content = Get-Content $path
$newContent = @()
$doneScripts = $false
$doneInit = $false

foreach ($line in $content) {
    if (!$doneScripts -and $line -like '*<script src="js/auth.js"></script>*') {
        $newContent += '    <!-- Firebase SDK (V8) -->'
        $newContent += '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>'
        $newContent += '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>'
        $newContent += '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>'
        $newContent += '    <script src="js/firebase-config.js"></script>'
        $newContent += $line
        $doneScripts = $true
        continue
    }
    
    # Remove existing firebase-config.js if we added it above (it should be around line 12)
    if ($doneScripts -and $line -like '*<script src="js/firebase-config.js"></script>*') {
        continue
    }

    if (!$doneInit -and $line -like '*document.addEventListener(''DOMContentLoaded'', function () {*') {
        $newContent += $line
        $newContent += '            // Initialize Firebase Sync'
        $newContent += '            if (typeof Admin !== ''undefined'' && Admin.initFirebaseSync) {'
        $newContent += '                Admin.initFirebaseSync();'
        $newContent += '            }'
        $newContent += ''
        $newContent += '            // Listen for Real-time Data Sync'
        $newContent += '            window.addEventListener(''admin:dataSynced'', function() {'
        $newContent += '                console.log(''[Admin] Data synced, refreshing UI...'');'
        $newContent += '                renderUsers();'
        $newContent += '                renderDashboard();'
        $newContent += '                renderSendPoints();'
        $newContent += '            });'
        $newContent += ''
        $newContent += '            window.addEventListener(''admin:alertsSynced'', function() {'
        $newContent += '                console.log(''[Admin] Alerts synced, refreshing UI...'');'
        $newContent += '                renderAlerts();'
        $newContent += '                updateAlertBadge();'
        $newContent += '            });'
        $doneInit = $true
        continue
    }

    $newContent += $line
}
$newContent | Set-Content $path

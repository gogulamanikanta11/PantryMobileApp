$git = "C:\Program Files\Git\cmd\git.exe"
$log = "c:\Users\manik\Downloads\PantryMobileApp\scripts\push_log.txt"

"Staging files..." | Out-File -FilePath $log -Encoding ascii
& $git add . 2>&1 | Out-File -FilePath $log -Append -Encoding ascii

"Committing..." | Out-File -FilePath $log -Append -Encoding ascii
& $git commit -m "Implement E2E test fixes and AI integration updates" 2>&1 | Out-File -FilePath $log -Append -Encoding ascii

"Pushing..." | Out-File -FilePath $log -Append -Encoding ascii
& $git push origin main 2>&1 | Out-File -FilePath $log -Append -Encoding ascii

"Complete" | Out-File -FilePath $log -Append -Encoding ascii

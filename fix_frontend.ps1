$content = [System.IO.File]::ReadAllText((Join-Path (Get-Location) 'index.html'))
$idx = $content.IndexOf('</html>')
if ($idx -ge 0) {
    $fixed = $content.Substring(0, $idx + 7)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) 'index.html'), $fixed, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed! Saved $($fixed.Length) chars (was $($content.Length))"
} else {
    Write-Host "ERROR: </html> not found"
}

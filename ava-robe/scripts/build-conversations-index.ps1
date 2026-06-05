# Generates an index/README.md inside claude-conversations listing every conversation file
# with its title and date, sorted by date descending.

param(
    [string]$ConversationsDir = "$PSScriptRoot\..\claude-conversations"
)

$ErrorActionPreference = "Stop"

$files = Get-ChildItem -Path $ConversationsDir -Filter "*.md" -File |
    Where-Object { $_.Name -ne "README.md" } |
    Sort-Object Name -Descending

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# Claude Conversations")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Archive of Claude Code conversations used while building this project (ava-robe).")
[void]$sb.AppendLine("Each file is a single chat session converted from its original JSONL log into Markdown.")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Total conversations: $($files.Count)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Index")
[void]$sb.AppendLine("")

foreach ($f in $files) {
    $firstLine = Get-Content -Path $f.FullName -TotalCount 1 -Encoding UTF8
    $title = $firstLine -replace '^#\s*', ''
    if ([string]::IsNullOrWhiteSpace($title)) { $title = $f.BaseName }

    # Pull the date from the filename prefix (yyyy-MM-dd_HH-mm_)
    $date = ""
    if ($f.Name -match '^(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})_') {
        $date = "$($Matches[1]) $($Matches[2]):$($Matches[3])"
    }

    [void]$sb.AppendLine("- **$date** - [$title]($($f.Name))")
}

Set-Content -Path (Join-Path $ConversationsDir "README.md") -Value $sb.ToString() -Encoding UTF8
Write-Output "Wrote index with $($files.Count) entries."

# Converts Claude Code JSONL conversation logs into clean Markdown files.
# Reads from %USERPROFILE%\.claude\projects\<project-id>\*.jsonl and writes to ./claude-conversations/

param(
    [string]$OutputDir = "$PSScriptRoot\..\claude-conversations"
)

$ErrorActionPreference = "Stop"

$projectDirs = @(
    "$env:USERPROFILE\.claude\projects\C--Users-rinaz-Desktop-finalwork-finalwork-3Dgame-ava-robe",
    "$env:USERPROFILE\.claude\projects\c--Users-rinaz-Desktop-finalwork-finalwork"
)

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

function Get-TextFromContent {
    param($content)
    if ($null -eq $content) { return "" }
    if ($content -is [string]) { return $content }
    if ($content -is [System.Array] -or $content.GetType().Name -eq 'Object[]') {
        $parts = @()
        foreach ($block in $content) {
            if ($block.type -eq 'text' -and $block.text) {
                $parts += $block.text
            } elseif ($block.type -eq 'tool_use') {
                $parts += "_(tool: $($block.name))_"
            } elseif ($block.type -eq 'tool_result') {
                # Skip tool results to keep markdown readable
            }
        }
        return ($parts -join "`n`n")
    }
    return ""
}

function Convert-Jsonl {
    param(
        [string]$JsonlPath,
        [string]$OutputDir
    )

    $sessionId = [System.IO.Path]::GetFileNameWithoutExtension($JsonlPath)
    $lines = Get-Content -Path $JsonlPath -Encoding UTF8

    $messages = @()
    $firstUserMsg = ""
    $startTime = $null
    $endTime = $null

    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try {
            $obj = $line | ConvertFrom-Json -ErrorAction Stop
        } catch {
            continue
        }

        if ($obj.type -ne 'user' -and $obj.type -ne 'assistant') { continue }
        if ($obj.isSidechain) { continue }
        if (-not $obj.message) { continue }

        $text = Get-TextFromContent -content $obj.message.content
        if ([string]::IsNullOrWhiteSpace($text)) { continue }

        # Filter out system reminder pollution from user messages
        if ($obj.type -eq 'user') {
            $text = $text -replace '(?s)<system-reminder>.*?</system-reminder>', ''
            $text = $text -replace '(?s)<command-name>.*?</command-stderr>', ''
            $text = $text.Trim()
            if ([string]::IsNullOrWhiteSpace($text)) { continue }

            if ([string]::IsNullOrWhiteSpace($firstUserMsg)) {
                $firstUserMsg = $text
            }
        }

        if ($null -eq $startTime -and $obj.timestamp) { $startTime = $obj.timestamp }
        if ($obj.timestamp) { $endTime = $obj.timestamp }

        $messages += [PSCustomObject]@{
            Role = $obj.type
            Text = $text
            Timestamp = $obj.timestamp
        }
    }

    if ($messages.Count -eq 0) { return $null }

    # Build a short title from the first user message (max ~60 chars)
    $title = $firstUserMsg -replace '\s+', ' '
    if ($title.Length -gt 60) {
        $title = $title.Substring(0, 60).Trim() + "..."
    }
    if ([string]::IsNullOrWhiteSpace($title)) {
        $title = "Conversation $sessionId"
    }

    # Build a safe filename
    $datePrefix = ""
    if ($startTime) {
        try {
            $dt = [DateTime]::Parse($startTime)
            $datePrefix = $dt.ToString("yyyy-MM-dd_HH-mm") + "_"
        } catch {}
    }

    $slug = $firstUserMsg -replace '[^a-zA-Z0-9\s-]', '' -replace '\s+', '-'
    if ($slug.Length -gt 40) { $slug = $slug.Substring(0, 40) }
    $slug = $slug.Trim('-').ToLower()
    if ([string]::IsNullOrWhiteSpace($slug)) { $slug = $sessionId.Substring(0, 8) }

    $fileName = "$datePrefix$slug.md"
    $outPath = Join-Path $OutputDir $fileName

    # Handle filename collisions
    $counter = 1
    while (Test-Path $outPath) {
        $fileName = "$datePrefix$slug-$counter.md"
        $outPath = Join-Path $OutputDir $fileName
        $counter++
    }

    # Build markdown
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# $title")
    [void]$sb.AppendLine("")
    if ($startTime) { [void]$sb.AppendLine("**Date:** $startTime") }
    [void]$sb.AppendLine("**Session ID:** ``$sessionId``")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")

    foreach ($msg in $messages) {
        if ($msg.Role -eq 'user') {
            [void]$sb.AppendLine("## User")
        } else {
            [void]$sb.AppendLine("## Assistant")
        }
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine($msg.Text)
        [void]$sb.AppendLine("")
    }

    Set-Content -Path $outPath -Value $sb.ToString() -Encoding UTF8
    return $fileName
}

$converted = @()
foreach ($dir in $projectDirs) {
    if (-not (Test-Path $dir)) { continue }
    $jsonlFiles = Get-ChildItem -Path $dir -Filter "*.jsonl" -File
    foreach ($f in $jsonlFiles) {
        try {
            $result = Convert-Jsonl -JsonlPath $f.FullName -OutputDir $OutputDir
            if ($result) {
                $converted += $result
                Write-Output "Converted: $($f.Name) -> $result"
            } else {
                Write-Output "Skipped (empty): $($f.Name)"
            }
        } catch {
            Write-Output "Error converting $($f.Name): $($_.Exception.Message)"
        }
    }
}

Write-Output ""
Write-Output "Done. Converted $($converted.Count) conversations into $OutputDir"

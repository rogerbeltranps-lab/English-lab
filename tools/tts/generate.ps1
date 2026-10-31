# Generates the raw ElevenLabs clips for a jobs file (tools/tts/build-jobs.js) on Roger's PC, then zips them.
#   powershell -ExecutionPolicy Bypass -File tools\tts\generate.ps1 -Jobs tools\tts\jobs-2eso-lp6.json -Out C:\Developer\tts-raw\2eso-lp6
# The key is the Windows user variable ELEVENLABS_API_KEY (never in the repo). A clip that already exists is skipped,
# so a rerun after an error does not spend credits twice. Prints the credits used before and after.
param([Parameter(Mandatory)][string]$Jobs, [Parameter(Mandatory)][string]$Out, [string]$Model = 'eleven_v3')
$ErrorActionPreference = 'Stop'
$key = [Environment]::GetEnvironmentVariable('ELEVENLABS_API_KEY', 'User')
if (-not $key) { throw 'ELEVENLABS_API_KEY (user variable) is not set' }
$h = @{ 'xi-api-key' = $key }
function Credits { $s = Invoke-RestMethod -Uri 'https://api.elevenlabs.io/v1/user/subscription' -Headers $h; "$($s.tier): $($s.character_count) / $($s.character_limit) used" }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
Write-Host ('Before: ' + (Credits))
$list = Get-Content -Raw -Encoding UTF8 $Jobs | ConvertFrom-Json
$n = 0
foreach ($j in $list) {
  $f = Join-Path $Out ($j.id + '.mp3')
  if (Test-Path $f) { continue }
  $body = @{ text = $j.text; model_id = $Model } | ConvertTo-Json -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($body)
  for ($try = 1; $try -le 3; $try++) {
    try {
      Invoke-WebRequest -Uri ("https://api.elevenlabs.io/v1/text-to-speech/$($j.voice_id)?output_format=mp3_44100_128") -Method Post -Headers $h -ContentType 'application/json; charset=utf-8' -Body $bytes -OutFile $f -UseBasicParsing
      break
    } catch { if ($try -eq 3) { throw }; Start-Sleep -Seconds (2 * $try) }
  }
  $n++; Write-Host "$n  $($j.voice)  $($j.text)"
}
Write-Host ('After:  ' + (Credits))
$zip = "$Out.zip"; if (Test-Path $zip) { Remove-Item $zip }
Compress-Archive -Path (Join-Path $Out '*.mp3') -DestinationPath $zip
Write-Host "Zip: $zip"

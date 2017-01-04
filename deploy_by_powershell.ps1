$workName           = "OracleStackObservation"
$webServiceName     = "front"
$queryServiceName   = "query"
$sshServiceName     = "ssh"
$nginxServiceName   = "nginx"
$configServiceName  = "config"
$buildServiceName   = "build"

$rootDir            = "/opt" 
$workDir            = $rootDir + "/" + $workName

function createService([string]$name) {
  if (Test-Path -Path $name -PathType Container) {
    Set-Location $name
    git pull
  } else {
    git clone --depth=1 -b $name https://github.com/shinhwagk/OracleStackObservation $name
  }
  Set-Location $workDir
}

if (Test-Path -Path $workDir -PathType Container) {} else {
  Set-Location $rootDir
  git clone --depth=1 -b $buildServiceName https://github.com/shinhwagk/OracleStackObservation $name
}

createService $webServiceName
createService $queryServiceName
createService $sshServiceName
createService $nginxServiceName
createService $configServiceName
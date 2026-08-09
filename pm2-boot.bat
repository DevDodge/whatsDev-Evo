@echo off
REM Boot hook for the dk.whatsdeveloper.com stack (F:\whatsDev-Evo).
REM Registered as the Scheduled Task "dkevo-pm2-boot", runs at system startup.
REM
REM Scope note: this starts ONLY this project's ecosystem, not every app in the
REM shared pm2 dump. Other projects on this box are deliberately left alone.
REM
REM Manual use:  pm2-boot.bat
REM Remove task: schtasks /delete /tn "dkevo-pm2-boot" /f

REM ------------------------------------------------------------------
REM PM2_HOME is NOT optional here.
REM
REM The task runs as SYSTEM. Without this, pm2 resolves its home to
REM C:\Windows\System32\config\systemprofile\.pm2 and spins up a SECOND,
REM separate daemon. That daemon would bind 2345/55453 invisibly, and the
REM next `pm2 list` / START.bat run as Administrator would see nothing
REM running, try to start again, and fail with EADDRINUSE.
REM
REM Pointing at the Administrator store keeps ONE daemon for this box.
REM ------------------------------------------------------------------
set "PM2_HOME=C:\Users\Administrator\.pm2"
set "PM2=C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd"
set "LOG=F:\whatsDev-Evo\logs\pm2-boot.log"

if not exist "F:\whatsDev-Evo\logs" mkdir "F:\whatsDev-Evo\logs"

REM pm2 talks to a daemon; on a cold boot it may need a moment before the
REM network stack and disks are ready. Give it a short grace period.
REM
REM NOTE: do not use `timeout` here. It needs a console input handle, which a
REM non-interactive SYSTEM session does not have, and the whole script dies
REM with 0xC0000142 (STATUS_DLL_INIT_FAILED) before writing a single log line.
REM `ping` needs no console and is the standard batch sleep on Windows.
ping -n 21 127.0.0.1 >nul 2>&1

echo [%date% %time%] --- pm2-boot start (PM2_HOME=%PM2_HOME%) --- >> "%LOG%"

REM startOrReload, not start: starts what is down, reloads what is already
REM up. Safe to run twice, so a manual run never errors with
REM "Script already launched".
call "%PM2%" startOrReload "F:\whatsDev-Evo\ecosystem.config.js" >> "%LOG%" 2>&1
call "%PM2%" save >> "%LOG%" 2>&1

echo [%date% %time%] --- pm2-boot done --- >> "%LOG%"
exit /b 0

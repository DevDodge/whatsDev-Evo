# ✅ Start Script - Auto Port Cleanup

## New Features:

1. ✅ **Auto-kills processes** on ports 2345, 3456, 4567, 4568
2. ✅ **Waits 3 seconds** after cleanup
3. ✅ **Increased wait time** between services (10 seconds)
4. ✅ **Clean start** every time

---

## How It Works:

### Before Starting:
1. Checks ports 2345, 3456, 4567, 4568
2. Kills any process using these ports
3. Waits 3 seconds
4. Confirms "Ports cleared"

### Then Starts:
1. Evolution API (waits 10s)
2. Backend API (waits 10s)
3. Manager UI

---

## Usage:

Double-click `start-all.bat`

No need to manually stop services first - the script does it automatically!

---

## URLs After Start:

- Evolution API: http://localhost:2345
- Backend API: http://localhost:3456
- Manager UI: http://localhost:4567
- Domain: https://dk.whatsdeveloper.com/

---

Ready to test! 🚀

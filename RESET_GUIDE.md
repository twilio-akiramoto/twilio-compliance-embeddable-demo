# Reset Demo Guide

This guide explains how to reset the Twilio Compliance Embeddable Demo to its initial state.

## 🎯 Why Reset?

Reset the demo when you need to:
- Clear all test data and start fresh
- Fix database corruption issues
- Demonstrate the onboarding flow from scratch
- Reset to default test users after modifications

## 🔄 Reset Methods

### Method 1: Script (Recommended)

**Basic Reset (stops services, cleans database):**
```bash
./reset-db.sh
```

**Reset + Auto-Restart ISV Demo:**
```bash
./reset-db.sh --restart
```

**Reset + Auto-Restart All Apps:**
```bash
./reset-db.sh --restart --all
```

### Method 2: CSM Dashboard UI

1. Start the demo: `./start.sh --all`
2. Open CSM Dashboard: http://localhost:3030
3. Login with: `csm@test.com` / `password123`
4. Click **"🔄 Reset Demo"** button in the header
5. Confirm the action
6. ✅ Database reset without restarting servers

### Method 3: Manual

```bash
# Stop all services
./stop.sh

# Remove database and logs
rm -f backend/database.sqlite
rm -f logs/*.log

# Restart
./start.sh --all
```

## 📋 What Gets Reset?

| Item | Reset Script | UI Button | Manual |
|------|-------------|-----------|--------|
| All customers | ✅ | ✅ | ✅ |
| All registrations | ✅ | ✅ | ✅ |
| All users (except test) | ✅ | ✅ | ✅ |
| Test users recreated | ✅ | ✅ | ✅ |
| Log files | ✅ | ❌ | ✅ |
| Running services | Stopped | Running | Stopped |

## 👥 Default Test Users

After reset, these credentials are available:

**CSM Dashboard:**
- Email: `csm@test.com`
- Password: `password123`
- Role: CSM (Customer Success Manager)

**Customer Portal:**
- Email: `customer@test.com`
- Password: `customer123`
- Role: Customer
- Business: Acme Corporation

## 🛡️ Safety Features

### Confirmation Dialog (UI Reset)

The UI reset button shows a confirmation dialog:

```
⚠️ Are you sure you want to reset the demo?

This will:
- Delete all customers and registrations
- Reset to test users (csm@test.com, customer@test.com)
- Clear all demo data

This action cannot be undone.
```

### No Accidental Resets

- Reset script requires explicit execution (`./reset-db.sh`)
- UI button requires confirmation click
- Database files are not in git, so `git reset` won't affect data

## 🐛 Troubleshooting Reset Issues

### "Failed to remove database"

**Cause:** Database file is locked by a running process

**Solution:**
```bash
./stop.sh
lsof | grep database.sqlite  # Find processes using the file
kill <PID>  # Kill the process
./reset-db.sh --restart --all
```

### Backend fails to start after reset

**Cause:** Port already in use

**Solution:**
```bash
lsof -ti:3011 | xargs kill -9
./start.sh --all
```

### "Database reset successfully" but data still exists

**Cause:** Using UI reset while multiple backend instances are running

**Solution:**
```bash
./stop.sh
./reset-db.sh --restart --all
```

## 📊 Reset Logs

Check reset operation logs:

```bash
# Backend startup logs (shows seed creation)
tail -f logs/backend.log

# Look for these messages:
# 🌱 Seeding database...
# ✅ Created CSM user: csm@test.com / password123
# ✅ Created test customer: customer@test.com / customer123
# 🎉 Seed completed successfully!
```

## 🎓 Best Practices

1. **Before demos:** Reset to ensure clean state
2. **After testing:** Reset to remove test data
3. **During development:** Use `--restart` flag for faster iteration
4. **Production:** Never use these reset scripts (they delete all data!)

## 💡 Tips

- Use `./reset-db.sh --restart --all` for fastest full reset
- Use UI button when you want to keep servers running
- Use `./stop.sh` first if reset script fails
- Check `./status.sh` after reset to verify services

## ⚠️ Important Notes

- **Data Loss:** Reset permanently deletes all customers, registrations, and custom users
- **Not Reversible:** No backup is created before reset
- **Development Only:** These tools are for demo/development purposes
- **Production Warning:** Never run reset scripts on production databases

## 🔗 Related Scripts

- `./start.sh` - Start ISV demo
- `./start.sh --all` - Start all applications
- `./stop.sh` - Stop all services
- `./status.sh` - Check service status
- `./reset-db.sh` - Reset database (this guide)

## 📞 Support

If you encounter issues with reset:

1. Check logs: `tail -f logs/backend.log`
2. Verify all services stopped: `./status.sh`
3. Try manual reset method (Method 3)
4. Restart your terminal and try again

For Twilio-specific issues, visit: https://support.twilio.com

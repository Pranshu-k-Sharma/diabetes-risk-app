# Using GitHub Codespaces

## What is GitHub Codespaces?
It's VS Code running in your browser. No installation needed. It has everything: Python, Node.js, your code, all pre-installed.

## How to set it up (one-time)

1. **Push this repo to GitHub** (public or private)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/diabetes-risk-app.git
   git push -u origin main
   ```

2. **On GitHub, click `Code` button**
   - Look for the green button that says `Code`
   - Click the `Codespaces` tab
   - Click `Create codespace on main`

3. **Wait 2-3 minutes** while it installs everything

## How to run the app (every time)

Once Codespaces is open:

```bash
# Open TWO terminals (or split one terminal)

# Terminal 1: Backend
python app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

That's it. VS Code will show you a notification with the ports.

Click the link for port 5173 (the frontend).

## Share with others

Anyone can run it with just the GitHub link:
```
https://github.com/YOUR_USERNAME/diabetes-risk-app
```

They click `Code > Codespaces > Create codespace` and it works instantly.

## Notes
- First load takes 2-3 minutes
- Subsequent loads are faster
- GitHub gives you free hours per month (plenty for this project)
- You can stop the codespace at any time to save resources

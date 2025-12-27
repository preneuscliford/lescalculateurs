# 🔄 Git & Deployment Guide - Site Health Fixes

## 📋 Pre-Commit Checklist

- [ ] All local changes committed
- [ ] No uncommitted changes in working directory
- [ ] `npm run build` runs successfully
- [ ] `node scripts/health-check.js` runs without errors
- [ ] All 132 HTML files are modified (verified with `git status`)
- [ ] `.htaccess` has 75 lines (+72 from original)
- [ ] `llms.txt` exists in `/public/`

## 🔄 Git Workflow

### Option 1: Single Commit (Recommended)

```bash
# Stage all changes
git add .

# Commit with comprehensive message
git commit -m \"fix: Complete site health corrections (85 issues)

SUMMARY:
- Create llms.txt for AI search engines
- Enhance .htaccess with 301 redirects & compression
- Normalize 132 HTML files (remove .html from JSON-LD)
- Add 7 analysis scripts for monitoring
- Add comprehensive documentation

FIXES:
- 73 sitemap URL errors
- 4 structured data invalid items
- 7 temporary redirects (302/307)
- 31 improper permanent redirects

METRICS:
- Files created: 14
- Files modified: 134
- Total changes: +2346 lines
- Backward compatible: Yes\"

# Push
git push origin main
```

### Option 2: Multiple Commits (More detailed)

```bash
# Commit 1: Core infrastructure fixes
git add public/.htaccess public/llms.txt public/sitemap.xml
git commit -m \"fix: core infrastructure - htaccess, llms.txt, sitemap

- Enhance .htaccess with 301 redirects (not 302)
- Add GZIP compression
- Add security headers
- Create llms.txt for AI search engines
- Normalize sitemap URLs\"

# Commit 2: HTML fixes
git add src/pages/
git commit -m \"fix: normalize 132 HTML files - remove .html from JSON-LD

- Remove .html from JSON-LD item/url properties
- Replace /index.html with / in breadcrumbs
- Fix Open Graph tags
- Fix meta canonical tags
- Ensure 100% valid structured data\"

# Commit 3: Scripts
git add scripts/
git commit -m \"feat: add analysis scripts for site health monitoring

- health-check.js: Complete health analysis
- analyze-wordcount.js: Content analysis
- analyze-h1-tags.js: H1 validation
- analyze-internal-links.js: Link structure
- analyze-compression.js: Minification check
- fix-sitemap.js: Sitemap correction
- fix-jsonld-urls.js: JSON-LD correction\"

# Commit 4: Documentation
git add *.md *.sh
git commit -m \"docs: comprehensive site health documentation

- SITE-HEALTH-EXECUTIVE.md: Executive summary
- SITE-HEALTH-README.md: Complete guide
- SITE-HEALTH-TECHNICAL.md: Technical details
- SITE-HEALTH-CHECKLIST.md: Deployment checklist
- SITE-HEALTH-FIX-SUMMARY.md: Fix summary
- FILES-CHANGED.md: Change details
- SEO-IMPACT-ANALYSIS.md: SEO impact
- INDEX.md: Documentation index
- TOOLS.sh: Quick reference
- This file: Deployment guide\"

# Push all commits
git push origin main
```

## 🚀 Deployment Steps

### Step 1: Pre-Deployment (15 minutes)

```bash
# 1. Get latest code
git pull origin main

# 2. Install/update dependencies
npm ci  # or npm install

# 3. Run tests
npm run build
node scripts/health-check.js

# 4. Verify no errors
echo \"✅ Build successful\"
```

### Step 2: Build (10 minutes)

```bash
# 1. Clean previous build
rm -rf dist/

# 2. Build
npm run build

# 3. Verify output
ls -la dist/ | head -20
ls -la public/llms.txt
```

### Step 3: Deploy (10 minutes)

```bash
# Option A: Manual copy
cp -r dist/* /path/to/production/
cp public/llms.txt /path/to/production/public/

# Option B: Using rsync
rsync -avz dist/ user@server:/var/www/html/

# Option C: Using deployment platform
# (GitHub Pages, Netlify, Vercel, etc - follow their guides)
```

### Step 4: Verify (10 minutes)

```bash
# 1. Test main URLs
curl -I https://www.lescalculateurs.fr/
curl -I https://www.lescalculateurs.fr/pages/notaire

# 2. Test redirects
curl -I https://www.lescalculateurs.fr/pages/charges.html
# Should see: HTTP/2 301

# 3. Test llms.txt
curl https://www.lescalculateurs.fr/llms.txt
# Should see file content

# 4. Test JSON-LD (copy source, validate online)
curl https://www.lescalculateurs.fr/pages/ik | head -200
# Verify no .html in JSON-LD
```

## ⚙️ GitHub Actions / CI/CD (Optional)

### If using GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy Site Health Fixes

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Health Check
        run: node scripts/health-check.js

      - name: Deploy
        run: |
          # Your deployment command here
          echo \"Deploying...\"

      - name: Verify
        run: |
          curl -f https://www.lescalculateurs.fr/llms.txt
          echo \"✅ Deployment verified\"
```

## 🔍 Post-Deployment Verification

### Immediate (within 1 hour)

```bash
# 1. Test production URLs
curl -I https://www.lescalculateurs.fr/pages/charges.html
# Expected: 301 (not 302)

curl -I https://www.lescalculateurs.fr/pages/charges
# Expected: 200

# 2. Test llms.txt
curl https://www.lescalculateurs.fr/llms.txt | head -5
# Expected: File content

# 3. Test JSON-LD
curl https://www.lescalculateurs.fr/pages/notaire | grep -A10 'BreadcrumbList'
# Expected: No .html in URLs
```

### Short-term (within 24 hours)

```bash
# 1. Check Google Search Console
# - Navigate to Coverage
# - Verify \"Valid\" count increased
# - Verify \"Invalid\" count = 0

# 2. Test with Google tools
# - Rich Results Test: https://search.google.com/test/rich-results
# - Schema Validator: https://validator.schema.org/

# 3. Monitor crawl errors
# - Check for new errors
# - Verify old errors gone
```

### Long-term (within 1 week)

```bash
# 1. Monitor Search Console
# - Impressions
# - Click-through rate
# - Average position

# 2. Check organic traffic
# - Analytics/Matomo
# - Look for any drops (should see increases)

# 3. Verify rankings
# - Check top keywords
# - Verify no drops
```

## 🚨 Rollback Procedure

### If something goes wrong:

#### Quick Rollback

```bash
# 1. Identify the bad commit
git log --oneline -n 10

# 2. Revert (doesn't delete history, creates new commit)
git revert <commit-hash>

# 3. Push
git push origin main

# 4. Redeploy
npm run build
# Deploy again
```

#### Full Rollback

```bash
# 1. Go back to previous version
git reset --hard <previous-commit-hash>

# 2. Force push (be careful!)
git push origin main --force

# 3. Redeploy previous version
npm run build
# Deploy again
```

#### Verify Rollback

```bash
# Confirm we're back to old version
curl https://www.lescalculateurs.fr/llms.txt
# Should return 404 if rolled back

git log --oneline -n 3
# Should show revert commit
```

## 📊 Monitoring Post-Deployment

### Daily (First 1 week)

```bash
# Run health check
node scripts/health-check.js

# Check Google Search Console
# - Any new errors?
# - Crawl stats normal?

# Check analytics
# - Any traffic anomalies?
# - Performance normal?
```

### Weekly (Ongoing)

```bash
# Run full analysis
node scripts/health-check.js

# Review metrics
# - Site Health score
# - Organic traffic trend
# - Keyword rankings

# Update internal tracking
# - Spreadsheet
# - Dashboard
# - Reports
```

### Monthly (Ongoing)

```bash
# Comprehensive review
# 1. Check all metrics
# 2. Compare with baseline
# 3. Document improvements
# 4. Plan next optimizations
```

## 📋 Deployment Checklist

### Before Pushing

- [ ] `git status` shows expected changes
- [ ] `npm run build` succeeds
- [ ] `node scripts/health-check.js` runs
- [ ] No lint errors
- [ ] All tests pass (if any)

### Before Deploying

- [ ] Latest code pulled
- [ ] Branch is up to date
- [ ] No conflicts
- [ ] PR approved (if using)
- [ ] Backup taken

### During Deployment

- [ ] Build completes without errors
- [ ] Files copied correctly
- [ ] No file permission issues
- [ ] Server responds correctly

### After Deployment

- [ ] llms.txt accessible (200 OK)
- [ ] Redirects working (301)
- [ ] JSON-LD valid
- [ ] No 500 errors
- [ ] Database connections ok (if any)

### Next 24 Hours

- [ ] Monitor error logs
- [ ] Check Search Console
- [ ] Verify analytics
- [ ] Monitor traffic
- [ ] Check for user reports

## 🔐 Security Considerations

### No Security Concerns

```
✅ No passwords added
✅ No secrets exposed
✅ No dependency changes
✅ No new vulnerabilities
✅ All changes peer-reviewed
✅ Backward compatible
```

### Security Best Practices

```
✅ No sensitive data in .htaccess
✅ No credentials in configs
✅ HTTPS enforced (HSTS header)
✅ Security headers added
✅ No SQL injection risks
✅ No XSS vulnerabilities
```

## 💡 Tips & Tricks

### Quick Verification

```bash
# Check all important files exist
[[ -f public/llms.txt ]] && echo \"✅ llms.txt exists\"
[[ -f public/.htaccess ]] && echo \"✅ .htaccess exists\"
[[ -d dist/ ]] && echo \"✅ dist/ built\"

# Count modified files
git diff --name-only | wc -l
# Should be ~134
```

### Undo Local Changes

```bash
# Undo all changes (careful!)
git checkout .

# Undo specific file
git checkout src/pages/notaire.html
```

### See What Changed

```bash
# See diff for specific file
git diff src/pages/ik.html

# See all changed files
git diff --name-only

# See summary of changes
git diff --stat
```

### Create a Test Branch

```bash
# Create branch to test
git checkout -b feature/test-site-health

# Make changes
# Test locally
npm run build && node scripts/health-check.js

# If good, merge to main
git checkout main
git merge feature/test-site-health

# Delete test branch
git branch -d feature/test-site-health
```

---

## 🎯 Quick Command Reference

```bash
# Prepare
git pull origin main
npm ci
npm run build

# Verify
node scripts/health-check.js

# Commit
git add .
git commit -m \"fix: site health fixes\"

# Push
git push origin main

# Deploy
# (Your deployment command here)

# Monitor
curl -I https://www.lescalculateurs.fr/llms.txt
```

---

**Document**: Git & Deployment Guide  
**Created**: 27 December 2025  
**Status**: ✅ READY FOR DEPLOYMENT

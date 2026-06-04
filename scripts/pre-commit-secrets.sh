#!/usr/bin/env bash
# Pre-commit hook: scan staged files for accidentally committed secrets
# Install: copy to .git/hooks/pre-commit and chmod +x

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo "🔍 Scanning for secrets..."

# Get list of staged files (exclude deleted)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✓ No staged files to scan${NC}"
    exit 0
fi

FOUND_SECRETS=0

# Patterns to detect common secrets
PATTERNS=(
    # Generic API keys
    'api[_-]?key\s*[:=]\s*["\x27][A-Za-z0-9]{20,}'
    # AWS keys
    '(AKIA|ASIA)[A-Z0-9]{16}'
    # AWS secret keys
    'aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*["\x27][A-Za-z0-9/+=]{40}'
    # Supabase keys
    'SUPABASE_KEY\s*=\s*["\x27]?eyJ[A-Za-z0-9_-]{20,}'
    'SUPABASE_SERVICE_ROLE_KEY\s*=\s*["\x27]?eyJ[A-Za-z0-9_-]{20,}'
    # JWT tokens
    'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
    # GitHub tokens
    'ghp_[A-Za-z0-9]{36}'
    'gho_[A-Za-z0-9]{36}'
    'github_pat_[A-Za-z0-9]{22}_[A-Za-z0-9]{59}'
    # Google API keys
    'AIza[A-Za-z0-9_-]{35}'
    # Generic tokens/passwords in env
    '(SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*["\x27]?[A-Za-z0-9+/=_-]{20,}'
    # Private keys
    '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'
    # Stripe keys
    'sk_(live|test)_[A-Za-z0-9]{24,}'
    # SendGrid keys
    'SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}'
)

# Files to always skip (known safe)
SKIP_FILES=(
    ".git/hooks/pre-commit-secrets"
    "scripts/pre-commit-secrets.sh"
    "*.example"
    "*.sample"
    "*.template"
    "*.md"
    "*.lock"
)

for file in $STAGED_FILES; do
    # Skip known-safe file patterns
    SKIP=0
    for pattern in "${SKIP_FILES[@]}"; do
        if [[ "$file" == $pattern ]]; then
            SKIP=1
            break
        fi
    done
    [ $SKIP -eq 1 ] && continue

    # Skip if file doesn't exist (renamed/deleted edge case)
    [ ! -f "$file" ] && continue

    CONTENT=$(git show ":$file" 2>/dev/null || true)
    [ -z "$CONTENT" ] && continue

    for pattern in "${PATTERNS[@]}"; do
        if echo "$CONTENT" | grep -qEi -e "$pattern"; then
            echo -e "${RED}✗ Potential secret found in: ${file}${NC}"
            echo -e "  Pattern: ${YELLOW}$pattern${NC}"
            FOUND_SECRETS=1
        fi
    done
done

if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo -e "${RED}🛑 Commit blocked! Remove secrets before committing.${NC}"
    echo -e "  - Use environment variables (.env files, already gitignored)"
    echo -e "  - Use .env.example for documenting required variables"
    echo -e "  - To bypass (NOT recommended): git commit --no-verify"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ No secrets detected${NC}"
exit 0

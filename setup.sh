#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   Chhkwa News - CMS Setup Verification       ║"
echo "╔═══════════════════════════════════════════════╗"
echo -e "${NC}"

# Check if node_modules exists
echo -e "\n${YELLOW}1. Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Dependencies not found. Running npm install...${NC}"
    npm install
fi

# Check if .env.local exists
echo -e "\n${YELLOW}2. Checking environment variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local file exists${NC}"
    
    # Check if the file has the required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && \
       grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local && \
       grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo -e "${GREEN}✓ All required environment variables found${NC}"
    else
        echo -e "${RED}✗ Missing some environment variables${NC}"
    fi
else
    echo -e "${RED}✗ .env.local file not found${NC}"
    echo -e "${YELLOW}  Please create .env.local with your Supabase credentials${NC}"
fi

# Check if supabase-schema.sql exists
echo -e "\n${YELLOW}3. Checking database schema file...${NC}"
if [ -f "supabase-schema.sql" ]; then
    echo -e "${GREEN}✓ Database schema file found${NC}"
else
    echo -e "${RED}✗ supabase-schema.sql not found${NC}"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}IMPORTANT SETUP STEPS:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Before starting the dev server, you MUST:${NC}"
echo ""
echo -e "1. ${RED}Run the SQL schema in Supabase:${NC}"
echo -e "   • Go to: ${BLUE}https://sgnqnllnnhhrzvdwwktz.supabase.co${NC}"
echo -e "   • Navigate to ${GREEN}SQL Editor${NC}"
echo -e "   • Copy contents of ${GREEN}supabase-schema.sql${NC}"
echo -e "   • Paste and run in SQL Editor"
echo ""
echo -e "2. ${GREEN}Start the development server:${NC}"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo -e "3. ${GREEN}Access the admin panel:${NC}"
echo -e "   • URL: ${BLUE}http://localhost:3000/admin${NC}"
echo -e "   • Username: ${GREEN}admin${NC}"
echo -e "   • Password: ${GREEN}pass@123${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Quick Links:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "📖 Setup Guide:      ${GREEN}SETUP.md${NC}"
echo -e "🗄️  Database Schema:  ${GREEN}supabase-schema.sql${NC}"
echo -e "🌐 Supabase URL:     ${BLUE}https://sgnqnllnnhhrzvdwwktz.supabase.co${NC}"
echo ""

# Offer to start dev server
echo -e "${YELLOW}Would you like to start the development server now? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "\n${GREEN}Starting development server...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"
    npm run dev
else
    echo -e "\n${BLUE}Run 'npm run dev' when you're ready to start!${NC}"
fi

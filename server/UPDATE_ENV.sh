#!/bin/bash
# Script to help update .env file with correct Supabase connection string

echo "=========================================="
echo "Supabase Connection String Helper"
echo "=========================================="
echo ""
echo "Your current DATABASE_URL uses https:// which is incorrect."
echo "You need a PostgreSQL connection string that starts with postgresql://"
echo ""
echo "To get your connection string:"
echo "1. Go to your Supabase project: https://supabase.com/dashboard/project/gbkousybqfubewjmrqld"
echo "2. Click Settings (gear icon) → Database"
echo "3. Scroll to 'Connection string' section"
echo "4. Select 'URI' tab"
echo "5. Copy the connection string"
echo ""
echo "The connection string should look like:"
echo "postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
echo ""
echo "Once you have it, update your .env file manually or run:"
echo "nano .env"
echo ""
echo "Make sure DATABASE_URL starts with 'postgresql://' not 'https://'"
echo "=========================================="







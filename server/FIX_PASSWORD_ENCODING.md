# Fix Password Encoding in Connection String

## The Problem

Your password `!1Josephine@1948` contains special characters that need to be URL-encoded in the connection string. The `@` symbol is being interpreted as the separator between credentials and hostname.

## The Solution

You need to URL-encode special characters in your password:

- `@` becomes `%40`
- `!` can stay as `!` or be encoded as `%21`
- Other special characters may also need encoding

### Your Current Connection String:
```
postgresql://postgres.gbkousybqfubewjmrqld:!1Josephine@1948@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### Fixed Connection String:
```
postgresql://postgres.gbkousybqfubewjmrqld:!1Josephine%401948@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

Notice: `@1948` became `%401948`

## Update Your .env File

1. Open your `.env` file:
   ```bash
   cd server
   nano .env
   ```

2. Update the DATABASE_URL line to:
   ```env
   DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:!1Josephine%401948@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
   ```

3. Save and try the migration again:
   ```bash
   npm run prisma:migrate
   ```

## Alternative: Use Connection Pooling (Recommended)

For Supabase, you might also want to try the pooled connection format. Update your `.env`:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:!1Josephine%401948@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Note: Port 6543 is for pooled connections (better for production), but for migrations you might need port 5432.

## URL Encoding Reference

Common special characters that need encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- ` ` (space) → `%20` or `+`

## Quick Fix Command

You can also use this command to update it (be careful with special characters in terminal):

```bash
cd server
sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:!1Josephine%401948@aws-0-us-west-1.pooler.supabase.com:5432/postgres"|' .env
```

Then verify:
```bash
cat .env | grep DATABASE_URL
```






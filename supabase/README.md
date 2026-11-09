# Supabase schema

The six production tables, policies, helper functions, audit triggers and indexes are **already installed** in project `zatngqezscflkxzmsmxt`. Do not run a duplicate schema migration.

Private one-time data migration is delivered separately from the source archive to avoid leaking employee data into a public GitHub repository. Consult the main README for setup.

The existing public function `rls_auto_enable()` was not removed, but EXECUTE privileges for PUBLIC, anon and authenticated were revoked after Supabase's Security Advisor flagged it.

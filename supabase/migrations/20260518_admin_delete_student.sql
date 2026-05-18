-- Deletes a student row AND the linked Supabase Auth user atomically.
--
-- Why this exists: plain `DELETE FROM students` leaves the row in
-- `auth.users` behind, which then blocks re-registering the same email
-- with "A user with this email address has already been registered".
--
-- Run this in Supabase Dashboard -> SQL Editor (one-time).
--
-- Authorization: caller must be an active admin (`admin_users.deleted_at IS
-- NULL`) for the same prodi as the target student. SECURITY DEFINER lets
-- the function delete from `auth.users` even though the caller (the
-- `authenticated` role) does not have privileges on the auth schema; the
-- function itself enforces the access check before doing anything.

create or replace function public.admin_delete_student(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_student_user_id   uuid;
  v_student_prodi_id  uuid;
  v_caller_prodi_id   uuid;
begin
  -- Look up the target student.
  select user_id, prodi_id
    into v_student_user_id, v_student_prodi_id
  from public.students
  where id = p_student_id;

  if not found then
    raise exception 'Mahasiswa tidak ditemukan.';
  end if;

  -- Authorize: caller must be an active admin for the same prodi.
  select prodi_id
    into v_caller_prodi_id
  from public.admin_users
  where user_id = auth.uid()
    and deleted_at is null
  limit 1;

  if v_caller_prodi_id is null then
    raise exception 'Hanya admin yang dapat menghapus mahasiswa.';
  end if;

  if v_caller_prodi_id is distinct from v_student_prodi_id then
    raise exception 'Mahasiswa ini bukan dari prodi Anda.';
  end if;

  -- Delete the auth user first. If the FK from students.user_id to
  -- auth.users.id has ON DELETE CASCADE, the students row goes with it;
  -- otherwise the explicit delete below handles it.
  if v_student_user_id is not null then
    delete from auth.users where id = v_student_user_id;
  end if;

  delete from public.students where id = p_student_id;
end;
$$;

-- Authenticated clients (the `authenticated` role used by supabase-js with a
-- user JWT) need EXECUTE to call the function via PostgREST/RPC.
grant execute on function public.admin_delete_student(uuid) to authenticated;

-- Revoke from anon to be explicit: only logged-in users should ever call it.
revoke execute on function public.admin_delete_student(uuid) from anon;

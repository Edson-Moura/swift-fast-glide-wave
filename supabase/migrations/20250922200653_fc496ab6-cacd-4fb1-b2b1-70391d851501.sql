-- 1) Function to add the creator as ADMIN member after creating a restaurant
create or replace function public.add_creator_as_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only proceed if request has an authenticated user
  if auth.uid() is null then
    return new;
  end if;

  insert into public.restaurant_members (user_id, restaurant_id, role, is_active)
  values (auth.uid(), new.id, 'admin', true)
  on conflict do nothing;

  return new;
end;
$$;

-- 2) Ensure trigger exists on restaurants
drop trigger if exists tr_add_creator_as_admin on public.restaurants;
create trigger tr_add_creator_as_admin
after insert on public.restaurants
for each row
execute function public.add_creator_as_admin();
-- Fetch a single checkout order by id or human order number (TC-xxxxx).
create or replace function public.tc_get_order(order_ref text, write_key text)
returns setof public.tc_orders
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.tc_assert_write_key(write_key);
  return query
    select *
    from public.tc_orders
    where id = order_ref
       or order_number = order_ref
    limit 1;
end;
$$;

grant execute on function public.tc_get_order(text, text) to anon, authenticated;

-- Abuse limits migration (2026-10-10) — slows down bots and scripts using a real (signed-up) account.
-- Paste the whole file into the Supabase SQL editor and run it once. Safe to re-run.
-- Run this BEFORE redeploying send-new-order-notification and send-ticket-notification, which use
-- the admin_email_sent_at columns added here.
--
-- Staff (is_admin()) and the service role (Edge Functions) are never limited. Customers get:
--   - at most 10 new orders per hour (checkout reuses one order across Paystack retries, so a real
--     customer never gets near this),
--   - at most 5 new support tickets per hour and 30 ticket messages per hour,
--   - photos that must be real images (no SVG) of at most ~1MB, at most 10 per order, attached
--     within 30 minutes of placing the order (the app attaches them straight away),
--   - sensible maximum lengths on names, phones, addresses, ticket text and messages,
-- and the two staff alert emails (new order, new ticket) can only ever be sent once per order/ticket.

-- ── Send-once markers for the staff alert emails ─────────────────────────

alter table orders add column if not exists admin_email_sent_at timestamptz;
alter table complaint_tickets add column if not exists admin_email_sent_at timestamptz;

-- Existing orders/tickets were already announced; mark them so the endpoints can't be replayed on them.
update orders set admin_email_sent_at = created_at where admin_email_sent_at is null;
update complaint_tickets set admin_email_sent_at = created_at where admin_email_sent_at is null;

-- ── Shared helpers ───────────────────────────────────────────────────────

-- True when the current request comes from a signed-in non-staff user — the only callers limited.
create or replace function is_limited_caller() returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and not is_admin();
$$;

-- Accepts base64 data-URL images of a reasonable size. SVG is excluded because it can carry script.
create or replace function is_acceptable_image_data_url(url text) returns boolean
language sql immutable
as $$
  select url ~ '^data:image/(png|jpe?g|gif|webp|heic|heif);base64,' and length(url) <= 1500000;
$$;

-- ── Orders: 10 per hour ──────────────────────────────────────────────────

create or replace function limit_new_orders() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller()
     and (select count(*) from orders where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'You''ve placed a lot of orders in the last hour. Please wait a while and try again, or contact us.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_limit_new_orders on orders;
create trigger trg_limit_new_orders
  before insert on orders
  for each row execute function limit_new_orders();

-- ── Order photos ─────────────────────────────────────────────────────────

create or replace function check_order_image() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if not is_acceptable_image_data_url(new.image_url) then
      raise exception 'Photos must be JPG, PNG, GIF, WebP or HEIC images under 1MB.';
    end if;
    if not exists (select 1 from orders where id = new.order_id and created_at > now() - interval '30 minutes') then
      raise exception 'Photos can only be added while placing an order.';
    end if;
    if (select count(*) from order_images where order_id = new.order_id) >= 10 then
      raise exception 'You can attach up to 10 photos per order.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_order_image on order_images;
create trigger trg_check_order_image
  before insert on order_images
  for each row execute function check_order_image();

-- ── Support tickets: 5 per hour, sane sizes ──────────────────────────────

create or replace function check_new_ticket() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if length(new.subject) > 200 then
      raise exception 'Please keep the subject under 200 characters.';
    end if;
    if length(new.description) > 5000 then
      raise exception 'Please keep the description under 5,000 characters.';
    end if;
    if new.photo_url is not null and not is_acceptable_image_data_url(new.photo_url) then
      raise exception 'Photos must be JPG, PNG, GIF, WebP or HEIC images under 1MB.';
    end if;
    if (select count(*) from complaint_tickets where user_id = new.user_id and created_at > now() - interval '1 hour') >= 5 then
      raise exception 'You''ve opened several tickets in the last hour. Please wait a while, or add to an existing ticket.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_new_ticket on complaint_tickets;
create trigger trg_check_new_ticket
  before insert on complaint_tickets
  for each row execute function check_new_ticket();

-- ── Ticket messages: 30 per hour, sane sizes ─────────────────────────────

create or replace function check_new_ticket_message() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if length(new.message) > 5000 then
      raise exception 'Please keep your message under 5,000 characters.';
    end if;
    if length(new.author_name) > 100 then
      raise exception 'Name is too long.';
    end if;
    if (
      select count(*)
      from ticket_messages m
      join complaint_tickets t on t.id = m.ticket_id
      where t.user_id = auth.uid() and m.author_role = 'customer' and m.created_at > now() - interval '1 hour'
    ) >= 30 then
      raise exception 'You''ve sent a lot of messages in the last hour. Please wait a while before sending more.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_new_ticket_message on ticket_messages;
create trigger trg_check_new_ticket_message
  before insert on ticket_messages
  for each row execute function check_new_ticket_message();

-- ── Profiles: sane sizes on the customer-editable fields ─────────────────

create or replace function check_profile_fields() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if is_limited_caller() then
    if length(new.full_name) > 100 then
      raise exception 'Please keep your name under 100 characters.';
    end if;
    if length(new.phone) > 30 or length(coalesce(new.whatsapp, '')) > 30 then
      raise exception 'Please enter a valid phone number.';
    end if;
    if length(coalesce(new.address, '')) > 500 then
      raise exception 'Please keep your address under 500 characters.';
    end if;
    if length(new.email) > 254 then
      raise exception 'Email address is too long.';
    end if;
  end if;
  return new;
end;
$$;

-- "update of" so staff-only changes (role, notification flags) never trip this.
drop trigger if exists trg_check_profile_fields on profiles;
create trigger trg_check_profile_fields
  before insert or update of full_name, phone, whatsapp, address, email on profiles
  for each row execute function check_profile_fields();

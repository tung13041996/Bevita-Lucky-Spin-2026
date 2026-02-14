# Bevita Lucky Spin 2026 — Deploy chuẩn (kho chung + chặn SĐT)

> Dự án này đã được chỉnh để chạy **kho chung** cho tất cả người dùng bằng:
> - **Netlify Functions** (API)
> - **Supabase Postgres** (lưu quà, lượt quay, trạng thái nhận)

## 1) Tạo Supabase Project
1. Tạo project mới trên Supabase.
2. Vào **SQL Editor** → chạy script bên dưới.

### SQL tạo bảng + RPC (copy nguyên khối)
```sql
-- 1) prizes (kho quà)
create table if not exists prizes (
  id int primary key,
  name text not null,
  color text not null,
  image text,
  qty int not null check (qty >= 0),
  created_at timestamptz default now()
);

-- 2) participants (mỗi SĐT 1 dòng)
create table if not exists participants (
  phone text primary key,
  name text not null,
  is_claimed boolean not null default false,
  selected_prize_id int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) spins (tối đa 3 lần / SĐT)
create table if not exists spins (
  id bigserial primary key,
  phone text not null references participants(phone) on delete cascade,
  spin_index int not null check (spin_index between 1 and 3),
  prize_id int not null references prizes(id),
  created_at timestamptz default now(),
  unique(phone, spin_index)
);

create index if not exists idx_spins_phone on spins(phone);

-- 4) RPC: trừ / cộng qty (atomic)
create or replace function decrement_prize(p_id int)
returns int
language plpgsql
as $$
declare new_qty int;
begin
  update prizes
  set qty = qty - 1
  where id = p_id and qty > 0
  returning qty into new_qty;

  if new_qty is null then
    raise exception 'OUT_OF_STOCK';
  end if;

  return new_qty;
end;
$$;

create or replace function increment_prize(p_id int)
returns int
language plpgsql
as $$
declare new_qty int;
begin
  update prizes
  set qty = qty + 1
  where id = p_id
  returning qty into new_qty;

  return new_qty;
end;
$$;
```

## 2) Seed dữ liệu quà (prizes)
Bạn insert 10 dòng tương ứng `INITIAL_PRIZES`.

Ví dụ (bạn sửa `name/color/image/qty` đúng theo danh sách của bạn):
```sql
insert into prizes (id, name, color, image, qty) values
(1, 'Travel Kit Bruno (SRM, Toner, Kem dưỡng)', '#f87171', '/assets/prizes/1.png', 10),
(2, 'Travel Kit Mceutic (Tẩy trang, SRM, Tonic)', '#fb923c', '/assets/prizes/2.png', 10)
on conflict (id) do update set
  name = excluded.name,
  color = excluded.color,
  image = excluded.image,
  qty = excluded.qty;
```

## 3) Tạo Netlify Site (BẮT BUỘC deploy từ Git hoặc Netlify CLI)
**Không dùng drag & drop** vì kiểu đó không deploy được Functions.

### Cách A — Deploy từ GitHub (khuyên dùng)
1. Push toàn bộ source lên GitHub (bao gồm `netlify/functions` và `netlify.toml`).
2. Netlify → **Add new site** → **Import from Git**.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Cách B — Netlify CLI
```bash
npm i -g netlify-cli
netlify login
netlify link
netlify deploy --build --prod
```

## 4) Set Environment Variables (Netlify)
Netlify Site → **Site configuration** → **Environment variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

> Key này chỉ nằm ở server (Functions), không đưa xuống frontend.

## 5) Test nhanh sau deploy
Mở:
- `https://<your-domain>/.netlify/functions/prizes` → phải ra JSON danh sách quà
- Nhập SĐT và quay thử.

## Logic kho chung hiện tại
- **Trừ qty ngay khi quay** (reserve) để tỉ lệ quay cập nhật ngay cho người khác.
- Khi khách **chọn 1 quà để nhận**, hệ thống **hoàn kho** cho 2 quà còn lại.

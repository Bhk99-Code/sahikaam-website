-- =====================================================================
-- Starter products. Edit titles / prices, then run in SQL Editor.
-- Upload the PDF to Storage > books, and put its path in file_path.
-- =====================================================================

insert into public.products
  (slug, type, title, subtitle, description, price, mrp, badge, cover_color, file_path, pages, highlights, chapters, sort_order)
values
(
  'manufacturing-50',
  'ebook',
  '50 Most Profitable Manufacturing Businesses',
  '₹10 Lakh se ₹1000 Crore tak ka roadmap',
  'Har investment level ke liye manufacturing businesses — machinery, permissions, funding, loan aur subsidy details ke saath, aur ek company ko ₹1000 crore tak le jaane ka roadmap.',
  4999, null, 'NEW', '#C2410C',
  'manufacturing-50.pdf', null,
  '[{"title":"50","text":"Business ideas"},{"title":"Funding","text":"Loan & subsidy details"},{"title":"Lifetime","text":"Access in library"},{"title":"Bonus","text":"₹1,999 course FREE"}]',
  '["₹10–50 Lakh: shuruaati businesses","₹50 Lakh–5 Crore: scale-up units","₹5 Crore+: bade plants","Funding, loan aur subsidy","₹1000 Crore company roadmap"]',
  10
),
(
  'legal-business-andha-paisa',
  'ebook',
  'Legal Business – Andha Paisa',
  '100+ legal business ideas bina investment ke',
  'Brokerage, leasing, labour supply, trading jaise 100+ legal business ideas — execution steps, permissions aur kaam kahan se milega, sab ke saath.',
  1999, null, 'BESTSELLER', '#1E3A5F',
  'legal-business.pdf', null,
  '[{"title":"100+","text":"Business ideas"},{"title":"₹0","text":"Investment ideas"},{"title":"Permissions","text":"Har idea ke saath"},{"title":"Lifetime","text":"Access in library"}]',
  '["Brokerage businesses","Leasing aur rental","Labour supply","Trading","Permissions aur registration"]',
  20
)
on conflict (slug) do nothing;

-- Example launch coupon: 20% off everything, first 100 uses
insert into public.coupons (code, percent_off, max_uses)
values ('LAUNCH20', 20, 100)
on conflict (code) do nothing;

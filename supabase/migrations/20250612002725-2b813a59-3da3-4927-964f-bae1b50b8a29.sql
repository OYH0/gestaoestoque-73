
-- Atualizar o usuário oyh013@gmail.com para ser administrador
UPDATE public.profiles 
SET user_type = 'admin'
WHERE email = 'oyh013@gmail.com';

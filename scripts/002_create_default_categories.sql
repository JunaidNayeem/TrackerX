-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color, is_default) VALUES
    (NEW.id, 'Food & Dining', 'utensils', '#ef4444', true),
    (NEW.id, 'Transportation', 'car', '#f97316', true),
    (NEW.id, 'Shopping', 'shopping-bag', '#eab308', true),
    (NEW.id, 'Entertainment', 'tv', '#22c55e', true),
    (NEW.id, 'Bills & Utilities', 'receipt', '#06b6d4', true),
    (NEW.id, 'Healthcare', 'heart-pulse', '#8b5cf6', true),
    (NEW.id, 'Salary', 'wallet', '#10b981', true),
    (NEW.id, 'Freelance', 'laptop', '#3b82f6', true),
    (NEW.id, 'Other', 'circle', '#6b7280', true);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;

-- Create trigger to auto-create default categories
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();
